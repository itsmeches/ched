<?php

namespace Tests\Feature\Api;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkflowConfidenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_end_to_end_approval_pipeline_moves_from_faculty_to_hei_to_ched_to_approved(): void
    {
        $actors = $this->makeHierarchy();

        Sanctum::actingAs($actors['student']);

        $submitResponse = $this->postJson('/api/proposals', $this->proposalPayload([
            'title' => 'Pipeline Approval Proposal',
        ]));

        $submitResponse->assertCreated()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY);

        $proposalId = (int) $submitResponse->json('proposal.id');

        Sanctum::actingAs($actors['faculty']);

        $facultyResponse = $this->postJson("/api/proposals/{$proposalId}/review", [
            'status' => ResearchProposal::STATUS_APPROVED,
            'comments' => 'Faculty approved.',
        ]);

        $facultyResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)
            ->assertJsonPath('proposal.approved_by_faculty_at', fn ($value) => ! empty($value));

        Sanctum::actingAs($actors['hei']);

        $heiResponse = $this->postJson("/api/proposals/{$proposalId}/review", [
            'status' => ResearchProposal::STATUS_APPROVED,
            'comments' => 'HEI approved.',
        ]);

        $heiResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)
            ->assertJsonPath('proposal.approved_by_hei_at', fn ($value) => ! empty($value));

        Sanctum::actingAs($actors['ched']);

        $chedResponse = $this->postJson("/api/proposals/{$proposalId}/review", [
            'status' => ResearchProposal::STATUS_APPROVED,
            'comments' => 'CHED final approval.',
        ]);

        $chedResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_APPROVED)
            ->assertJsonPath('proposal.approved_by', $actors['ched']->id)
            ->assertJsonPath('proposal.approved_by_ched_at', fn ($value) => ! empty($value));
    }

    public function test_reject_revise_resubmit_loop_routes_back_to_faculty(): void
    {
        $actors = $this->makeHierarchy();

        Sanctum::actingAs($actors['student']);

        $submitResponse = $this->postJson('/api/proposals', $this->proposalPayload([
            'title' => 'Reject Revise Resubmit Proposal',
        ]));

        $submitResponse->assertCreated();
        $proposalId = (int) $submitResponse->json('proposal.id');

        Sanctum::actingAs($actors['faculty']);

        $rejectResponse = $this->postJson("/api/proposals/{$proposalId}/review", [
            'status' => ResearchProposal::STATUS_REJECTED,
            'comments' => 'Please revise your methodology.',
        ]);

        $rejectResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_REJECTED)
            ->assertJsonPath('proposal.remarks', 'Please revise your methodology.');

        Sanctum::actingAs($actors['student']);

        $updateResponse = $this->putJson("/api/proposals/{$proposalId}", [
            'title' => 'Reject Revise Resubmit Proposal - Revised',
        ]);

        $updateResponse->assertOk()
            ->assertJsonPath('proposal.title', 'Reject Revise Resubmit Proposal - Revised');

        $resubmitResponse = $this->postJson("/api/proposals/{$proposalId}/resubmit");

        $resubmitResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)
            ->assertJsonPath('proposal.remarks', null)
            ->assertJsonPath('proposal.rejected_by', null);
    }

    public function test_submit_rejects_whitespace_only_title(): void
    {
        $actors = $this->makeHierarchy();

        Sanctum::actingAs($actors['student']);

        $response = $this->postJson('/api/proposals', $this->proposalPayload([
            'title' => '     ',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_submit_rejects_missing_institution_link(): void
    {
        $actors = $this->makeHierarchy();
        $actors['student']->forceFill(['institution_id' => null])->save();

        Sanctum::actingAs($actors['student']);

        $response = $this->postJson('/api/proposals', $this->proposalPayload([
            'title' => 'Missing Institution Guardrail',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['institution_id']);
    }

    public function test_submit_rejects_missing_role_linkage(): void
    {
        $actors = $this->makeHierarchy();
        $actors['student']->forceFill([
            'faculty_id' => null,
            'hei_id' => null,
            'ched_id' => null,
        ])->save();

        Sanctum::actingAs($actors['student']);

        $response = $this->postJson('/api/proposals', $this->proposalPayload([
            'title' => 'Missing Linkage Guardrail',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_linkage']);
    }

    /**
     * @return array{institution: Institution, ched: User, hei: User, faculty: User, student: User}
     */
    private function makeHierarchy(): array
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Workflow University',
            'code' => 'LWU-'.fake()->unique()->numerify('###'),
        ]);

        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
            'ched_id' => $ched->id,
        ]);

        $faculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        return compact('institution', 'ched', 'hei', 'faculty', 'student');
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function proposalPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Default Workflow Proposal',
            'abstract' => 'A feature test proposal payload for workflow confidence checks.',
            'authors' => 'Student Author',
            'co_authors' => 'Co Author',
            'year' => 2026,
            'school' => 'College of Engineering',
            'category' => 'Technology',
            'keywords' => 'Workflow, Confidence',
        ], $overrides);
    }
}
