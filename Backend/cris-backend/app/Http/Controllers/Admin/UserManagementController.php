<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\User;
use App\Models\UserManagementAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserManagementController extends Controller
{
    public function audits(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $action = trim((string) $request->input('action', ''));
        $from = trim((string) $request->input('from', ''));
        $to = trim((string) $request->input('to', ''));

        $audits = UserManagementAudit::query()
            ->with([
                'actor:id,name,email',
                'target' => fn ($query) => $query->withTrashed()->select('id', 'name', 'email', 'role', 'deleted_at'),
            ])
            ->when($action !== '', fn ($q) => $q->where('action', $action))
            ->when($search !== '', fn ($q) =>
                $q->where(function ($inner) use ($search) {
                    $inner->whereHas('actor', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('target', function ($sub) use ($search) {
                        $sub->withTrashed()
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
            )
            ->when($from !== '', fn ($q) => $q->whereDate('performed_at', '>=', $from))
            ->when($to !== '', fn ($q) => $q->whereDate('performed_at', '<=', $to))
            ->orderByDesc('performed_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Users/Audits', [
            'audits' => $audits,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'from' => $from,
                'to' => $to,
            ],
            'actionOptions' => UserManagementAudit::query()
                ->select('action')
                ->distinct()
                ->orderBy('action')
                ->pluck('action')
                ->map(fn ($value) => ['value' => $value, 'label' => str_replace('_', ' ', (string) $value)])
                ->values(),
        ]);
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $role = trim((string) $request->input('role', ''));
        $institutionId = (int) $request->input('institution_id', 0);
        $from = trim((string) $request->input('from', ''));
        $to = trim((string) $request->input('to', ''));
        $showDeactivated = $request->boolean('deactivated', false);

        $baseQuery = $showDeactivated ? User::onlyTrashed() : User::query();

        $roleCounts = User::query()
            ->selectRaw('role, COUNT(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $users = $baseQuery->with('institution:id,name')
            ->when($search !== '', fn ($q) =>
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
            )
            ->when($role !== '', fn ($q) => $q->where('role', $role))
            ->when($institutionId > 0, fn ($q) => $q->where('institution_id', $institutionId))
            ->when($from !== '', fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to !== '', fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'        => $users,
            'institutions' => Institution::select('id', 'name')->get(),
            'filters'      => [
                'search' => $search,
                'role' => $role,
                'institution_id' => $institutionId > 0 ? $institutionId : '',
                'from' => $from,
                'to' => $to,
                'deactivated' => $showDeactivated,
            ],
            'roleCounts'   => [
                'all' => User::count(),
                'pending' => (int) ($roleCounts['pending'] ?? 0),
                'super_admin' => (int) ($roleCounts['super_admin'] ?? 0),
                'ched' => (int) ($roleCounts['ched'] ?? 0),
                'hei' => (int) ($roleCounts['hei'] ?? 0),
                'faculty' => (int) ($roleCounts['faculty'] ?? 0),
                'student' => (int) ($roleCounts['student'] ?? 0),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $search = trim((string) $request->input('search', ''));
        $role = trim((string) $request->input('role', ''));
        $institutionId = (int) $request->input('institution_id', 0);
        $from = trim((string) $request->input('from', ''));
        $to = trim((string) $request->input('to', ''));
        $showDeactivated = $request->boolean('deactivated', false);

        $baseQuery = $showDeactivated ? User::onlyTrashed() : User::query();

        $query = $baseQuery->with('institution:id,name')
            ->when($search !== '', fn ($q) =>
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
            )
            ->when($role !== '', fn ($q) => $q->where('role', $role))
            ->when($institutionId > 0, fn ($q) => $q->where('institution_id', $institutionId))
            ->when($from !== '', fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to !== '', fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->orderByDesc('created_at');

        $fileName = 'users-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Institution', 'Created At', 'Deactivated At']);

            $query->chunkById(500, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->name,
                        $row->email,
                        $row->role,
                        $row->institution?->name,
                        optional($row->created_at)->format('Y-m-d H:i:s'),
                        optional($row->deleted_at ?? null)?->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'institutions' => Institution::select('id', 'name')->get(),
            'roles'        => [
                ['value' => 'pending',     'label' => 'Pending Approval'],
                ['value' => 'hei',         'label' => 'HEI'],
                ['value' => 'faculty',     'label' => 'Faculty'],
                ['value' => 'student',     'label' => 'Student'],
                ['value' => 'ched',        'label' => 'CHED'],
                ['value' => 'super_admin', 'label' => 'Super Admin'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'unique:users,email'],
            'password'       => ['required', 'confirmed', Password::defaults()],
            'role'           => ['required', Rule::in(User::ROLES)],
            'institution_id' => [Rule::requiredIf(fn () => User::requiresInstitutionForRole((string) $request->input('role'))), 'nullable', 'exists:institutions,id'],
            'redirect_to'    => ['nullable', 'in:dashboard,index'],
        ]);

        $institutionId = User::requiresInstitutionForRole($data['role'])
            ? $data['institution_id']
            : null;

        if (in_array($data['role'], [User::ROLE_FACULTY, User::ROLE_STUDENT], true)) {
            return redirect()->back()->withErrors([
                'role' => 'Invalid role linkage: create Faculty/Student via hierarchical account creation to preserve parent links.',
            ])->withInput();
        }

        User::create([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'password'       => Hash::make($data['password']),
            'role'           => $data['role'],
            'institution_id' => $institutionId,
        ]);

        $redirectRoute = ($data['redirect_to'] ?? 'index') === 'dashboard'
            ? 'admin.dashboard'
            : 'admin.users.index';

        return redirect()->route($redirectRoute)
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user'         => $user->only(['id', 'name', 'email', 'role', 'institution_id']),
            'institutions' => Institution::select('id', 'name')->get(),
            'roles'        => [
                ['value' => 'pending',     'label' => 'Pending Approval'],
                ['value' => 'hei',         'label' => 'HEI'],
                ['value' => 'faculty',     'label' => 'Faculty'],
                ['value' => 'student',     'label' => 'Student'],
                ['value' => 'ched',        'label' => 'CHED'],
                ['value' => 'super_admin', 'label' => 'Super Admin'],
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $oldValues = $user->only(['name', 'email', 'role', 'institution_id']);

        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', "unique:users,email,{$user->id}"],
            'role'           => ['required', Rule::in(User::ROLES)],
            'institution_id' => [Rule::requiredIf(fn () => User::requiresInstitutionForRole((string) $request->input('role'))), 'nullable', 'exists:institutions,id'],
            'password'       => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $institutionId = User::requiresInstitutionForRole($data['role'])
            ? $data['institution_id']
            : null;

        if ($data['role'] === User::ROLE_FACULTY && (! $user->hei_id || ! $user->ched_id)) {
            return redirect()->back()->withErrors([
                'role' => 'Invalid role linkage: Faculty accounts must have HEI and CHED links.',
            ])->withInput();
        }

        if ($data['role'] === User::ROLE_STUDENT && (! $user->faculty_id || ! $user->hei_id || ! $user->ched_id)) {
            return redirect()->back()->withErrors([
                'role' => 'Invalid role linkage: Student accounts must have Faculty, HEI, and CHED links.',
            ])->withInput();
        }

        $user->update([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'role'           => $data['role'],
            'institution_id' => $institutionId,
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'admin_user_updated',
            oldValues: $oldValues,
            newValues: $user->only(['name', 'email', 'role', 'institution_id'])
        );

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        // Prevent self-delete
        abort_if($user->id === request()->user()?->id, 403, 'Cannot deactivate your own account.');

        $request = request();
        $oldValues = ['deleted_at' => $user->deleted_at?->toDateTimeString()];

        $user->delete(); // soft delete via SoftDeletes trait

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'admin_user_deactivated',
            oldValues: $oldValues,
            newValues: ['deleted_at' => $user->fresh()?->deleted_at?->toDateTimeString()]
        );

        return redirect()->route('admin.users.index')
            ->with('success', 'User deactivated.');
    }

    public function restore(int $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $request = request();
        $oldValues = ['deleted_at' => $user->deleted_at?->toDateTimeString()];

        $user->restore();

        $this->logUserManagementAudit(
            request: $request,
            target: $user,
            action: 'admin_user_restored',
            oldValues: $oldValues,
            newValues: ['deleted_at' => null]
        );

        return redirect()->route('admin.users.index')
            ->with('success', 'User reactivated.');
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
