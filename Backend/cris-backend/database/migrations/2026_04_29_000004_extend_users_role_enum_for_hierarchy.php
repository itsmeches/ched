<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY role ENUM('pending','super_admin','ched','hei','faculty','student') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        if (! in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            return;
        }

        DB::table('users')
            ->whereIn('role', ['faculty', 'student'])
            ->update(['role' => 'hei']);

        DB::statement("ALTER TABLE users MODIFY role ENUM('pending','super_admin','ched','hei') NOT NULL DEFAULT 'pending'");
    }
};
