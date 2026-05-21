<?php

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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
            $newTitle = $titles[array_rand($titles)].' v'.($i + 1);

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

Artisan::command('ched4a:import-heis
    {--url=https://124.105.201.203/api/heis/all : Source HEI API endpoint}
    {--ched-email=ched@cris.gov.ph : CHED account email to own created HEI accounts}
    {--password=ChangeMe123! : Default password for newly created HEI accounts}
    {--report-path= : Optional absolute or relative CSV report path}
    {--active-only : Import only schools with status ACTIVE}
    {--update-existing : Update existing institution/user records when matched}
    {--dry-run : Preview changes without writing to database}', function () {
    $url = (string) $this->option('url');
    $chedEmail = Str::lower(trim((string) $this->option('ched-email')));
    $defaultPassword = (string) $this->option('password');
    $reportPath = trim((string) $this->option('report-path'));
    $activeOnly = (bool) $this->option('active-only');
    $updateExisting = (bool) $this->option('update-existing');
    $dryRun = (bool) $this->option('dry-run');

    if ($reportPath === '') {
        $reportPath = 'app/reports/ched4a-heis-'.now()->format('Ymd-His').'.csv';
    }
    $resolvedReportPath = str_starts_with($reportPath, DIRECTORY_SEPARATOR)
        || preg_match('/^[A-Za-z]:\\\\/', $reportPath) === 1
        ? $reportPath
        : storage_path($reportPath);

    File::ensureDirectoryExists(dirname($resolvedReportPath));
    $reportHandle = fopen($resolvedReportPath, 'wb');
    if ($reportHandle === false) {
        $this->error('Unable to open CSV report file: '.$resolvedReportPath);

        return self::FAILURE;
    }

    fputcsv($reportHandle, [
        'institution_name',
        'institution_code',
        'hei_email',
        'institution_action',
        'hei_action',
        'source_status',
        'mode',
        'generated_at',
    ]);

    $ched = User::query()->where('email', $chedEmail)->first();
    if (! $ched || $ched->role !== User::ROLE_CHED) {
        $this->error("CHED account not found or invalid role for email: {$chedEmail}");

        return self::FAILURE;
    }

    $this->line("Using CHED owner: {$ched->name} <{$ched->email}>");

    try {
        $response = Http::withOptions([
            'verify' => false,
            'timeout' => 90,
        ])->acceptJson()->get($url);
    } catch (Throwable $e) {
        $this->error('Failed to fetch API: '.$e->getMessage());

        return self::FAILURE;
    }

    if (! $response->ok()) {
        $this->error("API returned HTTP {$response->status()}");

        return self::FAILURE;
    }

    $payload = $response->json();
    $rows = [];
    if (is_array($payload) && array_is_list($payload)) {
        $rows = $payload;
    } elseif (is_array($payload) && isset($payload['data']) && is_array($payload['data'])) {
        $rows = $payload['data'];
    } elseif (is_array($payload) && isset($payload['result']) && is_array($payload['result'])) {
        $rows = $payload['result'];
    }

    if ($rows === []) {
        $this->warn('No HEI rows found from API payload.');

        return self::SUCCESS;
    }

    $createdInstitutions = 0;
    $updatedInstitutions = 0;
    $skippedInstitutions = 0;
    $createdHeis = 0;
    $updatedHeis = 0;
    $skippedHeis = 0;

    $usedCodes = Institution::query()->pluck('code')->filter()->map(fn ($code) => Str::upper((string) $code))->all();
    $usedEmails = User::withTrashed()->pluck('email')->filter()->map(fn ($email) => Str::lower((string) $email))->all();

    foreach ($rows as $index => $row) {
        if (! is_array($row)) {
            continue;
        }

        $status = Str::upper(trim((string) ($row['status'] ?? '')));
        if ($activeOnly && $status !== 'ACTIVE') {
            continue;
        }

        $institutionAction = 'skipped';
        $heiAction = 'skipped';

        $name = trim((string) ($row['name'] ?? ''));
        if ($name === '') {
            $skippedInstitutions++;
            $skippedHeis++;
            $this->warn('Skipping row with missing name at index '.$index);
            continue;
        }

        $sourceCode = trim((string) ($row['uii'] ?? ''));
        if ($sourceCode === '') {
            $sourceCode = Str::upper(Str::slug(Str::substr($name, 0, 24), ''));
        }
        $sourceCode = Str::upper(Str::substr(preg_replace('/[^A-Za-z0-9_-]/', '', $sourceCode) ?: 'HEI', 0, 50));

        $address = trim((string) ($row['address'] ?? ''));
        $contactEmail = null;
        $contactPhone = null;
        $details = $row['contact_details'] ?? [];
        if (is_array($details)) {
            foreach ($details as $detail) {
                if (! is_array($detail)) {
                    continue;
                }
                $type = Str::lower(trim((string) ($detail['detail_type'] ?? '')));
                $value = trim((string) ($detail['detail'] ?? ''));
                if ($value === '') {
                    continue;
                }
                if ($contactEmail === null && $type === 'email' && filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $contactEmail = Str::lower($value);
                }
                if ($contactPhone === null && in_array($type, ['telephone', 'mobile'], true)) {
                    $contactPhone = Str::substr($value, 0, 50);
                }
                if ($contactEmail && $contactPhone) {
                    break;
                }
            }
        }

        $institution = Institution::query()
            ->where('code', $sourceCode)
            ->orWhere('name', $name)
            ->first();

        $finalCode = $sourceCode;
        if (! $institution) {
            $suffix = 1;
            while (in_array($finalCode, $usedCodes, true)) {
                $candidate = Str::upper(Str::substr($sourceCode, 0, max(1, 48 - strlen((string) $suffix))).'-'.$suffix);
                $finalCode = Str::substr($candidate, 0, 50);
                $suffix++;
            }
            $usedCodes[] = $finalCode;

            if (! $dryRun) {
                $institution = Institution::create([
                    'name' => $name,
                    'code' => $finalCode,
                    'address' => $address !== '' ? $address : null,
                    'contact_email' => $contactEmail,
                    'contact_phone' => $contactPhone,
                ]);
            }
            $createdInstitutions++;
            $institutionAction = 'created';
            $this->info("[Institution][create] {$name} ({$finalCode})");
        } else {
            if ($updateExisting) {
                $instUpdates = [
                    'name' => $name,
                    'address' => $address !== '' ? $address : $institution->address,
                    'contact_email' => $contactEmail ?? $institution->contact_email,
                    'contact_phone' => $contactPhone ?? $institution->contact_phone,
                ];
                if (! $dryRun) {
                    $institution->update($instUpdates);
                }
                $updatedInstitutions++;
                $institutionAction = 'updated';
                $this->line("[Institution][update] {$name} ({$institution->code})");
            } else {
                $skippedInstitutions++;
                $institutionAction = 'skipped';
            }
        }

        $institutionCode = $institution?->code ?? $finalCode;
        $institutionId = $institution?->id;

        $existingUser = $institutionId
            ? User::withTrashed()
                ->where('role', User::ROLE_HEI)
                ->where('institution_id', $institutionId)
                ->orderBy('id')
                ->first()
            : null;

        $heiEmail = $contactEmail;
        if (! $heiEmail || ! filter_var($heiEmail, FILTER_VALIDATE_EMAIL)) {
            $base = Str::lower(Str::slug($institutionCode, ''));
            if ($base === '') {
                $base = 'hei'.($index + 1);
            }
            $heiEmail = $base.'@edu.ph';
        }

        $normalizedEmail = Str::lower($existingUser?->email ?? $heiEmail);
        if (! $existingUser) {
            $existingUser = User::withTrashed()->where('email', $normalizedEmail)->first();
        }

        // Shared contact emails can appear across multiple campuses; only reuse if already tied to same institution.
        if ($existingUser && (int) $existingUser->institution_id !== (int) $institutionId) {
            $existingUser = null;
        }

        if (! $existingUser) {
            $candidateEmail = $normalizedEmail;
            $suffix = 1;

            while (in_array($candidateEmail, $usedEmails, true)) {
                if (preg_match('/^([^@]+)@(.+)$/', $normalizedEmail, $matches) === 1) {
                    $candidateEmail = $matches[1].'+'.$suffix.'@'.$matches[2];
                } else {
                    $candidateEmail = $normalizedEmail.'+'.$suffix;
                }
                $suffix++;
            }

            $normalizedEmail = $candidateEmail;
        }

        if (! in_array($normalizedEmail, $usedEmails, true)) {
            $usedEmails[] = $normalizedEmail;
        }

        $heiName = $institutionCode.' HEI';
        if ($existingUser) {
            if ($existingUser->trashed()) {
                if (! $dryRun) {
                    $existingUser->restore();
                }
            }

            if ($updateExisting) {
                if (! $dryRun) {
                    $existingUser->update([
                        'name' => $heiName,
                        'role' => User::ROLE_HEI,
                        'institution_id' => $institutionId,
                        'created_by' => $ched->id,
                        'ched_id' => $ched->id,
                        'hei_id' => null,
                        'faculty_id' => null,
                    ]);
                }
                $updatedHeis++;
                $heiAction = 'updated';
                $this->line("[HEI][update] {$heiName} <{$normalizedEmail}>");
            } else {
                $skippedHeis++;
                $heiAction = 'skipped';
            }

            fputcsv($reportHandle, [
                $name,
                $institutionCode,
                $normalizedEmail,
                $institutionAction,
                $heiAction,
                $status,
                $dryRun ? 'dry-run' : 'write',
                now()->toDateTimeString(),
            ]);
            continue;
        }

        if (! $dryRun) {
            User::create([
                'name' => $heiName,
                'email' => $normalizedEmail,
                'password' => $defaultPassword,
                'role' => User::ROLE_HEI,
                'institution_id' => $institutionId,
                'created_by' => $ched->id,
                'ched_id' => $ched->id,
                'hei_id' => null,
                'faculty_id' => null,
            ]);
        }
        $createdHeis++;
        $heiAction = 'created';
        $this->info("[HEI][create] {$heiName} <{$normalizedEmail}>");

        fputcsv($reportHandle, [
            $name,
            $institutionCode,
            $normalizedEmail,
            $institutionAction,
            $heiAction,
            $status,
            $dryRun ? 'dry-run' : 'write',
            now()->toDateTimeString(),
        ]);
    }

    fclose($reportHandle);

    $this->newLine();
    $this->info('Import summary');
    $this->line("Institutions: created={$createdInstitutions}, updated={$updatedInstitutions}, skipped={$skippedInstitutions}");
    $this->line("HEI users:    created={$createdHeis}, updated={$updatedHeis}, skipped={$skippedHeis}");
    $this->line('Mode: '.($dryRun ? 'DRY RUN (no writes)' : 'WRITE'));
    $this->line('CSV report: '.$resolvedReportPath);

    return self::SUCCESS;
})->purpose('Import CHED 4-A schools as Institutions and linked HEI accounts from external API');
