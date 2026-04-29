<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProposalAuditSummaryWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_payload_includes_audit_summary_for_approved_proposal(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = $this->makeProposal($actors['institution']->id, $actors['student']->id, [
            'status' => ResearchProposal::STATUS_APPROVED,
            'reviewed_by' => $actors['ched']->id,
            'approved_by' => $actors['ched']->id,
            'approved_at' => now()->subMinutes(10),
            'remarks' => null,
        ]);

        $response = $this->actingAs($actors['student'])->get(route('research.show', $proposal));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Research/Show')
            ->where('proposal.current_stage', 'Approved')
            ->where('proposal.last_reviewer', $actors['ched']->name)
            ->where('proposal.remarks', null)
            ->where('proposal.last_decision_time', $proposal->approved_at?->toJSON())
        );
    }

    public function test_show_payload_includes_audit_summary_for_rejected_proposal(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = $this->makeProposal($actors['institution']->id, $actors['student']->id, [
            'status' => ResearchProposal::STATUS_REJECTED,
            'reviewed_by' => $actors['faculty']->id,
            'rejected_by' => $actors['faculty']->id,
            'rejected_at' => now()->subMinutes(5),
            'remarks' => 'Please revise the methodology and references.',
        ]);

        $response = $this->actingAs($actors['student'])->get(route('research.show', $proposal));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Research/Show')
            ->where('proposal.current_stage', 'Rejected')
            ->where('proposal.last_reviewer', $actors['faculty']->name)
            ->where('proposal.remarks', 'Please revise the methodology and references.')
            ->where('proposal.last_decision_time', $proposal->rejected_at?->toJSON())
        );
    }

    public function test_show_payload_includes_audit_summary_for_under_review_proposal(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = $this->makeProposal($actors['institution']->id, $actors['student']->id, [
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_HEI,
            'reviewed_by' => $actors['faculty']->id,
            'reviewed_at' => now()->subMinutes(20),
            'remarks' => null,
        ]);

        $response = $this->actingAs($actors['student'])->get(route('research.show', $proposal));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Research/Show')
            ->where('proposal.current_stage', 'Under HEI Review')
            ->where('proposal.last_reviewer', $actors['faculty']->name)
            ->where('proposal.remarks', null)
            ->where('proposal.last_decision_time', $proposal->reviewed_at?->toJSON())
        );
    }

    /**
     * @return array{institution: Institution, ched: User, hei: User, faculty: User, student: User}
     */
    private function makeHierarchy(): array
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna State Polytechnic University',
            'code' => 'LSPU-' . fake()->unique()->numerify('###'),
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

    private function makeProposal(int $institutionId, int $submitterId, array $overrides = []): ResearchProposal
    {
        return ResearchProposal::query()->create(array_merge([
            'title' => 'Audit Summary Test Proposal',
            'authors' => 'Student Author',
            'co_authors' => 'Co Author',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Proposal used for audit summary payload tests.',
            'institution_id' => $institutionId,
            'category' => 'Technology',
            'keywords' => 'Audit, Payload',
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_by' => $submitterId,
            'submitted_at' => now()->subDay(),
        ], $overrides));
    }
}
