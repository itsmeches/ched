<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('abstract');
            $table->text('researchers')->nullable();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->text('keywords')->nullable();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');
            $table->string('file_path')->nullable();
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('comments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_proposals');
    }
};