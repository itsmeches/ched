<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $role = trim((string) $request->input('role', ''));
        $institutionId = (int) $request->input('institution_id', 0);
        $from = trim((string) $request->input('from', ''));
        $to = trim((string) $request->input('to', ''));

        $roleCounts = User::query()
            ->selectRaw('role, COUNT(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $users = User::with('institution:id,name')
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

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        // Prevent self-delete
        abort_if($user->id === request()->user()?->id, 403, 'Cannot delete your own account.');

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted.');
    }
}
