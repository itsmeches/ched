<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->index(['status', 'year'], 'rp_status_year_idx');
            $table->index('school', 'rp_school_idx');
            $table->index('updated_at', 'rp_updated_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropIndex('rp_status_year_idx');
            $table->dropIndex('rp_school_idx');
            $table->dropIndex('rp_updated_at_idx');
        });
    }
};
