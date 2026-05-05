<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Super admins can manage any user.
     * All others can only manage users they personally created.
     */
    private function canManage(User $actor, User $target): bool
    {
        if ($actor->isSuperAdmin()) {
            return true;
        }

        return $target->created_by === $actor->id;
    }

    public function update(User $actor, User $target): bool
    {
        // No one can edit their own account through this flow (use profile)
        if ($actor->id === $target->id) {
            return false;
        }

        return $this->canManage($actor, $target);
    }

    public function resetPassword(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return false;
        }

        return $this->canManage($actor, $target);
    }

    public function deactivate(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return false;
        }

        return $this->canManage($actor, $target);
    }

    public function restore(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return false;
        }

        return $this->canManage($actor, $target);
    }
}
