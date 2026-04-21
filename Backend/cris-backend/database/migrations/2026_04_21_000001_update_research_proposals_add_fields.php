<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            // Add missing Phase 3 fields after 'title'
            $table->string('authors')->nullable()->after('title');
            $table->string('co_authors')->nullable()->after('authors');
            $table->smallInteger('year')->nullable()->after('co_authors');
            $table->string('school')->nullable()->after('year');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropColumn(['authors', 'co_authors', 'year', 'school']);
        });
    }
};
