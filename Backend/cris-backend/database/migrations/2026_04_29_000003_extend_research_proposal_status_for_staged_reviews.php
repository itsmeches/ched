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

        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending', 'pending_faculty', 'pending_hei', 'pending_ched', 'approved', 'rejected') NOT NULL DEFAULT 'pending_faculty'");

        // Existing pending records were previously reviewed by CHED directly.
        DB::table('research_proposals')
            ->where('status', 'pending')
            ->update(['status' => 'pending_ched']);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::table('research_proposals')
            ->whereIn('status', ['pending_faculty', 'pending_hei', 'pending_ched'])
            ->update(['status' => 'pending']);

        DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
    }
};
