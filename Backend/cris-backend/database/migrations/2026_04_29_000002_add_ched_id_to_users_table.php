<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('ched_id')
                ->nullable()
                ->after('faculty_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        // Backfill HEI -> CHED using creator role when available.
        $heiUsers = DB::table('users')
            ->where('role', 'hei')
            ->whereNull('ched_id')
            ->whereNotNull('created_by')
            ->get(['id', 'created_by']);

        foreach ($heiUsers as $hei) {
            $creator = DB::table('users')
                ->where('id', $hei->created_by)
                ->first(['id', 'role']);

            if ($creator && $creator->role === 'ched') {
                DB::table('users')
                    ->where('id', $hei->id)
                    ->update(['ched_id' => $creator->id]);
            }
        }

        // Backfill Faculty -> CHED from linked HEI when available.
        $facultyUsers = DB::table('users')
            ->where('role', 'faculty')
            ->whereNull('ched_id')
            ->whereNotNull('hei_id')
            ->get(['id', 'hei_id']);

        foreach ($facultyUsers as $faculty) {
            $hei = DB::table('users')
                ->where('id', $faculty->hei_id)
                ->first(['ched_id']);

            if ($hei && $hei->ched_id) {
                DB::table('users')
                    ->where('id', $faculty->id)
                    ->update(['ched_id' => $hei->ched_id]);
            }
        }

        // Backfill Student -> CHED from linked Faculty when available.
        $studentUsers = DB::table('users')
            ->where('role', 'student')
            ->whereNull('ched_id')
            ->whereNotNull('faculty_id')
            ->get(['id', 'faculty_id']);

        foreach ($studentUsers as $student) {
            $faculty = DB::table('users')
                ->where('id', $student->faculty_id)
                ->first(['ched_id']);

            if ($faculty && $faculty->ched_id) {
                DB::table('users')
                    ->where('id', $student->id)
                    ->update(['ched_id' => $faculty->ched_id]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['ched_id']);
            $table->dropColumn('ched_id');
        });
    }
};
