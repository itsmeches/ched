<?php

namespace App\Policies;

use App\Models\Institution;
use App\Models\User;

class InstitutionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isCHED() || $user->isSuperAdmin();
    }

    public function view(User $user, Institution $institution): bool
    {
        return $user->isCHED() || $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Institution $institution): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Institution $institution): bool
    {
        return $user->isSuperAdmin();
    }
}
