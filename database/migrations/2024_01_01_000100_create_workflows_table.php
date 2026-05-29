<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('module');  // expense, invoice, purchase_order, payroll, journal, budget
            $table->json('steps');     // Array of approval steps with roles/users and conditions
            $table->json('conditions')->nullable(); // Trigger conditions (amount thresholds etc.)
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_approve_below')->default(false);
            $table->decimal('auto_approve_amount', 20, 4)->nullable();
            $table->boolean('escalation_enabled')->default(false);
            $table->integer('escalation_hours')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'module', 'is_active']);
        });

        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workflow_template_id')->nullable()->constrained()->nullOnDelete();
            $table->string('approvable_type');
            $table->unsignedBigInteger('approvable_id');
            $table->string('module');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 20, 4)->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->integer('current_step')->default(1);
            $table->integer('total_steps')->default(1);
            $table->unsignedBigInteger('requested_by');
            $table->unsignedBigInteger('current_approver_id')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['approvable_type', 'approvable_id']);
            $table->index(['company_id', 'status', 'module']);
            $table->index(['current_approver_id', 'status']);
        });

        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_request_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('approver_id');
            $table->integer('step');
            $table->string('action');  // approved, rejected, escalated, commented
            $table->text('comment')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('acted_at');
            $table->timestamps();

            $table->index(['approval_request_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
        Schema::dropIfExists('approval_requests');
        Schema::dropIfExists('workflow_templates');
    }
};
