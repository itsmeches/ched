<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'ched', 'hei', 'faculty', 'student'])->default('hei')->after('email');
            $table->foreignId('institution_id')->nullable()->constrained()->onDelete('set null')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropColumn(['role', 'institution_id']);
        });
    }
};
