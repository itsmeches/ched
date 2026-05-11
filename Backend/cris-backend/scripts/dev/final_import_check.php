<?php

declare(strict_types=1);

use App\Models\Institution;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$csvPath = $argv[1] ?? storage_path('app/reports/ched4a-heis-final-check.csv');

$results = [
    'csv_path' => $csvPath,
    'csv_exists' => file_exists($csvPath),
    'csv_rows' => 0,
    'csv_mismatches' => 0,
    'csv_missing_institution' => 0,
    'csv_missing_hei_email_match' => 0,
    'db_checks' => [
        'hei_without_institution' => User::query()->where('role', User::ROLE_HEI)->whereNull('institution_id')->count(),
        'hei_orphan_institution' => User::query()
            ->where('role', User::ROLE_HEI)
            ->whereNotNull('institution_id')
            ->whereNotIn('institution_id', Institution::query()->select('id'))
            ->count(),
        'institutions_without_hei' => Institution::query()
            ->whereNotIn('id', User::query()->where('role', User::ROLE_HEI)->whereNotNull('institution_id')->select('institution_id'))
            ->count(),
        'duplicate_hei_emails' => DB::query()
            ->fromSub(
                DB::table('users')
                    ->select('email')
                    ->where('role', User::ROLE_HEI)
                    ->whereNull('deleted_at')
                    ->groupBy('email')
                    ->havingRaw('COUNT(*) > 1'),
                'duplicate_emails'
            )
            ->count(),
        'hei_not_linked_to_ched' => User::query()->where('role', User::ROLE_HEI)->whereNull('ched_id')->count(),
    ],
    'sample_hei_not_linked_to_ched' => User::query()
        ->where('role', User::ROLE_HEI)
        ->whereNull('ched_id')
        ->select(['id', 'name', 'email', 'institution_id'])
        ->first()?->toArray(),
];

if ($results['csv_exists']) {
    $handle = fopen($csvPath, 'rb');

    if ($handle !== false) {
        $header = fgetcsv($handle);
        $index = is_array($header) ? array_flip($header) : [];

        while (($row = fgetcsv($handle)) !== false) {
            $results['csv_rows']++;

            $institutionName = $row[$index['institution_name']] ?? null;
            $institutionCode = $row[$index['institution_code']] ?? null;
            $heiEmail = $row[$index['hei_email']] ?? null;

            $institution = Institution::query()
                ->where('code', (string) $institutionCode)
                ->orWhere('name', (string) $institutionName)
                ->first();

            if (! $institution) {
                $results['csv_missing_institution']++;
                $results['csv_mismatches']++;
                continue;
            }

            $hasMatchingHei = User::query()
                ->where('role', User::ROLE_HEI)
                ->where('institution_id', $institution->id)
                ->where('email', (string) $heiEmail)
                ->exists();

            if (! $hasMatchingHei) {
                $results['csv_missing_hei_email_match']++;
                $results['csv_mismatches']++;
            }
        }

        fclose($handle);
    }
}

echo json_encode($results, JSON_PRETTY_PRINT) . PHP_EOL;
