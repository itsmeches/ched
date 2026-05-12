<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Verifies role-based data isolation on dashboard endpoints. Catches
 * regressions where one role sees another role's proposals.
 *
 * @group authorization-hardening
 */
class DashboardWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_dashboard_only_includes_own_proposals(): void
    {
        $hierarchy = $this->makeHierarchy();
        ['student' => $student, 'institution' => $inst] = $hierarchy;

        $otherStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $inst->id,
        ]);

        ResearchProposal::factory()->create([
            'title' => 'Mine',
            'institution_id' => $inst->id,
            'submitted_by' => $student->id,
        ]);
        ResearchProposal::factory()->create([
            'title' => 'Not Mine',
            'institution_id' => $inst->id,
            'submitted_by' => $otherStudent->id,
        ]);

        $response = $this->actingAs($student)->get(route('student.dashboard'));

        $response->assertOk();
        $page = $response->viewData('page');
        $titles = collect($page['props']['recentUploads'] ?? [])->pluck('title')->all();

        $this->assertContains('Mine', $titles);
        $this->assertNotContains('Not Mine', $titles);
        $this->assertSame(1, $page['props']['stats']['total']);
    }

    public function test_faculty_dashboard_only_includes_assigned_students_proposals(): void
    {
        $hierarchy = $this->makeHierarchy();
        ['faculty' => $faculty, 'student' => $student, 'institution' => $inst, 'hei' => $hei, 'ched' => $ched] = $hierarchy;

        $strangerStudent = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $inst->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
            'faculty_id' => null, // not under this faculty
        ]);

        ResearchProposal::factory()->pendingFaculty()->create([
            'title' => 'Mine via faculty link',
            'institution_id' => $inst->id,
            'submitted_by' => $student->id,
        ]);
        ResearchProposal::factory()->pendingFaculty()->create([
            'title' => 'Not under this faculty',
            'institution_id' => $inst->id,
            'submitted_by' => $strangerStudent->id,
        ]);

        $response = $this->actingAs($faculty)->get(route('faculty.dashboard'));

        $response->assertOk();
        $page = $response->viewData('page');
        $titles = collect($page['props']['forReview'] ?? [])->pluck('title')->all();

        $this->assertContains('Mine via faculty link', $titles);
        $this->assertNotContains('Not under this faculty', $titles);
    }

    public function test_dashboard_redirects_unauthenticated_user(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_student_cannot_hit_faculty_dashboard(): void
    {
        /** @var User $student */
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        // Faculty dashboard route is in a role-gated middleware group;
        // a student should be bounced (redirect or forbidden).
        $response = $this->actingAs($student)->get(route('faculty.dashboard'));

        $this->assertContains($response->status(), [302, 403], 'Student should not access faculty dashboard');
    }

    /**
     * @return array{ched:User,hei:User,faculty:User,student:User,institution:Institution}
     */
    private function makeHierarchy(): array
    {
        $institution = Institution::factory()->create();

        $ched = User::factory()->create(['role' => User::ROLE_CHED]);
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

        return compact('ched', 'hei', 'faculty', 'student', 'institution');
    }
}
