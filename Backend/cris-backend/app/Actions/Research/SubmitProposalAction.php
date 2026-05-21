<?php

namespace App\Actions\Research;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Services\SimpleNotificationService;
use App\Support\Concerns\InteractsWithProposalMutations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class SubmitProposalAction
{
    use InteractsWithProposalMutations;

    /**
     * @param  array<string, mixed>  $data  Validated data from StoreResearchProposalRequest
     */
    public function __invoke(User $actor, array $data, ?UploadedFile $pdfFile = null): ResearchProposal
    {
        $data['category'] = $data['research_category'];
        $data['category_type'] = $this->resolveCategoryType($data['research_category']) ?? $data['category_type'] ?? null;
        $data['discipline_code'] = $data['discipline'];

        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        if ($pdfFile !== null) {
            $data['file_path'] = $pdfFile->store('research_papers', self::RESEARCH_DISK);
        }

        unset($data['pdf_file'], $data['discipline']);

        $proposal = DB::transaction(function () use ($data, $actor, $normalizedKeywords) {
            $proposal = ResearchProposal::create([
                ...$data,
                'submitted_by' => $actor->id,
                'submitted_at' => now(),
                'institution_id' => $actor->institution_id,
                'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            ]);

            $this->syncKeywords($proposal, $normalizedKeywords);
            $this->logHistory($proposal, $actor->id, 'created', null, $this->trackedValues($proposal));
            $this->logResearchHistory($proposal, $actor, 'submitted');

            return $proposal;
        });

        SimpleNotificationService::notify(
            $actor->faculty_id,
            "New submission '{$proposal->title}' is waiting for your review.",
            route('research.show', $proposal->id).'#review-decision',
            'review_action_needed'
        );

        return $proposal;
    }
}
