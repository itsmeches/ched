<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\SimpleNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationFlowWebTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_open_notification_via_post_and_mark_it_as_read(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne(['role' => User::ROLE_STUDENT]);

        $notification = SimpleNotification::query()->create([
            'user_id' => $user->id,
            'message' => 'Review this proposal update.',
            'link_url' => route('research.index').'#review-decision',
            'type' => 'review_action_needed',
            'is_read' => false,
        ]);

        $target = route('research.index', ['tab' => 'mine']).'#review-decision';

        $response = $this->actingAs($user)
            ->post(route('notifications.read-one', ['id' => $notification->id]), ['redirect' => $target]);

        $response->assertRedirect($target);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'is_read' => true,
        ]);
    }

    public function test_user_cannot_mark_other_users_notification_as_read(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne(['role' => User::ROLE_STUDENT]);
        /** @var User $otherUser */
        $otherUser = User::factory()->createOne(['role' => User::ROLE_FACULTY]);

        $notification = SimpleNotification::query()->create([
            'user_id' => $otherUser->id,
            'message' => 'Other user notification',
            'link_url' => route('dashboard'),
            'type' => 'update',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('notifications.read-one', ['id' => $notification->id]));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $otherUser->id,
            'is_read' => false,
        ]);
    }

    public function test_external_notification_redirect_url_is_rejected(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne(['role' => User::ROLE_STUDENT]);

        $notification = SimpleNotification::query()->create([
            'user_id' => $user->id,
            'message' => 'Unsafe redirect check',
            'type' => 'update',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)
            ->from('/profile')
            ->post(route('notifications.read-one', ['id' => $notification->id]), [
                'redirect' => 'https://evil.example/phish',
            ]);

        $response->assertRedirect('/profile');

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'is_read' => true,
        ]);
    }

    public function test_mark_all_notifications_read_only_affects_authenticated_user(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne(['role' => User::ROLE_STUDENT]);
        /** @var User $otherUser */
        $otherUser = User::factory()->createOne(['role' => User::ROLE_FACULTY]);

        $mineUnread = SimpleNotification::query()->create([
            'user_id' => $user->id,
            'message' => 'Mine unread',
            'type' => 'update',
            'is_read' => false,
        ]);

        $mineRead = SimpleNotification::query()->create([
            'user_id' => $user->id,
            'message' => 'Mine already read',
            'type' => 'update',
            'is_read' => true,
        ]);

        $otherUnread = SimpleNotification::query()->create([
            'user_id' => $otherUser->id,
            'message' => 'Other unread',
            'type' => 'update',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('notifications.read-all'));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'id' => $mineUnread->id,
            'is_read' => true,
        ]);

        $this->assertDatabaseHas('notifications', [
            'id' => $mineRead->id,
            'is_read' => true,
        ]);

        $this->assertDatabaseHas('notifications', [
            'id' => $otherUnread->id,
            'is_read' => false,
        ]);
    }

    public function test_profile_page_includes_typed_notifications_payload(): void
    {
        /** @var User $user */
        $user = User::factory()->createOne(['role' => User::ROLE_STUDENT]);

        SimpleNotification::query()->create([
            'user_id' => $user->id,
            'message' => 'Approval decision received.',
            'link_url' => route('research.index').'#research-actions',
            'type' => 'research_approved',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Edit')
            ->has('notifications', 1)
            ->where('notifications.0.type', 'research_approved')
            ->where('notifications.0.link_url', route('research.index').'#research-actions')
        );
    }

    public function test_review_workflow_creates_action_needed_notification_with_context_link(): void
    {
        $actors = $this->makeHierarchy();

        $proposal = ResearchProposal::query()->create([
            'title' => 'Notification Context Proposal',
            'authors' => 'Student Author',
            'co_authors' => 'Co Author',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Proposal for notification deep-link tests.',
            'institution_id' => $actors['institution']->id,
            'category' => 'Technology',
            'keywords' => 'Notification, Context',
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_by' => $actors['student']->id,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($actors['faculty'])
            ->from(route('research.show', $proposal))
            ->post(route('research.review', $proposal), [
                'action' => 'approve',
                'comments' => 'Faculty approved.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $actors['hei']->id,
            'type' => 'review_action_needed',
            'link_url' => route('research.show', $proposal->id).'#review-decision',
            'is_read' => false,
        ]);
    }

    /**
     * @return array{institution: Institution, ched: User, hei: User, faculty: User, student: User}
     */
    private function makeHierarchy(): array
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Notification University',
            'code' => 'LNU-'.fake()->unique()->numerify('###'),
        ]);

        /** @var User $ched */
        $ched = User::factory()->createOne([
            'role' => User::ROLE_CHED,
        ]);

        /** @var User $hei */
        $hei = User::factory()->createOne([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
            'ched_id' => $ched->id,
        ]);

        /** @var User $faculty */
        $faculty = User::factory()->createOne([
            'role' => User::ROLE_FACULTY,
            'institution_id' => $institution->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        /** @var User $student */
        $student = User::factory()->createOne([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        return compact('institution', 'ched', 'hei', 'faculty', 'student');
    }
}
