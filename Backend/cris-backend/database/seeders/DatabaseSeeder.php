<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Institutions
        $institution1 = Institution::updateOrCreate([
            'code' => 'UB',
        ], [
            'name' => 'University of Batangas',
            'address' => 'Batangas City, Batangas',
            'contact_email' => 'admin@ub.edu.ph',
            'contact_phone' => '(043) 123-4567',
        ]);

        $institution2 = Institution::updateOrCreate([
            'code' => 'BatStateU',
        ], [
            'name' => 'Batangas State University',
            'address' => 'Batangas City, Batangas',
            'contact_email' => 'admin@batstateu.edu.ph',
            'contact_phone' => '(043) 987-6543',
        ]);

        // Create Users
        $superAdmin = User::updateOrCreate([
            'email' => 'superadmin@cris.gov.ph',
        ], [
            'name' => 'Super Admin',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'institution_id' => null,
        ]);

        $chedUser = User::updateOrCreate([
            'email' => 'ched@cris.gov.ph',
        ], [
            'name' => 'CHED Officer',
            'password' => Hash::make('password'),
            'role' => 'ched',
            'institution_id' => null,
        ]);

        $heiUser = User::updateOrCreate([
            'email' => 'hei@edu.ph',
        ], [
            'name' => 'HEI Researcher',
            'password' => Hash::make('password'),
            'role' => 'hei',
            'institution_id' => $institution1->id,
            'created_by' => $chedUser->id,
            'ched_id' => $chedUser->id,
        ]);

        // Create Research Proposals
        ResearchProposal::updateOrCreate([
            'title' => 'Impact of K-12 Implementation in CALABARZON',
        ], [
            'abstract' => 'A comprehensive study on the effects of K-12 curriculum implementation on student outcomes in the CALABARZON region.',
            'researchers' => 'Dr. Juan dela Cruz, Prof. Maria Santos',
            'institution_id' => $institution1->id,
            'category' => 'Education',
            'keywords' => 'K-12, Education, Curriculum, CALABARZON',
            'status' => 'under_review_ched',
            'submitted_by' => $heiUser->id,
        ]);

        ResearchProposal::updateOrCreate([
            'title' => 'Climate Change Impact on Agriculture in Batangas',
        ], [
            'abstract' => 'Study on how climate change affects agricultural productivity and farming practices in the province of Batangas.',
            'researchers' => 'Dr. Pedro Garcia, Ms. Ana Reyes',
            'institution_id' => $institution2->id,
            'category' => 'Environment',
            'keywords' => 'Climate Change, Agriculture, Batangas',
            'status' => 'approved',
            'submitted_by' => $heiUser->id,
            'reviewed_by' => $chedUser->id,
            'approved_by' => $chedUser->id,
            'approved_at' => now(),
            'reviewed_at' => now(),
            'comments' => 'Excellent research design. Approved for implementation.',
        ]);

        ResearchProposal::updateOrCreate([
            'title' => 'Digital Transformation in Higher Education',
        ], [
            'abstract' => 'An investigation into the digital transformation strategies adopted by HEIs in CALABARZON during and post-pandemic.',
            'researchers' => 'Dr. Maria Lopez',
            'institution_id' => $institution1->id,
            'category' => 'Education',
            'keywords' => 'Digital Transformation, Higher Education, Technology',
            'status' => 'under_review_ched',
            'submitted_by' => $heiUser->id,
        ]);
    }
}
