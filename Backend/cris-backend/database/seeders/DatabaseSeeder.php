<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Institution;
use App\Models\ResearchProposal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Institutions
        $institution1 = Institution::create([
            'name' => 'University of Batangas',
            'code' => 'UB',
            'address' => 'Batangas City, Batangas',
            'contact_email' => 'admin@ub.edu.ph',
            'contact_phone' => '(043) 123-4567',
        ]);

        $institution2 = Institution::create([
            'name' => 'Batangas State University',
            'code' => 'BatStateU',
            'address' => 'Batangas City, Batangas',
            'contact_email' => 'admin@batstateu.edu.ph',
            'contact_phone' => '(043) 987-6543',
        ]);

        // Create Users
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@cris.gov.ph',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'institution_id' => null,
        ]);

        User::create([
            'name' => 'CHED Officer',
            'email' => 'ched@cris.gov.ph',
            'password' => Hash::make('password'),
            'role' => 'ched',
            'institution_id' => null,
        ]);

        $heiUser = User::create([
            'name' => 'HEI Researcher',
            'email' => 'hei@edu.ph',
            'password' => Hash::make('password'),
            'role' => 'hei',
            'institution_id' => $institution1->id,
        ]);

        // Create Research Proposals
        ResearchProposal::create([
            'title' => 'Impact of K-12 Implementation in CALABARZON',
            'abstract' => 'A comprehensive study on the effects of K-12 curriculum implementation on student outcomes in the CALABARZON region.',
            'researchers' => 'Dr. Juan dela Cruz, Prof. Maria Santos',
            'institution_id' => $institution1->id,
            'category' => 'Education',
            'keywords' => 'K-12, Education, Curriculum, CALABARZON',
            'status' => 'under_review',
            'submitted_by' => $heiUser->id,
        ]);

        ResearchProposal::create([
            'title' => 'Climate Change Impact on Agriculture in Batangas',
            'abstract' => 'Study on how climate change affects agricultural productivity and farming practices in the province of Batangas.',
            'researchers' => 'Dr. Pedro Garcia, Ms. Ana Reyes',
            'institution_id' => $institution2->id,
            'category' => 'Environment',
            'keywords' => 'Climate Change, Agriculture, Batangas',
            'status' => 'approved',
            'submitted_by' => $heiUser->id,
            'reviewed_by' => 2,
            'reviewed_at' => now(),
            'comments' => 'Excellent research design. Approved for implementation.',
        ]);

        ResearchProposal::create([
            'title' => 'Digital Transformation in Higher Education',
            'abstract' => 'An investigation into the digital transformation strategies adopted by HEIs in CALABARZON during and post-pandemic.',
            'researchers' => 'Dr. Maria Lopez',
            'institution_id' => $institution1->id,
            'category' => 'Education',
            'keywords' => 'Digital Transformation, Higher Education, Technology',
            'status' => 'submitted',
            'submitted_by' => $heiUser->id,
        ]);
    }
}
