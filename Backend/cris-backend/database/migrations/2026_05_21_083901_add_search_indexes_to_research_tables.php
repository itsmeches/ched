<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->index('discipline_code', 'rp_discipline_code_idx');
            $table->index('research_category', 'rp_research_category_idx');
            $table->index(['status', 'approved_at'], 'rp_status_approved_at_idx');
        });

        Schema::table('research_proposal_histories', function (Blueprint $table) {
            $table->index('user_id', 'rph_user_id_idx');
        });

        Schema::table('research_histories', function (Blueprint $table) {
            $table->index('performed_by', 'rh_performed_by_idx');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropIndex('rp_discipline_code_idx');
            $table->dropIndex('rp_research_category_idx');
            $table->dropIndex('rp_status_approved_at_idx');
        });

        Schema::table('research_proposal_histories', function (Blueprint $table) {
            $table->dropIndex('rph_user_id_idx');
        });

        Schema::table('research_histories', function (Blueprint $table) {
            $table->dropIndex('rh_performed_by_idx');
        });
    }
};
