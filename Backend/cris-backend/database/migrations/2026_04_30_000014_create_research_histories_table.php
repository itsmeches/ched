<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_id')
                ->constrained('research_proposals')
                ->cascadeOnDelete();
            $table->string('action', 32);
            $table->foreignId('performed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('role', 32);
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['research_id', 'created_at'], 'rh_research_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_histories');
    }
};
