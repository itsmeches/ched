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
class HistoryHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_hei_history_is_scoped_to_faculty_and_students_under_faculty_only(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $hei = $actors['hei'];
        $otherHei = $actors['other_hei'];
        $admin = $actors['admin'];
        $institution = $actors['institution'];

        $faculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
        ]);

        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $hei->id,
        ]);

        $ownProposal = $this->makeProposal($institution->id, $hei->id, 'HEI Own Proposal');
        $studentProposal = $this->makeProposal($institution->id, $student->id, 'HEI Student Proposal');
        $otherProposal = $this->makeProposal($institution->id, $otherHei->id, 'Other HEI Proposal');

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $ownProposal->id,
            'user_id' => $hei->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old HEI Own Proposal'],
            'new_values' => ['title' => 'HEI Own Proposal'],
            'performed_at' => now(),
        ]);

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $studentProposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old HEI Student Proposal'],
            'new_values' => ['title' => 'HEI Student Proposal'],
            'performed_at' => now()->subMinutes(30),
        ]);

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $otherProposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old Other HEI Proposal'],
            'new_values' => ['title' => 'Other HEI Proposal'],
            'performed_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($hei)->get(route('history.index'));

        $response->assertOk();
        $response->assertDontSee('HEI Own Proposal');
        $response->assertSee('HEI Student Proposal');
        $response->assertDontSee('Other HEI Proposal');
    }

    public function test_ched_history_includes_own_actions_and_reviewed_proposals(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $hei = $actors['hei'];
        $otherHei = $actors['other_hei'];
        $ched = $actors['ched'];
        $admin = $actors['admin'];
        $institution = $actors['institution'];

        $reviewedByChed = $this->makeProposal($institution->id, $hei->id, 'Reviewed by CHED', [
            'reviewed_by' => $ched->id,
        ]);
        $notReviewedByChed = $this->makeProposal($institution->id, $otherHei->id, 'Unrelated Proposal');

        // Should be visible because proposal was reviewed by CHED user.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $reviewedByChed->id,
            'user_id' => $admin->id,
            'action' => 'approved',
            'old_values' => null,
            'new_values' => ['status' => 'approved'],
            'performed_at' => now(),
        ]);

        // Should be visible because actor is CHED user.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $notReviewedByChed->id,
            'user_id' => $ched->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Before Change'],
            'new_values' => ['title' => 'After Change'],
            'performed_at' => now()->subMinutes(20),
        ]);

        // Should NOT be visible to CHED user.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $notReviewedByChed->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Unrelated Proposal'],
            'new_values' => ['title' => 'Still Unrelated'],
            'performed_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($ched)->get(route('history.index'));

        $response->assertOk();
        $response->assertSee('Reviewed by CHED');
        $response->assertDontSee('Still Unrelated');
    }

    public function test_only_super_admin_can_export_history_csv(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $hei = $actors['hei'];
        $admin = $actors['admin'];
        $institution = $actors['institution'];

        $proposal = $this->makeProposal($institution->id, $hei->id, 'Export Scope Proposal');

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $proposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old'],
            'new_values' => ['title' => 'New'],
            'performed_at' => now(),
        ]);

        $this->actingAs($hei)
            ->get(route('history.export'))
            ->assertForbidden();

        $response = $this->actingAs($admin)
            ->get(route('history.export', ['columns' => ['action', 'proposal_title']]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $firstLine = (string) strtok($content, "\n");

        $this->assertNotSame('', trim($content));
        $this->assertSame(['Action', 'Proposal Title'], str_getcsv(trim($firstLine, "\r\n")));
        $this->assertStringContainsString('Export Scope Proposal', $content);
    }

    public function test_student_history_is_scoped_to_own_submissions_only(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $faculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $actors['institution']->id,
            'hei_id' => $actors['hei']->id,
        ]);

        /** @var User $student */
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $actors['institution']->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $actors['hei']->id,
        ]);

        $otherStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $actors['institution']->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $actors['hei']->id,
        ]);

        $ownProposal = $this->makeProposal($actors['institution']->id, $student->id, 'Student Own Proposal');
        $otherProposal = $this->makeProposal($actors['institution']->id, $otherStudent->id, 'Other Student Proposal');

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $ownProposal->id,
            'user_id' => $faculty->id,
            'action' => 'approved',
            'old_values' => null,
            'new_values' => ['status' => 'approved'],
            'performed_at' => now(),
        ]);

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $otherProposal->id,
            'user_id' => $faculty->id,
            'action' => 'approved',
            'old_values' => null,
            'new_values' => ['status' => 'approved'],
            'performed_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($student)->get(route('history.index'));

        $response->assertOk();
        $response->assertSee('Student Own Proposal');
        $response->assertDontSee('Other Student Proposal');
    }

    public function test_faculty_history_includes_assigned_students_and_own_actions_only(): void
    {
        $actors = $this->makeUsersAndInstitution();
        $hei = $actors['hei'];
        $admin = $actors['admin'];
        $institution = $actors['institution'];

        /** @var User $faculty */
        $faculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
        ]);

        $otherFaculty = User::factory()->create([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
        ]);

        $assignedStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $hei->id,
        ]);

        $otherStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $otherFaculty->id,
            'hei_id' => $hei->id,
        ]);

        $assignedProposal = $this->makeProposal($institution->id, $assignedStudent->id, 'Faculty Assigned Student Proposal');
        $otherProposal = $this->makeProposal($institution->id, $otherStudent->id, 'Faculty Own Action Base Proposal');
        $trulyUnrelatedProposal = $this->makeProposal($institution->id, $otherStudent->id, 'Faculty Truly Unrelated Proposal');

        // Visible: proposal belongs to assigned student.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $assignedProposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old Faculty Assigned Student Proposal'],
            'new_values' => ['title' => 'Faculty Assigned Student Proposal'],
            'performed_at' => now(),
        ]);

        // Visible: faculty's own action even on a non-assigned proposal.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $otherProposal->id,
            'user_id' => $faculty->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old Faculty Own Action Proposal'],
            'new_values' => ['title' => 'Faculty Own Action Proposal'],
            'performed_at' => now()->subMinutes(30),
        ]);

        // Not visible: not assigned and not performed by this faculty.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $otherProposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old Faculty Unrelated Proposal'],
            'new_values' => ['title' => 'Faculty Unrelated Proposal'],
            'performed_at' => now()->subHour(),
        ]);

        // Not visible: separate proposal not assigned and not performed by this faculty.
        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $trulyUnrelatedProposal->id,
            'user_id' => $admin->id,
            'action' => 'updated',
            'old_values' => ['title' => 'Old Faculty Truly Unrelated Proposal'],
            'new_values' => ['title' => 'Faculty Truly Unrelated Proposal'],
            'performed_at' => now()->subMinutes(45),
        ]);

        $response = $this->actingAs($faculty)->get(route('history.index'));

        $response->assertOk();
        $response->assertSee('Faculty Assigned Student Proposal');
        $response->assertSee('Faculty Own Action Proposal');
        $response->assertDontSee('Faculty Truly Unrelated Proposal');
    }

    /**
     * @return array{
     *   hei: User,
     *   other_hei: User,
     *   ched: User,
     *   admin: User,
     *   institution: Institution
     * }
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
            'institution_id' => null,
        ]);

        $admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
            'institution_id' => null,
        ]);

        return [
            'hei' => $hei,
            'other_hei' => $otherHei,
            'ched' => $ched,
            'admin' => $admin,
            'institution' => $institution,
        ];
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
