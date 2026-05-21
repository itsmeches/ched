<?php

namespace App\Support\Concerns;

use App\Models\Keyword;
use App\Models\ResearchCategory;
use App\Models\ResearchHistory;
use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait InteractsWithProposalMutations
{
    /**
     * Disk used for new research PDF uploads. Private (not symlinked into
     * /public/storage), only served via downloadFile/publicDownloadFile
     * after authorization.
     */
    protected const RESEARCH_DISK = 'research';

    /**
     * Resolve which disk currently holds a research file. Newly uploaded
     * files live on the private 'research' disk; legacy uploads may still
     * be on the 'public' disk until migrated by `php artisan research:migrate-files`.
     */
    protected function resolveResearchDisk(?string $filePath): ?string
    {
        if (! $filePath) {
            return null;
        }
        if (Storage::disk(self::RESEARCH_DISK)->exists($filePath)) {
            return self::RESEARCH_DISK;
        }
        if (Storage::disk('public')->exists($filePath)) {
            return 'public';
        }

        return null;
    }

    protected function safePdfFileName(ResearchProposal $proposal): string
    {
        $slug = Str::slug($proposal->title ?? 'research-paper');

        if ($slug === '') {
            $slug = 'research-paper-'.$proposal->id;
        }

        return $slug.'.pdf';
    }

    /**
     * @return array<int, string>
     */
    protected function parseKeywords(?string $keywords): array
    {
        if (! $keywords) {
            return [];
        }

        $items = array_filter(array_map(
            static fn (string $value) => trim($value),
            explode(',', $keywords),
        ));

        $normalized = [];

        foreach ($items as $item) {
            $key = mb_strtolower($item);

            if (! isset($normalized[$key])) {
                $normalized[$key] = $item;
            }
        }

        return array_values($normalized);
    }

    /**
     * @param  array<int, string>  $keywordNames
     */
    protected function syncKeywords(ResearchProposal $proposal, array $keywordNames): void
    {
        if ($keywordNames === []) {
            $proposal->keywordItems()->sync([]);

            return;
        }

        $keywordIds = [];

        foreach ($keywordNames as $keywordName) {
            $keywordIds[] = Keyword::query()->firstOrCreate(['name' => $keywordName])->id;
        }

        $proposal->keywordItems()->sync(array_values(array_unique($keywordIds)));
    }

    protected function resolveCategoryType(string $categoryValue): ?string
    {
        return ResearchCategory::query()
            ->where('value', $categoryValue)
            ->where('is_active', true)
            ->value('type');
    }

    /** @return array<string, mixed> */
    protected function trackedValues(ResearchProposal $proposal): array
    {
        return $proposal->only([
            'title', 'authors', 'author_email', 'author_phone',
            'co_authors', 'co_author_emails', 'co_author_phones',
            'year', 'school', 'abstract', 'category', 'research_category', 'category_type', 'discipline_code', 'keywords',
            'status', 'comments',
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    protected function logHistory(
        ResearchProposal $proposal,
        ?int $userId,
        string $action,
        ?array $oldValues,
        ?array $newValues,
    ): void {
        // For "updated" entries, only store fields that actually changed
        if ($action === 'updated' && $oldValues !== null && $newValues !== null) {
            $changedOld = [];
            $changedNew = [];

            foreach ($newValues as $key => $newVal) {
                $oldVal = $oldValues[$key] ?? null;
                if ($oldVal !== $newVal) {
                    $changedOld[$key] = $oldVal;
                    $changedNew[$key] = $newVal;
                }
            }

            if ($changedOld === []) {
                return;
            }

            $oldValues = $changedOld;
            $newValues = $changedNew;
        }

        ResearchProposalHistory::create([
            'research_proposal_id' => $proposal->id,
            'user_id' => $userId,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'performed_at' => now(),
        ]);
    }

    protected function logResearchHistory(
        ResearchProposal $proposal,
        ?User $actor,
        string $action,
        ?string $remarks = null,
    ): void {
        ResearchHistory::create([
            'research_id' => $proposal->id,
            'action' => $action,
            'performed_by' => $actor?->id,
            'role' => $actor?->role ?? 'system',
            'remarks' => $remarks,
            'created_at' => now(),
        ]);
    }
}
