<?php

namespace Tests\Feature\Api;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResearchProposalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_hei_can_submit_a_proposal_with_author_fields(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna State College',
            'code' => 'LSC-' . fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        Sanctum::actingAs($hei);

        $response = $this->postJson('/api/proposals', [
            'title' => 'Community Climate Adaptation Framework',
            'authors' => 'Dr. Elisa Cruz',
            'co_authors' => 'Prof. Ramon Dela Cruz',
            'year' => 2026,
            'school' => 'College of Environmental Studies',
            'abstract' => 'A proposal focused on climate adaptation planning for local communities.',
            'category' => 'Environmental',
            'keywords' => 'Climate, Adaptation, Community',
        ]);

        $response->assertCreated()
            ->assertJsonPath('proposal.authors', 'Dr. Elisa Cruz')
            ->assertJsonPath('proposal.institution.id', $institution->id);

        $this->assertDatabaseHas('research_proposals', [
            'title' => 'Community Climate Adaptation Framework',
            'authors' => 'Dr. Elisa Cruz',
            'co_authors' => 'Prof. Ramon Dela Cruz',
            'institution_id' => $institution->id,
            'submitted_by' => $hei->id,
            'status' => ResearchProposal::STATUS_PENDING,
        ]);
    }

    public function test_hei_only_sees_their_own_proposals_in_api_index(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Cavite Research University',
            'code' => 'CRU-' . fake()->unique()->numerify('###'),
        ]);

        $otherInstitution = Institution::query()->create([
            'name' => 'Batangas Science Institute',
            'code' => 'BSI-' . fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $otherHei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $otherInstitution->id,
        ]);

        ResearchProposal::query()->create([
            'title' => 'Visible Proposal',
            'authors' => 'Researcher One',
            'abstract' => 'Visible to the acting HEI.',
            'institution_id' => $institution->id,
            'category' => 'Education',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $hei->id,
        ]);

        ResearchProposal::query()->create([
            'title' => 'Hidden Proposal',
            'authors' => 'Researcher Two',
            'abstract' => 'Should not appear for another HEI.',
            'institution_id' => $otherInstitution->id,
            'category' => 'Technology',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $otherHei->id,
        ]);

        Sanctum::actingAs($hei);

        $response = $this->getJson('/api/proposals');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Visible Proposal');
    }

    public function test_ched_can_review_a_pending_proposal_via_api(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Rizal Innovation University',
            'code' => 'RIU-' . fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $proposal = ResearchProposal::query()->create([
            'title' => 'Pending Decision Proposal',
            'authors' => 'Research Lead',
            'abstract' => 'Awaiting CHED review.',
            'institution_id' => $institution->id,
            'category' => 'Technology',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $hei->id,
        ]);

        Sanctum::actingAs($ched);

        $response = $this->postJson("/api/proposals/{$proposal->id}/review", [
            'status' => ResearchProposal::STATUS_APPROVED,
            'comments' => 'Ready for implementation review.',
        ]);

        $response->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_APPROVED)
            ->assertJsonPath('proposal.comments', 'Ready for implementation review.');

        $this->assertDatabaseHas('research_proposals', [
            'id' => $proposal->id,
            'status' => ResearchProposal::STATUS_APPROVED,
            'comments' => 'Ready for implementation review.',
            'reviewed_by' => $ched->id,
        ]);
    }

    public function test_hei_cannot_review_a_proposal_via_api(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Policy University',
            'code' => 'LPU-' . fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $proposal = ResearchProposal::query()->create([
            'title' => 'Unauthorized Review Attempt',
            'authors' => 'Policy Lead',
            'abstract' => 'Should not be reviewable by HEI users.',
            'institution_id' => $institution->id,
            'category' => 'Education',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $hei->id,
        ]);

        Sanctum::actingAs($hei);

        $response = $this->postJson("/api/proposals/{$proposal->id}/review", [
            'status' => ResearchProposal::STATUS_APPROVED,
        ]);

        $response->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
                'status' => 403,
            ]);
    }

    public function test_reviewing_a_non_pending_proposal_returns_standardized_validation_error(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Batangas Review College',
            'code' => 'BRC-' . fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $proposal = ResearchProposal::query()->create([
            'title' => 'Already Approved Proposal',
            'authors' => 'Research Lead',
            'abstract' => 'This proposal already has a decision.',
            'institution_id' => $institution->id,
            'category' => 'Technology',
            'status' => ResearchProposal::STATUS_APPROVED,
            'submitted_by' => $hei->id,
        ]);

        Sanctum::actingAs($ched);

        $response = $this->postJson("/api/proposals/{$proposal->id}/review", [
            'status' => ResearchProposal::STATUS_REJECTED,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The provided data is invalid.',
                'status' => 422,
            ])
            ->assertJsonPath('errors.proposal.0', 'Only pending proposals can be reviewed.');
    }
}