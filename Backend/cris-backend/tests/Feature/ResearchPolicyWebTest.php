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
class ResearchPolicyWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_hei_cannot_view_another_users_proposal(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $proposal = $this->makeProposal($actors['institution']->id, $actors['otherHei']->id, 'Hidden Proposal');

        $response = $this->actingAs($actors['hei'])->get(route('research.show', $proposal));

        $response->assertForbidden();
    }

    public function test_hei_cannot_review_a_proposal(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $proposal = $this->makeProposal($actors['institution']->id, $actors['hei']->id, 'Pending Proposal');

        $response = $this->actingAs($actors['hei'])
            ->from(route('research.show', $proposal))
            ->post(route('research.review', $proposal), [
                'action' => 'approve',
            ]);

        $response->assertForbidden();
        $this->assertSame(ResearchProposal::STATUS_PENDING, $proposal->fresh()->status);
    }

    public function test_super_admin_can_review_a_pending_proposal(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $proposal = $this->makeProposal($actors['institution']->id, $actors['hei']->id, 'Admin Review Proposal');

        $response = $this->actingAs($actors['admin'])
            ->from(route('research.show', $proposal))
            ->post(route('research.review', $proposal), [
                'action' => 'approve',
                'comments' => 'Approved by administrator.',
            ]);

        $response->assertRedirect(route('research.show', $proposal));

        $proposal->refresh();

        $this->assertSame(ResearchProposal::STATUS_APPROVED, $proposal->status);
        $this->assertSame($actors['admin']->id, $proposal->reviewed_by);
    }

    public function test_super_admin_can_delete_a_pending_proposal(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $proposal = $this->makeProposal($actors['institution']->id, $actors['hei']->id, 'Delete Me');

        $response = $this->actingAs($actors['admin'])
            ->delete(route('research.destroy', $proposal));

        $response->assertRedirect(route('research.index'));
        $this->assertDatabaseMissing('research_proposals', ['id' => $proposal->id]);
    }

    public function test_faculty_cannot_review_pending_faculty_paper_without_direct_student_linkage(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Calamba Research College',
            'code' => 'CRC-'.fake()->unique()->numerify('###'),
        ]);

        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
            'ched_id' => $ched->id,
        ]);

        /** @var User $faculty */
        $faculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => null,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        $proposal = ResearchProposal::query()->create([
            'title' => 'Resubmitted Legacy Linkage Proposal',
            'authors' => 'Student Author',
            'co_authors' => 'Co Author',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Test abstract',
            'institution_id' => $institution->id,
            'category' => 'Technology',
            'keywords' => 'AI, Data',
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_by' => $student->id,
            'submitted_at' => now(),
        ]);

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $proposal->id,
            'user_id' => $faculty->id,
            'action' => 'rejected',
            'old_values' => null,
            'new_values' => ['status' => ResearchProposal::STATUS_REJECTED],
            'performed_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($faculty)
            ->from(route('research.show', $proposal))
            ->post(route('research.review', $proposal), [
                'action' => 'approve',
                'comments' => 'Approved after revision.',
            ]);

        $response->assertForbidden();
        $this->assertSame(ResearchProposal::STATUS_UNDER_REVIEW_FACULTY, $proposal->fresh()->status);
    }

    /**
     * @return array{hei: User, otherHei: User, ched: User, admin: User, institution: Institution}
     */
    private function makeUsersAndInstitution(): array
    {
        $institution = Institution::query()->create([
            'name' => 'Calabarzon State University',
            'code' => 'CSU-'.fake()->unique()->numerify('###'),
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $otherHei = User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        $admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        return compact('hei', 'otherHei', 'ched', 'admin', 'institution');
    }

    private function makeProposal(int $institutionId, int $submitterId, string $title, array $overrides = []): ResearchProposal
    {
        return ResearchProposal::query()->create(array_merge([
            'title' => $title,
            'authors' => 'Author One',
            'co_authors' => 'Author Two',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Test abstract',
            'institution_id' => $institutionId,
            'category' => 'Technology',
            'keywords' => 'AI, Data',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => $submitterId,
        ], $overrides));
    }
}
