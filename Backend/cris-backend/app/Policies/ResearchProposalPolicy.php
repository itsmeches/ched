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
        if ($user->isSuperAdmin() || $user->isCHED()) {
            return true;
        }

        if ($user->isStudent() && $proposal->submitted_by === $user->id) {
            return true;
        }

        $submitter = $proposal->submitter;

        if (! $submitter) {
            return false;
        }

        if ($user->isFaculty()) {
            // Faculty can only access proposals from students directly assigned to them.
            return $submitter->faculty_id === $user->id;
        }

        if ($user->role === User::ROLE_HEI) {
            return (
                $submitter->role === User::ROLE_FACULTY
                && (int) $submitter->hei_id === (int) $user->id
            ) || (
                $submitter->role === User::ROLE_STUDENT
                && (int) ($submitter->faculty?->hei_id ?? 0) === (int) $user->id
            );
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    public function update(User $user, ResearchProposal $proposal): bool
    {
        $hasApprovedPermission = $proposal->editPermissionRequests()
            ->where('requested_by', $user->id)
            ->where('status', 'approved')
            ->exists();

        return $user->isStudent()
            && $proposal->submitted_by === $user->id
            && ($proposal->isEditable() || $hasApprovedPermission);
    }

    public function delete(User $user, ResearchProposal $proposal): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isStudent()
            && $proposal->submitted_by === $user->id
            && $proposal->isEditable();
    }

    public function review(User $user, ResearchProposal $proposal): bool
    {
        if ($user->isSuperAdmin()) {
            return $proposal->isPending();
        }

        $submitter = $proposal->submitter;

        if (! $submitter) {
            return false;
        }

        if ($user->isFaculty()) {
            return $proposal->isPendingFaculty()
                && $submitter->faculty_id === $user->id;
        }

        if ($user->role === User::ROLE_HEI) {
            return $proposal->isPendingHei()
                && (
                    (
                        $submitter->role === User::ROLE_FACULTY
                        && (int) $submitter->hei_id === (int) $user->id
                    ) || (
                        $submitter->role === User::ROLE_STUDENT
                        && (int) ($submitter->faculty?->hei_id ?? 0) === (int) $user->id
                    )
                );
        }

        if ($user->isCHED()) {
            return $proposal->isPendingChed();
        }

        return false;
    }
}
