<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY role ENUM('pending','super_admin','ched','hei','faculty','student') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::table('users')
                ->whereIn('role', ['pending', 'faculty', 'student'])
                ->update(['role' => 'hei']);

            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','ched','hei') NOT NULL DEFAULT 'hei'");
        }
    }
};
