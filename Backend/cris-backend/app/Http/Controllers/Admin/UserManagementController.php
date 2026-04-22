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
        $users = User::with('institution:id,name')
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
            )
            ->when($request->role, fn ($q, $r) => $q->where('role', $r))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'        => $users,
            'institutions' => Institution::select('id', 'name')->get(),
            'filters'      => $request->only(['search', 'role']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'institutions' => Institution::select('id', 'name')->get(),
            'roles'        => [
                ['value' => 'pending',     'label' => 'Pending Approval'],
                ['value' => 'hei',         'label' => 'HEI'],
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
            'role'           => ['required', 'in:pending,hei,ched,super_admin'],
            'institution_id' => [Rule::requiredIf(fn () => $request->input('role') === 'hei'), 'nullable', 'exists:institutions,id'],
            'redirect_to'    => ['nullable', 'in:dashboard,index'],
        ]);

        $institutionId = $data['role'] === 'hei'
            ? $data['institution_id']
            : null;

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
            'role'           => ['required', 'in:pending,hei,ched,super_admin'],
            'institution_id' => [Rule::requiredIf(fn () => $request->input('role') === 'hei'), 'nullable', 'exists:institutions,id'],
            'password'       => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $institutionId = $data['role'] === 'hei'
            ? $data['institution_id']
            : null;

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
