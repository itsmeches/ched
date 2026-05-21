<?php

namespace Tests\Feature;

use App\Models\Discipline;
use App\Models\Institution;
use App\Models\ResearchCategory;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Locks in the private-disk + controller-served download flow added in
 * the file-leak hardening pass. Verifies authorization + that legacy public-disk
 * files still resolve through the fallback in resolveResearchDisk().
 *
 * @group authorization-hardening
 */
class ResearchFileDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_download_serves_approved_proposal_pdf(): void
    {
        Storage::fake('research');

        $proposal = $this->makeProposalWithFile(
            ResearchProposal::STATUS_APPROVED,
            'research',
            "Approved abstract.\n",
        );

        $response = $this->get(route('research.public.file', $proposal));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_public_download_404s_for_non_approved_proposal(): void
    {
        Storage::fake('research');

        $proposal = $this->makeProposalWithFile(
            ResearchProposal::STATUS_UNDER_REVIEW_CHED,
            'research',
            'Pending abstract.',
        );

        $this->get(route('research.public.file', $proposal))->assertNotFound();
    }

    public function test_public_download_404s_when_file_missing_on_disk(): void
    {
        Storage::fake('research');
        Storage::fake('public');

        $institution = Institution::factory()->create();
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
        ]);

        // file_path set but no file on either disk
        $proposal = ResearchProposal::factory()->approved()->create([
            'institution_id' => $institution->id,
            'submitted_by' => $student->id,
            'file_path' => 'research_papers/missing.pdf',
        ]);

        $this->get(route('research.public.file', $proposal))->assertNotFound();
    }

    public function test_legacy_public_disk_files_still_resolve(): void
    {
        // Verifies the resolveResearchDisk() fallback for files uploaded
        // before the migration to the private 'research' disk.
        Storage::fake('research');
        Storage::fake('public');

        $proposal = $this->makeProposalWithFile(
            ResearchProposal::STATUS_APPROVED,
            'public',
            'Legacy file content.',
        );

        $this->get(route('research.public.file', $proposal))->assertOk();
    }

    public function test_authenticated_download_requires_authorization(): void
    {
        Storage::fake('research');

        $institutionA = Institution::factory()->create();
        $institutionB = Institution::factory()->create();

        /** @var User $studentA */
        $studentA = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institutionA->id,
        ]);
        /** @var User $studentB */
        $studentB = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institutionB->id,
        ]);

        Storage::disk('research')->put('research_papers/private.pdf', 'secret');

        $proposal = ResearchProposal::factory()->create([
            'institution_id' => $institutionA->id,
            'submitted_by' => $studentA->id,
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'file_path' => 'research_papers/private.pdf',
        ]);

        // owner: ok
        $this->actingAs($studentA)->get(route('research.file', $proposal))->assertOk();

        // unrelated student: denied
        $this->actingAs($studentB)->get(route('research.file', $proposal))->assertForbidden();

        // guest: redirect to login
        $this->app['auth']->guard()->logout();
        $this->get(route('research.file', $proposal))->assertRedirect(route('login'));
    }

    public function test_uploaded_research_pdf_is_stored_on_private_disk(): void
    {
        Storage::fake('research');
        Storage::fake('public');

        // Seed required taxonomy rows the StoreRequest validates against
        ResearchCategory::query()->create([
            'type' => 'general',
            'value' => 'technology',
            'label' => 'Technology',
            'is_active' => true,
        ]);
        Discipline::query()->create([
            'code' => 'CS',
            'name' => 'Computer Science',
            'is_active' => true,
        ]);

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
        /** @var User $student */
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
            'faculty_id' => $faculty->id,
            'hei_id' => $hei->id,
            'ched_id' => $ched->id,
        ]);

        $response = $this->actingAs($student)->post(route('research.store'), [
            'title' => 'Private Disk Upload Test',
            'authors' => 'Solo Author',
            'co_authors' => 'Co Author',
            'year' => 2026,
            'school' => 'Engineering',
            'abstract' => 'Abstract text long enough.',
            'institution_id' => $institution->id,
            'research_category' => 'technology',
            'category_type' => 'general',
            'discipline' => 'CS',
            'keywords' => 'test',
            'pdf_file' => UploadedFile::fake()->create('paper.pdf', 100, 'application/pdf'),
        ]);
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $proposal = ResearchProposal::query()->where('title', 'Private Disk Upload Test')->firstOrFail();

        $this->assertNotEmpty($proposal->file_path);
        $this->assertTrue(Storage::disk('research')->exists($proposal->file_path));
        $this->assertFalse(Storage::disk('public')->exists($proposal->file_path));
    }

    private function makeProposalWithFile(string $status, string $disk, string $contents): ResearchProposal
    {
        $institution = Institution::factory()->create();
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'institution_id' => $institution->id,
        ]);

        $relativePath = 'research_papers/'.fake()->unique()->slug().'.pdf';
        Storage::disk($disk)->put($relativePath, $contents);

        return ResearchProposal::factory()->create([
            'institution_id' => $institution->id,
            'submitted_by' => $student->id,
            'status' => $status,
            'approved_at' => $status === ResearchProposal::STATUS_APPROVED ? now() : null,
            'file_path' => $relativePath,
        ]);
    }
}
