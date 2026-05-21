<?php

namespace Tests\Feature\Api;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase6RejectionRevisionLoopApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_faculty_rejection_sets_rejected_status_and_student_can_edit_only_when_rejected(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = ResearchProposal::query()->create([
            'title' => 'Rejectable Proposal',
            'authors' => 'Student Author',
            'abstract' => 'Initial draft for review.',
            'institution_id' => $actors['institution']->id,
            'category' => 'Education',
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_by' => $actors['student']->id,
            'submitted_at' => now()->subDay(),
        ]);

        Sanctum::actingAs($actors['faculty']);

        $reviewResponse = $this->postJson("/api/proposals/{$proposal->id}/review", [
            'status' => ResearchProposal::STATUS_REJECTED,
            'comments' => 'Please revise methodology section.',
        ]);

        $reviewResponse->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_REJECTED)
            ->assertJsonPath('proposal.remarks', 'Please revise methodology section.')
            ->assertJsonPath('proposal.rejected_by', $actors['faculty']->id);

        $this->assertDatabaseHas('research_proposals', [
            'id' => $proposal->id,
            'status' => ResearchProposal::STATUS_REJECTED,
            'rejected_by' => $actors['faculty']->id,
            'remarks' => 'Please revise methodology section.',
        ]);

        Sanctum::actingAs($actors['student']);

        $editableResponse = $this->putJson("/api/proposals/{$proposal->id}", [
            'title' => 'Rejectable Proposal Revised',
        ]);

        $editableResponse->assertOk()
            ->assertJsonPath('proposal.title', 'Rejectable Proposal Revised');

        $nonRejectedProposal = ResearchProposal::query()->create([
            'title' => 'Still Under Faculty Review',
            'authors' => 'Student Author',
            'abstract' => 'Cannot be edited under Phase 6.',
            'institution_id' => $actors['institution']->id,
            'category' => 'Education',
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_by' => $actors['student']->id,
            'submitted_at' => now()->subHours(12),
        ]);

        $notEditableResponse = $this->putJson("/api/proposals/{$nonRejectedProposal->id}", [
            'title' => 'Attempted Edit',
        ]);

        $notEditableResponse->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
                'status' => 403,
            ]);
    }

    public function test_student_resubmit_resets_timestamps_and_restarts_from_faculty(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = ResearchProposal::query()->create([
            'title' => 'Rejected Proposal',
            'authors' => 'Student Author',
            'abstract' => 'Needs correction before resubmission.',
            'institution_id' => $actors['institution']->id,
            'category' => 'Technology',
            'status' => ResearchProposal::STATUS_REJECTED,
            'submitted_by' => $actors['student']->id,
            'submitted_at' => now()->subDays(10),
            'reviewed_by' => $actors['ched']->id,
            'reviewed_at' => now()->subDays(2),
            'approved_by' => $actors['ched']->id,
            'approved_at' => now()->subDays(3),
            'approved_by_faculty_at' => now()->subDays(9),
            'approved_by_hei_at' => now()->subDays(8),
            'approved_by_ched_at' => now()->subDays(7),
            'rejected_at' => now()->subDay(),
            'rejected_by' => $actors['ched']->id,
            'remarks' => 'Rewrite results section.',
            'comments' => 'Returned to student.',
            'viewed_by' => $actors['ched']->id,
            'viewed_at' => now()->subDay(),
        ]);

        Sanctum::actingAs($actors['student']);

        $response = $this->postJson("/api/proposals/{$proposal->id}/resubmit");

        $response->assertOk()
            ->assertJsonPath('proposal.status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY);

        $this->assertDatabaseHas('research_proposals', [
            'id' => $proposal->id,
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'reviewed_by' => null,
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

    public function test_faculty_can_view_rejected_submissions_in_api_index(): void
    {
        $actors = $this->makeHierarchy();

        $visible = ResearchProposal::query()->create([
            'title' => 'Rejected Visible To Faculty',
            'authors' => 'Student A',
            'abstract' => 'Rejected in same faculty hierarchy.',
            'institution_id' => $actors['institution']->id,
            'category' => 'Science',
            'status' => ResearchProposal::STATUS_REJECTED,
            'submitted_by' => $actors['student']->id,
            'submitted_at' => now()->subDays(2),
        ]);

        $otherInstitution = Institution::query()->create([
            'name' => 'Quezon External Institute',
            'code' => 'QEI-'.fake()->unique()->numerify('###'),
        ]);

        $otherHei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $otherInstitution->id,
            'ched_id' => $actors['ched']->id,
        ]);

        $otherFaculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $otherInstitution->id,
            'hei_id' => $otherHei->id,
            'ched_id' => $actors['ched']->id,
        ]);

        $otherStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $otherInstitution->id,
            'faculty_id' => $otherFaculty->id,
            'hei_id' => $otherHei->id,
            'ched_id' => $actors['ched']->id,
        ]);

        $hidden = ResearchProposal::query()->create([
            'title' => 'Rejected Hidden From Faculty',
            'authors' => 'Student B',
            'abstract' => 'Rejected in another faculty hierarchy.',
            'institution_id' => $otherInstitution->id,
            'category' => 'Science',
            'status' => ResearchProposal::STATUS_REJECTED,
            'submitted_by' => $otherStudent->id,
            'submitted_at' => now()->subDays(2),
        ]);

        Sanctum::actingAs($actors['faculty']);

        $response = $this->getJson('/api/proposals');

        $response->assertOk()
            ->assertJsonFragment(['id' => $visible->id, 'title' => 'Rejected Visible To Faculty'])
            ->assertJsonMissing(['id' => $hidden->id, 'title' => 'Rejected Hidden From Faculty']);
    }

    /**
     * @return array{institution: Institution, ched: User, hei: User, faculty: User, student: User}
     */
    private function makeHierarchy(): array
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Polytechnic Institute',
            'code' => 'LPI-'.fake()->unique()->numerify('###'),
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
}
