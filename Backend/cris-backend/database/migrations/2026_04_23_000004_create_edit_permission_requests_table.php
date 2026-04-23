<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edit_permission_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_proposal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['research_proposal_id', 'status'], 'epr_proposal_status_idx');
            $table->index(['requested_by', 'status'], 'epr_requester_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edit_permission_requests');
    }
};
