<?php

namespace Tests\Feature;

use App\Models\EditPermissionRequest;
use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Covers the EditPermissionController flow: students requesting edits on
 * locked proposals, CHED approving/denying, and the lock + duplicate-request
 * guards.
 *
 * @group authorization-hardening
 */
class EditPermissionWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_request_edit_permission_when_proposal_is_locked(): void
    {
        [$student, $proposal, $ched] = $this->lockedScenario(ResearchProposal::STATUS_REJECTED);

        $response = $this->actingAs($student)
            ->from(route('research.show', $proposal))
            ->post(route('research.edit-permission.store', $proposal), [
                'reason' => 'Need to fix typo.',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('edit_permission_requests', [
            'research_proposal_id' => $proposal->id,
            'requested_by' => $student->id,
            'status' => 'pending',
            'reason' => 'Need to fix typo.',
        ]);
    }

    public function test_student_cannot_request_edit_when_proposal_not_locked(): void
    {
        $institution = Institution::factory()->create();
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
        ]);

        // Under faculty review with no view stamp = not locked
        $proposal = ResearchProposal::factory()->pendingFaculty()->create([
            'institution_id' => $institution->id,
            'submitted_by' => $student->id,
        ]);

        $response = $this->actingAs($student)
            ->from(route('research.show', $proposal))
            ->post(route('research.edit-permission.store', $proposal), [
                'reason' => 'Want to tweak.',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('edit_permission_requests', 0);
    }

    public function test_duplicate_pending_request_is_blocked(): void
    {
        [$student, $proposal] = $this->lockedScenario(ResearchProposal::STATUS_REJECTED);

        EditPermissionRequest::query()->create([
            'research_proposal_id' => $proposal->id,
            'requested_by' => $student->id,
            'status' => 'pending',
        ]);

        $this->actingAs($student)
            ->from(route('research.show', $proposal))
            ->post(route('research.edit-permission.store', $proposal), [
                'reason' => 'Second attempt.',
            ])
            ->assertRedirect();

        $this->assertSame(1, EditPermissionRequest::query()->count());
    }

    public function test_ched_can_approve_pending_request(): void
    {
        [$student, $proposal, $ched] = $this->lockedScenario(ResearchProposal::STATUS_REJECTED);

        $editRequest = EditPermissionRequest::query()->create([
            'research_proposal_id' => $proposal->id,
            'requested_by' => $student->id,
            'status' => 'pending',
        ]);

        $this->actingAs($ched)
            ->from(route('research.show', $proposal))
            ->post(
                route('research.edit-permission.decide', ['proposal' => $proposal, 'editRequest' => $editRequest]),
                ['decision' => 'approved']
            )
            ->assertRedirect();

        $editRequest->refresh();
        $this->assertSame('approved', $editRequest->status);
        $this->assertSame($ched->id, $editRequest->decided_by);
        $this->assertNotNull($editRequest->decided_at);
    }

    public function test_non_ched_cannot_decide_request(): void
    {
        [$student, $proposal] = $this->lockedScenario(ResearchProposal::STATUS_REJECTED);

        $faculty = User::factory()->create(['role' => User::ROLE_FACULTY]);

        $editRequest = EditPermissionRequest::query()->create([
            'research_proposal_id' => $proposal->id,
            'requested_by' => $student->id,
            'status' => 'pending',
        ]);

        $this->actingAs($faculty)
            ->post(
                route('research.edit-permission.decide', ['proposal' => $proposal, 'editRequest' => $editRequest]),
                ['decision' => 'approved']
            )
            ->assertForbidden();

        $this->assertSame('pending', $editRequest->fresh()->status);
    }

    public function test_already_decided_request_cannot_be_redecided(): void
    {
        [$student, $proposal, $ched] = $this->lockedScenario(ResearchProposal::STATUS_APPROVED);

        $editRequest = EditPermissionRequest::query()->create([
            'research_proposal_id' => $proposal->id,
            'requested_by' => $student->id,
            'status' => 'denied',
            'decided_by' => $ched->id,
            'decided_at' => now()->subHour(),
        ]);

        $this->actingAs($ched)
            ->from(route('research.show', $proposal))
            ->post(
                route('research.edit-permission.decide', ['proposal' => $proposal, 'editRequest' => $editRequest]),
                ['decision' => 'approved']
            )
            ->assertRedirect();

        $this->assertSame('denied', $editRequest->fresh()->status);
    }

    /**
     * @return array{0: User, 1: ResearchProposal, 2: User} [student, proposal, ched]
     */
    private function lockedScenario(string $status): array
    {
        $institution = Institution::factory()->create();
        $ched = User::factory()->create(['role' => User::ROLE_CHED]);
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
        ]);

        $proposal = ResearchProposal::factory()->create([
            'institution_id' => $institution->id,
            'submitted_by' => $student->id,
            'status' => $status,
            'viewed_by' => $ched->id,
            'viewed_at' => now()->subHour(),
            'reviewed_by' => $ched->id,
        ]);

        return [$student, $proposal, $ched];
    }
}
