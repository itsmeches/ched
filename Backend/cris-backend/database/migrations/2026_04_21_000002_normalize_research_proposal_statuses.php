<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('draft', 'submitted', 'under_review', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        }

        DB::table('research_proposals')
            ->whereIn('status', ['draft', 'submitted', 'under_review'])
            ->update(['status' => 'pending']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('draft', 'submitted', 'under_review', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'draft'");
        }

        DB::table('research_proposals')
            ->where('status', 'pending')
            ->update(['status' => 'submitted']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE research_proposals MODIFY status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'draft'");
        }
    }
};
