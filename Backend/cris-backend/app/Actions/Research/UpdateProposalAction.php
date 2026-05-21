<?php

namespace App\Actions\Research;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Services\SimpleNotificationService;
use App\Support\Concerns\InteractsWithProposalMutations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateProposalAction
{
    use InteractsWithProposalMutations;

    /**
     * @param  array<string, mixed>  $data  Validated data from UpdateResearchProposalRequest
     */
    public function __invoke(
        User $actor,
        ResearchProposal $proposal,
        array $data,
        ?UploadedFile $pdfFile = null,
    ): ResearchProposal {
        $hasApprovedPermission = $proposal->editPermissionRequests()
            ->where('requested_by', $actor->id)
            ->where('status', 'approved')
            ->exists();

        $data['category'] = $data['research_category'];
        $data['category_type'] = $this->resolveCategoryType($data['research_category']) ?? $data['category_type'] ?? null;
        $data['discipline_code'] = $data['discipline'];

        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        if ($pdfFile !== null) {
            if ($proposal->file_path) {
                $oldDisk = $this->resolveResearchDisk($proposal->file_path);
                if ($oldDisk) {
                    Storage::disk($oldDisk)->delete($proposal->file_path);
                }
            }
            $data['file_path'] = $pdfFile->store('research_papers', self::RESEARCH_DISK);
        }

        if ($hasApprovedPermission) {
            $data = array_merge($data, [
                'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
                'submitted_at' => now(),
                'reviewed_by' => null,
                'reviewed_at' => null,
                'approved_by' => null,
                'approved_at' => null,
                'approved_by_faculty_at' => null,
                'approved_by_hei_at' => null,
                'approved_by_ched_at' => null,
                'rejected_at' => null,
                'rejected_by' => null,
                'remarks' => null,
                'comments' => null,
                'viewed_by' => null,
                'viewed_at' => null,
            ]);
        }

        unset($data['pdf_file'], $data['discipline']);

        DB::transaction(function () use ($proposal, $data, $actor, $normalizedKeywords) {
            $oldValues = $this->trackedValues($proposal);

            $proposal->update($data);
            $this->syncKeywords($proposal, $normalizedKeywords);

            $newValues = $this->trackedValues($proposal->fresh());
            $this->logHistory($proposal, $actor->id, 'updated', $oldValues, $newValues);
            $this->logResearchHistory($proposal, $actor, 'edited');

            // Consume the approved edit permission so the lock re-engages after this edit
            $proposal->editPermissionRequests()
                ->where('requested_by', $actor->id)
                ->where('status', 'approved')
                ->delete();
        });

        if ($hasApprovedPermission) {
            SimpleNotificationService::notify(
                $actor->faculty_id,
                "Updated submission '{$proposal->title}' was resubmitted and is awaiting your Faculty review.",
                route('research.show', $proposal->id).'#review-decision',
                'review_action_needed'
            );
        }

        $proposal->setAttribute('was_resubmitted', $hasApprovedPermission);

        return $proposal;
    }
}
