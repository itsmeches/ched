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
        return $proposal->submitted_by === $user->id
            && $proposal->isEditable();
    }

    public function delete(User $user, ResearchProposal $proposal): bool
    {
        return ($proposal->submitted_by === $user->id && $proposal->isEditable())
            || $user->isSuperAdmin();
    }

    public function review(User $user, ResearchProposal $proposal): bool
    {
        return $user->isCHED() || $user->isSuperAdmin();
    }

    public function submit(User $user, ResearchProposal $proposal): bool
    {
        return $proposal->submitted_by === $user->id
            && $proposal->status === ResearchProposal::STATUS_DRAFT;
    }
}
