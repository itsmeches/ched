<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('submitted_by');
            $table->timestamp('approved_by_faculty_at')->nullable()->after('submitted_at');
            $table->timestamp('approved_by_hei_at')->nullable()->after('approved_by_faculty_at');
            $table->timestamp('approved_by_ched_at')->nullable()->after('approved_by_hei_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_by_ched_at');
        });

        DB::table('research_proposals')
            ->whereNull('submitted_at')
            ->update(['submitted_at' => DB::raw('created_at')]);

        DB::table('research_proposals')
            ->where('status', 'approved')
            ->whereNull('approved_by_ched_at')
            ->update(['approved_by_ched_at' => DB::raw('approved_at')]);

        DB::table('research_proposals')
            ->where('status', 'rejected')
            ->whereNull('rejected_at')
            ->update(['rejected_at' => DB::raw('reviewed_at')]);
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropColumn([
                'submitted_at',
                'approved_by_faculty_at',
                'approved_by_hei_at',
                'approved_by_ched_at',
                'rejected_at',
            ]);
        });
    }
};
