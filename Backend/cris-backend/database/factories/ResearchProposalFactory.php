<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchProposal>
 */
class ResearchProposalFactory extends Factory
{
    protected $model = ResearchProposal::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(6),
            'authors' => fake()->name(),
            'co_authors' => fake()->name(),
            'year' => (int) fake()->year(),
            'school' => fake()->randomElement(['Engineering', 'Sciences', 'Arts']),
            'abstract' => fake()->paragraph(),
            'institution_id' => Institution::factory(),
            'category' => 'Technology',
            'keywords' => 'AI, Data',
            'status' => ResearchProposal::STATUS_PENDING,
            'submitted_by' => User::factory()->state(['role' => User::ROLE_STUDENT]),
            'submitted_at' => now(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => ResearchProposal::STATUS_APPROVED,
            'approved_at' => now(),
        ]);
    }

    public function pendingFaculty(): static
    {
        return $this->state(fn () => [
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => ResearchProposal::STATUS_REJECTED,
            'rejected_at' => now(),
        ]);
    }

    public function withFile(string $relativePath = 'research_papers/test.pdf'): static
    {
        return $this->state(fn () => ['file_path' => $relativePath]);
    }
}
