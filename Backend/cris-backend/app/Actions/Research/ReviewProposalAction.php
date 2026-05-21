<?php

namespace App\Actions\Research;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Notifications\ResearchProposalReviewed;
use App\Services\SimpleNotificationService;
use App\Support\Concerns\InteractsWithProposalMutations;
use Illuminate\Support\Facades\DB;

class ReviewProposalAction
{
    use InteractsWithProposalMutations;

    /**
     * Execute a faculty/HEI/CHED/super-admin review decision.
     *
     * @param  string  $decision  'approve' or 'reject'
     */
    public function __invoke(
        User $reviewer,
        ResearchProposal $proposal,
        string $decision,
        ?string $comments,
    ): ResearchProposal {
        $nextStatus = ResearchProposal::STATUS_REJECTED;
        $isFinalApproval = false;
        $approvedByFacultyAt = $proposal->approved_by_faculty_at;
        $approvedByHeiAt = $proposal->approved_by_hei_at;
        $approvedByChedAt = $proposal->approved_by_ched_at;
        $rejectedAt = null;
        $rejectedBy = null;
        $remarks = null;

        if ($decision === 'approve') {
            if ($reviewer->isFaculty()) {
                $approvedByFacultyAt = now();
            } elseif ($reviewer->role === User::ROLE_HEI) {
                $approvedByHeiAt = now();
            } elseif ($reviewer->isCHED()) {
                $approvedByChedAt = now();
            }

            if ($proposal->isPendingFaculty()) {
                $nextStatus = ResearchProposal::STATUS_UNDER_REVIEW_HEI;
            } elseif ($proposal->isPendingHei()) {
                $nextStatus = ResearchProposal::STATUS_UNDER_REVIEW_CHED;
            } elseif ($proposal->isPendingChed()) {
                $nextStatus = ResearchProposal::STATUS_APPROVED;
                $isFinalApproval = true;
            }
        } else {
            $rejectedAt = now();
            $rejectedBy = $reviewer->id;
            $remarks = $comments;
            $nextStatus = ResearchProposal::STATUS_REJECTED;
        }

        DB::transaction(function () use (
            $proposal, $reviewer, $decision, $comments, $nextStatus,
            $isFinalApproval, $approvedByFacultyAt, $approvedByHeiAt, $approvedByChedAt,
            $rejectedAt, $rejectedBy, $remarks,
        ) {
            $proposal->update([
                'status' => $nextStatus,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'approved_by' => $isFinalApproval ? $reviewer->id : null,
                'approved_at' => $isFinalApproval ? now() : null,
                'approved_by_faculty_at' => $approvedByFacultyAt,
                'approved_by_hei_at' => $approvedByHeiAt,
                'approved_by_ched_at' => $approvedByChedAt,
                'rejected_at' => $rejectedAt,
                'rejected_by' => $rejectedBy,
                'remarks' => $remarks,
                'comments' => $comments,
            ]);

            $this->logHistory($proposal, $reviewer->id, $decision === 'approve' ? 'approved' : 'rejected', null, [
                'status' => $proposal->status,
                'comments' => $proposal->comments,
            ]);
            $this->logResearchHistory(
                $proposal,
                $reviewer,
                $decision === 'approve' ? 'approved' : 'rejected',
                $decision === 'reject' ? (string) $comments : null,
            );
        });

        $submitter = $proposal->submitter;

        if ($decision === 'approve') {
            if ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_HEI) {
                SimpleNotificationService::notify(
                    $submitter?->hei_id,
                    "Submission '{$proposal->title}' is now awaiting HEI review.",
                    route('research.show', $proposal->id).'#review-decision',
                    'review_action_needed'
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_CHED) {
                SimpleNotificationService::notify(
                    $submitter?->ched_id,
                    "Submission '{$proposal->title}' is now awaiting CHED review.",
                    route('research.show', $proposal->id).'#review-decision',
                    'review_action_needed'
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_APPROVED) {
                SimpleNotificationService::notify(
                    $submitter?->id,
                    "Your submission '{$proposal->title}' was approved.",
                    route('research.show', $proposal->id).'#research-actions',
                    'research_approved'
                );
            }
        } else {
            SimpleNotificationService::notify(
                $submitter?->id,
                "Your submission '{$proposal->title}' was rejected.",
                route('research.show', $proposal->id).'#reviewer-comments',
                'research_rejected'
            );
        }

        $proposal->loadMissing('submitter:id,name,email');

        if ($proposal->submitter && $proposal->submitter->email) {
            $proposal->submitter->notify(new ResearchProposalReviewed($proposal));
        }

        $proposal->setAttribute('is_final_approval', $isFinalApproval);
        $proposal->setAttribute('decision', $decision);

        return $proposal;
    }
}
