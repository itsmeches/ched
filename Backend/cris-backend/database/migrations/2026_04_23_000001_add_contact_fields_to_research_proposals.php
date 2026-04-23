<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->string('author_email')->nullable()->after('authors');
            $table->string('author_phone')->nullable()->after('author_email');
            $table->string('co_author_emails')->nullable()->after('co_authors');
            $table->string('co_author_phones')->nullable()->after('co_author_emails');
        });
    }

    public function down(): void
    {
        Schema::table('research_proposals', function (Blueprint $table) {
            $table->dropColumn(['author_email', 'author_phone', 'co_author_emails', 'co_author_phones']);
        });
    }
};
