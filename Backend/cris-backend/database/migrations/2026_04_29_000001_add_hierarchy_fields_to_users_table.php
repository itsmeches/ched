<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('institution_id')->constrained('users')->nullOnDelete();
            $table->foreignId('hei_id')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->foreignId('faculty_id')->nullable()->after('hei_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['faculty_id']);
            $table->dropForeign(['hei_id']);
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'hei_id', 'faculty_id']);
        });
    }
};
