<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExperimentResearchSeeder extends Seeder
{
    public function run(): void
    {
        $batchSuffix = now()->format('YmdHis');

        $institutions = Institution::pluck('id');
        if ($institutions->isEmpty()) {
            $institution = Institution::create([
                'name' => 'Sample Institution',
                'code' => 'SMP',
                'address' => 'Sample Address',
                'contact_email' => 'sample@example.com',
                'contact_phone' => '0000000000',
            ]);

            $institutions = collect([$institution->id]);
        }

        $ched = User::where('role', User::ROLE_CHED)->first();
        if (! $ched) {
            $ched = User::create([
                'name' => 'CHED Seeder',
                'email' => 'ched_seeder_' . $batchSuffix . '@cris.gov.ph',
                'password' => Hash::make('password'),
                'role' => User::ROLE_CHED,
            ]);
        }

        $heiUsers = User::where('role', User::ROLE_HEI)->get();
        if ($heiUsers->isEmpty()) {
            $heiUsers = collect([
                User::create([
                    'name' => 'HEI Seeder',
                    'email' => 'hei_seeder_' . $batchSuffix . '@edu.ph',
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_HEI,
                    'institution_id' => $institutions->random(),
                ]),
            ]);
        }

        $categories = ['Education', 'Environment', 'Health', 'Engineering', 'ICT'];
        $schools = [
            'College of Education',
            'College of Engineering',
            'College of Arts and Sciences',
            'Graduate School',
            'Institute of Computing',
        ];

        for ($i = 1; $i <= 10; $i++) {
            $hei = $heiUsers->random();

            ResearchProposal::create([
                'title' => "Experiment Approved Research {$batchSuffix} #{$i}",
                'authors' => "Author A{$i}, Author B{$i}",
                'co_authors' => "CoAuthor X{$i}, CoAuthor Y{$i}",
                'year' => random_int(2019, 2026),
                'school' => $schools[array_rand($schools)],
                'abstract' => "Approved test abstract for experiment batch {$batchSuffix} item #{$i}.",
                'institution_id' => $hei->institution_id ?: $institutions->random(),
                'category' => $categories[array_rand($categories)],
                'keywords' => "test, approved, experiment, batch-{$batchSuffix}",
                'status' => ResearchProposal::STATUS_APPROVED,
                'submitted_by' => $hei->id,
                'viewed_by' => $ched->id,
                'viewed_at' => now()->subDays(random_int(3, 20)),
                'reviewed_by' => $ched->id,
                'reviewed_at' => now()->subDays(random_int(2, 15)),
                'approved_by' => $ched->id,
                'approved_at' => now()->subDays(random_int(1, 10)),
                'comments' => 'Approved for testing and demonstration.',
            ]);
        }

        for ($i = 1; $i <= 10; $i++) {
            $hei = $heiUsers->random();

            ResearchProposal::create([
                'title' => "Experiment Rejected Research {$batchSuffix} #{$i}",
                'authors' => "Author C{$i}, Author D{$i}",
                'co_authors' => "CoAuthor M{$i}",
                'year' => random_int(2019, 2026),
                'school' => $schools[array_rand($schools)],
                'abstract' => "Rejected test abstract for experiment batch {$batchSuffix} item #{$i}.",
                'institution_id' => $hei->institution_id ?: $institutions->random(),
                'category' => $categories[array_rand($categories)],
                'keywords' => "test, rejected, experiment, batch-{$batchSuffix}",
                'status' => ResearchProposal::STATUS_REJECTED,
                'submitted_by' => $hei->id,
                'viewed_by' => $ched->id,
                'viewed_at' => now()->subDays(random_int(3, 20)),
                'reviewed_by' => $ched->id,
                'reviewed_at' => now()->subDays(random_int(2, 15)),
                'approved_by' => null,
                'approved_at' => null,
                'comments' => 'Rejected for testing workflow scenarios.',
            ]);
        }
    }
}
