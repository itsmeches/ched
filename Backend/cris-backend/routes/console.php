<?php

use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('history:seed-demo {--count=12} {--proposal_id=} {--clear}', function () {
    $count = max(1, (int) $this->option('count'));
    $proposalId = $this->option('proposal_id');

    if ($this->option('clear')) {
        ResearchProposalHistory::query()->delete();
        $this->warn('Existing history entries cleared.');
    }

    $proposal = $proposalId
        ? ResearchProposal::query()->find($proposalId)
        : ResearchProposal::query()->latest('id')->first();

    if (! $proposal) {
        $this->error('No research proposal found. Create at least one proposal first.');
        return self::FAILURE;
    }

    $heiUser = User::query()->where('role', User::ROLE_HEI)->first();
    $chedUser = User::query()->where('role', User::ROLE_CHED)->first();
    $adminUser = User::query()->where('role', User::ROLE_SUPER_ADMIN)->first();

    $actions = ['created', 'updated', 'approved', 'rejected', 'deleted'];
    $titles = [
        'Smart Irrigation for Upland Farming',
        'AI-based Enrollment Forecasting',
        'Disaster Mapping using Drone Imagery',
        'IoT Flood Alert for River Basins',
    ];

    $created = 0;
    $now = Carbon::now();

    for ($i = 0; $i < $count; $i++) {
        $action = $actions[$i % count($actions)];
        $actor = match ($action) {
            'created' => $heiUser,
            'updated' => $heiUser,
            'approved' => $chedUser ?? $adminUser,
            'rejected' => $chedUser ?? $adminUser,
            'deleted' => $adminUser ?? $chedUser,
            default => $adminUser,
        };

        $oldValues = null;
        $newValues = null;

        if ($action === 'updated') {
            $oldTitle = $titles[array_rand($titles)];
            $newTitle = $titles[array_rand($titles)] . ' v' . ($i + 1);

            $oldValues = [
                'title' => $oldTitle,
                'keywords' => 'AI, Sustainability',
                'status' => 'pending',
            ];
            $newValues = [
                'title' => $newTitle,
                'keywords' => 'AI, Sustainability, Climate',
                'status' => 'pending',
            ];
        }

        if ($action === 'created') {
            $newValues = [
                'title' => $titles[array_rand($titles)],
                'status' => 'pending',
            ];
        }

        if ($action === 'approved' || $action === 'rejected') {
            $newValues = [
                'status' => $action === 'approved' ? 'approved' : 'rejected',
                'comments' => $action === 'approved'
                    ? 'Meets quality and relevance criteria.'
                    : 'Needs stronger methodology and clearer data sources.',
            ];
        }

        if ($action === 'deleted') {
            $oldValues = [
                'title' => $titles[array_rand($titles)],
                'status' => 'pending',
            ];
        }

        ResearchProposalHistory::query()->create([
            'research_proposal_id' => $proposal->id,
            'user_id' => $actor?->id,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'performed_at' => $now->copy()->subHours($i * 4),
        ]);

        $created++;
    }

    $this->info("Seeded {$created} history entries for proposal #{$proposal->id}.");
    $this->line('Tip: open /history and test date/action filters plus CSV export.');

    return self::SUCCESS;
})->purpose('Seed demo history entries for UI testing');
