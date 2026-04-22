<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->foreignId('viewed_by')
                ->nullable()
                ->after('submitted_by')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('viewed_at')->nullable()->after('viewed_by');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropConstrainedForeignId('viewed_by');
            $table->dropColumn('viewed_at');
        });
    }
};
