<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * @group authorization-hardening
 */
class ResearchEditLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_hei_cannot_update_after_submission_is_viewed_by_ched(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Polytechnic Institute',
            'code' => 'LPI-' . fake()->unique()->numerify('###'),
        ]);

        /** @var User $hei */
        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        /** @var User $ched */
        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $proposal = $this->makeProposal($institution->id, $hei->id, [
            'title' => 'Locked Submission',
            'viewed_by' => $ched->id,
            'viewed_at' => now(),
        ]);

        $response = $this->actingAs($hei)
            ->put(route('research.update', $proposal->id), $this->validPayload('HEI Attempted Change'));

        $response->assertForbidden();

        $this->assertSame('Locked Submission', $proposal->fresh()->title);
    }

    public function test_ched_cannot_update_when_submission_is_locked(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Batangas State Research Institute',
            'code' => 'BSRI-' . fake()->unique()->numerify('###'),
        ]);

        /** @var User $hei */
        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        /** @var User $ched */
        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $proposal = $this->makeProposal($institution->id, $hei->id, [
            'title' => 'CHED Non Editable Submission',
            'viewed_by' => $ched->id,
            'viewed_at' => now(),
        ]);

        $response = $this->actingAs($ched)
            ->from(route('research.show', $proposal->id))
            ->put(route('research.update', $proposal->id), $this->validPayload('Updated by CHED'));

        $response->assertForbidden();

        $proposal->refresh();

        $this->assertSame('CHED Non Editable Submission', $proposal->title);
        $this->assertDatabaseMissing('research_proposal_histories', [
            'research_proposal_id' => $proposal->id,
            'user_id' => $ched->id,
            'action' => 'updated',
        ]);
    }

    private function validPayload(string $title): array
    {
        return [
            'title' => $title,
            'authors' => 'Primary Author',
            'author_email' => 'author@example.com',
            'author_phone' => '09171234567',
            'co_authors' => 'Co Author',
            'co_author_emails' => 'coauthor@example.com',
            'co_author_phones' => '09179876543',
            'abstract' => 'Updated abstract for policy lock test.',
            'keywords' => 'Policy, Lock',
            'category' => 'Technology',
            'school' => 'Engineering',
            'year' => 2026,
        ];
    }

    private function makeProposal(int $institutionId, int $submitterId, array $overrides = []): ResearchProposal
    {
        return ResearchProposal::query()->create(array_merge([
            'title' => 'Default Proposal',
            'authors' => 'Author One',
            'co_authors' => 'Author Two',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Initial abstract',
            'institution_id' => $institutionId,
            'category' => 'Technology',
            'keywords' => 'AI, Data',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $submitterId,
        ], $overrides));
    }
}
