<?php

namespace Tests\Feature\Api;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InstitutionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_an_institution_via_api(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/institutions', [
            'name' => 'Quezon Applied Research Institute',
            'code' => 'QARI',
            'address' => 'Lucena City, Quezon',
            'contact_email' => 'research@qari.edu.ph',
            'contact_phone' => '09171234567',
        ]);

        $response->assertCreated()
            ->assertJsonPath('institution.code', 'QARI');

        $this->assertDatabaseHas('institutions', [
            'name' => 'Quezon Applied Research Institute',
            'code' => 'QARI',
        ]);
    }

    public function test_ched_cannot_create_an_institution_via_api(): void
    {
        $ched = User::factory()->create([
            'role' => User::ROLE_CHED,
        ]);

        Sanctum::actingAs($ched);

        $response = $this->postJson('/api/institutions', [
            'name' => 'Unauthorized Institution',
            'code' => 'UNAUTH',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
                'status' => 403,
            ]);

        $this->assertDatabaseMissing('institutions', [
            'code' => 'UNAUTH',
        ]);
    }

    public function test_hei_cannot_view_institutions_via_api(): void
    {
        Institution::query()->create([
            'name' => 'Blocked Institution',
            'code' => 'BLOCKED',
        ]);

        $hei = User::factory()->create([
            'role' => User::ROLE_HEI,
        ]);

        Sanctum::actingAs($hei);

        $response = $this->getJson('/api/institutions');

        $response->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
                'status' => 403,
            ]);
    }

    public function test_institution_index_returns_counts_for_authorized_users(): void
    {
        $institution = Institution::query()->create([
            'name' => 'Laguna Technology College',
            'code' => 'LTC-'.fake()->unique()->numerify('###'),
        ]);

        $admin = User::factory()->create([
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        User::factory()->create([
            'role' => User::ROLE_HEI,
            'institution_id' => $institution->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/institutions');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $institution->id)
            ->assertJsonPath('data.0.users_count', 1);
    }
}
