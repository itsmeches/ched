<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Step 1: allow both legacy and phase-4 values so remapping is safe.
        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending','pending_faculty','pending_hei','pending_ched','draft','submitted','under_review_faculty','under_review_hei','under_review_ched','approved','rejected','needs_revision') NOT NULL DEFAULT 'submitted'");

        DB::table('research_proposals')
            ->where('status', 'pending_faculty')
            ->update(['status' => 'under_review_faculty']);

        DB::table('research_proposals')
            ->where('status', 'pending_hei')
            ->update(['status' => 'under_review_hei']);

        DB::table('research_proposals')
            ->whereIn('status', ['pending_ched', 'pending'])
            ->update(['status' => 'under_review_ched']);

        // Step 2: lock enum to the final phase-4 set.
        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('draft','submitted','under_review_faculty','under_review_hei','under_review_ched','approved','rejected','needs_revision') NOT NULL DEFAULT 'submitted'");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Step 1: allow both phase-4 and legacy values while rolling back mappings.
        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending','pending_faculty','pending_hei','pending_ched','draft','submitted','under_review_faculty','under_review_hei','under_review_ched','approved','rejected','needs_revision') NOT NULL DEFAULT 'pending_faculty'");

        DB::table('research_proposals')
            ->where('status', 'under_review_faculty')
            ->update(['status' => 'pending_faculty']);

        DB::table('research_proposals')
            ->where('status', 'under_review_hei')
            ->update(['status' => 'pending_hei']);

        DB::table('research_proposals')
            ->where('status', 'under_review_ched')
            ->update(['status' => 'pending_ched']);

        DB::table('research_proposals')
            ->whereIn('status', ['draft', 'submitted'])
            ->update(['status' => 'pending_faculty']);

        DB::table('research_proposals')
            ->where('status', 'needs_revision')
            ->update(['status' => 'rejected']);

        // Step 2: restore legacy enum definition.
        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending','pending_faculty','pending_hei','pending_ched','approved','rejected') NOT NULL DEFAULT 'pending_faculty'");
    }
};
