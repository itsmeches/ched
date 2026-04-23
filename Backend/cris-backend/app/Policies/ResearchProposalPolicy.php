<?php

namespace App\Policies;

use App\Models\ResearchProposal;
use App\Models\User;

class ResearchProposalPolicy
{
    /** Any authenticated user can view the list (filtered by role in controller). */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ResearchProposal $proposal): bool
    {
        return $user->isSuperAdmin()
            || $user->isCHED()
            || $proposal->submitted_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isHEI();
    }

    public function update(User $user, ResearchProposal $proposal): bool
    {
        if ($user->isCHED()) {
            return true;
        }

        if ($proposal->submitted_by !== $user->id) {
            return false;
        }

        // isEditable() now also checks for an approved edit permission
        return $proposal->isEditable();
    }

    public function delete(User $user, ResearchProposal $proposal): bool
    {
        return ($proposal->submitted_by === $user->id && $proposal->isEditable())
            || $user->isCHED()
            || $user->isSuperAdmin();
    }

    public function review(User $user, ResearchProposal $proposal): bool
    {
        return $user->isCHED();
    }
}
