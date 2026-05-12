<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->index(['institution_id', 'status'], 'research_inst_status_idx');
            $table->index(['submitted_by', 'status'], 'research_submitter_status_idx');
            $table->index('created_at', 'research_created_at_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'users_role_idx');
            $table->index(['role', 'institution_id'], 'users_role_inst_idx');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropIndex('research_inst_status_idx');
            $table->dropIndex('research_submitter_status_idx');
            $table->dropIndex('research_created_at_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_idx');
            $table->dropIndex('users_role_inst_idx');
        });
    }
};
