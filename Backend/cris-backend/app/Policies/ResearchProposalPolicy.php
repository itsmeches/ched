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

        if ($proposal->submitted_by === $user->id) {
            return true;
        }

        $submitter = $proposal->submitter;

        if (! $submitter) {
            return false;
        }

        if ($user->isFaculty()) {
            // Faculty can view any proposal at the faculty review stage,
            // plus proposals from students linked to them.
            if ($submitter->faculty_id === $user->id) {
                return true;
            }

            // Allow faculty to view faculty-stage proposals
            if (in_array($proposal->status, [
                ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
                ResearchProposal::STATUS_SUBMITTED,
            ])) {
                return true;
            }

            // Fallback for other stages: let faculty who previously rejected re-access
            return $proposal->histories()
                ->where('action', 'rejected')
                ->where('user_id', $user->id)
                ->exists();
        }

        if ($user->role === User::ROLE_HEI) {
            $resolvedHeiId = $submitter->hei_id
                ?? $submitter->faculty?->hei_id
                ?? $submitter->creator?->hei_id;

            $isInstitutionMatch = $submitter->institution_id
                && $user->institution_id
                && (int) $submitter->institution_id === (int) $user->institution_id;

            $isFacultyInstitutionMatch = $submitter->faculty?->institution_id
                && $user->institution_id
                && (int) $submitter->faculty->institution_id === (int) $user->institution_id;

            return $resolvedHeiId === $user->id
                || $submitter->id === $user->id
                || $isInstitutionMatch
                || $isFacultyInstitutionMatch;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    public function update(User $user, ResearchProposal $proposal): bool
    {
        return $user->isStudent()
            && $proposal->submitted_by === $user->id
            && $proposal->isEditable();
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
            // Faculty can review any proposal at the faculty review stage.
            // This allows faculty to review submissions even if students aren't 
            // directly linked to them, supporting institutional workflows.
            return $proposal->isPendingFaculty();
        }

        if ($user->role === User::ROLE_HEI) {
            $resolvedHeiId = $submitter->hei_id
                ?? $submitter->faculty?->hei_id
                ?? $submitter->creator?->hei_id;

            $isInstitutionMatch = $submitter->institution_id
                && $user->institution_id
                && (int) $submitter->institution_id === (int) $user->institution_id;

            $isFacultyInstitutionMatch = $submitter->faculty?->institution_id
                && $user->institution_id
                && (int) $submitter->faculty->institution_id === (int) $user->institution_id;

            return $proposal->isPendingHei()
                && (
                    $resolvedHeiId === $user->id
                    || $submitter->id === $user->id
                    || $isInstitutionMatch
                    || $isFacultyInstitutionMatch
                );
        }

        if ($user->isCHED()) {
            return $proposal->isPendingChed();
        }

        return false;
    }
}
