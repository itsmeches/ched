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
            $table->text('remarks')->nullable()->after('comments');
            $table->foreignId('rejected_by')->nullable()->after('remarks')->constrained('users')->nullOnDelete();
        });

        DB::table('research_proposals')
            ->where('status', 'rejected')
            ->whereNull('rejected_by')
            ->whereNotNull('reviewed_by')
            ->update(['rejected_by' => DB::raw('reviewed_by')]);

        DB::table('research_proposals')
            ->where('status', 'rejected')
            ->whereNull('remarks')
            ->whereNotNull('comments')
            ->update(['remarks' => DB::raw('comments')]);
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropForeign(['rejected_by']);
            $table->dropColumn(['remarks', 'rejected_by']);
        });
    }
};
