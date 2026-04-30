<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\User;
use App\Models\UserManagementAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class HierarchicalAccountController extends Controller
{
    public function hierarchy(Request $request): Response|RedirectResponse
    {
        $viewer = $request->user();

        if (! $viewer || ! in_array($viewer->role, [User::ROLE_CHED, User::ROLE_HEI, User::ROLE_FACULTY], true)) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account cannot access hierarchy tracking.');
        }

        return Inertia::render('Accounts/Hierarchy', [
            'viewerRole' => $viewer->role,
            'tabs' => $this->hierarchyTabs($viewer),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $creator = $request->user();
        $targetRole = $creator?->creatableRole();

        if (! $creator || ! $targetRole) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account cannot create subordinate users.');
        }

        $requiresInstitution = User::requiresInstitutionForRole($targetRole);

        return Inertia::render('Accounts/Create', [
            'creatorRole' => $creator->role,
            'targetRole' => $targetRole,
            'targetRoleLabel' => $this->roleLabel($targetRole),
            'requiresInstitutionSelection' => $creator->isCHED() && $targetRole === User::ROLE_HEI,
            'institutionName' => $creator->institution?->name,
            'institutions' => $creator->isCHED() && $requiresInstitution
                ? Institution::query()->orderBy('name')->get(['id', 'name', 'code'])
                : [],
            'hierarchyTabs' => $this->hierarchyTabs($creator),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $creator = $request->user();
        $targetRole = $creator?->creatableRole();

        if (! $creator || ! $targetRole) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account cannot create subordinate users.');
        }

        $requiresInstitutionSelection = $creator->isCHED() && $targetRole === User::ROLE_HEI;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'institution_id' => [
                $requiresInstitutionSelection ? 'required' : 'nullable',
                'nullable',
                'exists:institutions,id',
            ],
        ]);

        $institutionId = $requiresInstitutionSelection
            ? (int) $data['institution_id']
            : $creator->institution_id;

        if (User::requiresInstitutionForRole($targetRole) && ! $institutionId) {
            return redirect()->back()->withErrors([
                'institution_id' => 'An institution is required for this account type.',
            ]);
        }

        $heiId = null;
        $facultyId = null;
        $chedId = null;

        if ($targetRole === User::ROLE_HEI) {
            $chedId = $creator->id;
        }

        if ($targetRole === User::ROLE_FACULTY) {
            $heiId = $creator->id;
            $chedId = $creator->ched_id ?: User::query()
                ->where('id', $creator->created_by)
                ->where('role', User::ROLE_CHED)
                ->value('id');
        }

        if ($targetRole === User::ROLE_STUDENT) {
            $facultyId = $creator->id;
            $heiId = $creator->hei_id
                ?: User::query()
                    ->where('id', $creator->created_by)
                    ->where('role', User::ROLE_HEI)
                    ->value('id');

            if (! $heiId && $creator->institution_id) {
                $heiId = User::query()
                    ->where('role', User::ROLE_HEI)
                    ->where('institution_id', $creator->institution_id)
                    ->orderBy('id')
                    ->value('id');
            }

            $chedId = $creator->ched_id;

            if (! $chedId && $heiId) {
                $chedId = User::query()->where('id', $heiId)->value('ched_id');
            }

            if (! $chedId) {
                $chedId = User::query()
                    ->where('id', $creator->created_by)
                    ->where('role', User::ROLE_HEI)
                    ->value('ched_id');
            }
        }

        if ($targetRole === User::ROLE_HEI && ! $chedId) {
            return redirect()->back()->withErrors([
                'role_linkage' => 'Invalid role linkage: HEI accounts must be linked to a CHED account.',
            ])->withInput();
        }

        if ($targetRole === User::ROLE_FACULTY && (! $heiId || ! $chedId)) {
            return redirect()->back()->withErrors([
                'role_linkage' => 'Invalid role linkage: Faculty accounts must be linked to both HEI and CHED accounts.',
            ])->withInput();
        }

        if ($targetRole === User::ROLE_STUDENT && (! $facultyId || ! $heiId || ! $chedId)) {
            return redirect()->back()->withErrors([
                'role_linkage' => 'Invalid role linkage: Student accounts must be linked to Faculty, HEI, and CHED accounts.',
            ])->withInput();
        }

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $targetRole,
            'institution_id' => $institutionId,
            'created_by' => $creator->id,
            'hei_id' => $heiId,
            'faculty_id' => $facultyId,
            'ched_id' => $chedId,
        ]);

        return redirect()->route('accounts.create')
            ->with('success', $this->roleLabel($targetRole) . ' account created successfully.');
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            User::ROLE_HEI => 'HEI',
            User::ROLE_FACULTY => 'Faculty',
            User::ROLE_STUDENT => 'Student',
            default => ucfirst(str_replace('_', ' ', $role)),
        };
    }

    private function hierarchyTabs(User $creator): array
    {
        if ($creator->isCHED()) {
            $rows = User::withTrashed()
                ->with('institution:id,name')
                ->where('role', User::ROLE_HEI)
                ->where('ched_id', $creator->id)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'institution_id', 'created_by', 'created_at', 'deleted_at']);

            $rows->transform(function (User $row) use ($creator) {
                $row->setAttribute('parent_label', 'CHED');
                $row->setAttribute('can_manage', $row->created_by === $creator->id);
                return $row;
            });

            return [[
                'key' => 'hei',
                'label' => 'HEI Accounts',
                'description' => 'HEI accounts linked under your CHED account.',
                'rows' => $rows,
            ]];
        }

        if ($creator->role === User::ROLE_HEI) {
            $facultyRows = User::withTrashed()
                ->with('institution:id,name')
                ->where('role', User::ROLE_FACULTY)
                ->where('hei_id', $creator->id)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'institution_id', 'created_by', 'created_at', 'deleted_at']);

            $facultyRows->transform(function (User $row) use ($creator) {
                $row->setAttribute('parent_label', 'HEI');
                $row->setAttribute('can_manage', $row->created_by === $creator->id);
                return $row;
            });

            $studentsRows = User::withTrashed()
                ->with(['institution:id,name', 'faculty:id,name'])
                ->where('role', User::ROLE_STUDENT)
                ->where(function ($query) use ($creator) {
                    $query->where('hei_id', $creator->id)
                        ->orWhereHas('faculty', fn ($faculty) => $faculty->where('hei_id', $creator->id));
                })
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'institution_id', 'faculty_id', 'created_by', 'created_at', 'deleted_at']);

            $studentsRows->transform(function (User $row) use ($creator) {
                $row->setAttribute('parent_label', $row->faculty?->name ?? 'Unknown Faculty');
                $row->setAttribute('can_manage', $row->created_by === $creator->id);
                return $row;
            });

            return [
                [
                    'key' => 'faculty',
                    'label' => 'Faculty Accounts',
                    'description' => 'Faculty accounts linked under your HEI account.',
                    'rows' => $facultyRows,
                ],
                [
                    'key' => 'student',
                    'label' => 'Student Accounts',
                    'description' => 'Students under faculty accounts linked to your HEI account.',
                    'rows' => $studentsRows,
                ],
            ];
        }

        if ($creator->isFaculty()) {
            $rows = User::withTrashed()
                ->with('institution:id,name')
                ->where('role', User::ROLE_STUDENT)
                ->where('faculty_id', $creator->id)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'institution_id', 'created_by', 'created_at', 'deleted_at']);

            $rows->transform(function (User $row) use ($creator) {
                $row->setAttribute('parent_label', $creator->name);
                $row->setAttribute('can_manage', $row->created_by === $creator->id);
                return $row;
            });

            return [[
                'key' => 'student',
                'label' => 'Student Accounts',
                'description' => 'Student accounts linked under your faculty account.',
                'rows' => $rows,
            ]];
        }

        return [];
    }

    public function edit(Request $request, User $user): Response|RedirectResponse
    {
        Gate::authorize('update', $user);

        return Inertia::render('Accounts/Edit', [
            'account' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $oldValues = $user->only(['name', 'email']);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
        ]);

        $user->update($data);

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'hierarchy_account_updated',
            oldValues: $oldValues,
            newValues: $user->only(['name', 'email'])
        );

        return redirect()->route('accounts.hierarchy')
            ->with('success', 'Account updated successfully.');
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('resetPassword', $user);

        $data = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update(['password' => Hash::make($data['password'])]);

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'hierarchy_password_reset',
            oldValues: null,
            newValues: ['password_reset' => true]
        );

        return redirect()->route('accounts.hierarchy')
            ->with('success', 'Password reset successfully.');
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('deactivate', $user);

        $oldValues = ['deleted_at' => $user->deleted_at?->toDateTimeString()];

        $user->delete(); // soft delete

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'hierarchy_account_deactivated',
            oldValues: $oldValues,
            newValues: ['deleted_at' => $user->fresh()?->deleted_at?->toDateTimeString()]
        );

        return redirect()->route('accounts.hierarchy')
            ->with('success', 'Account deactivated successfully.');
    }

    private function logUserManagementAudit(
        Request $request,
        User $target,
        string $action,
        ?array $oldValues,
        ?array $newValues
    ): void {
        UserManagementAudit::create([
            'actor_user_id' => $request->user()?->id,
            'target_user_id' => $target->id,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'performed_at' => now(),
        ]);
    }
}
