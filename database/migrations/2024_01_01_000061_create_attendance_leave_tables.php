<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Leave Types ──────────────────────────────────────────────────────
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');                          // Annual Leave, Sick Leave, etc.
            $table->string('code', 10)->index();             // AL, SL, CL, EL, ML, PL
            $table->integer('days_per_year')->default(0);
            $table->boolean('carry_forward')->default(false);
            $table->integer('carry_forward_max')->default(0);
            $table->enum('pay_status', ['paid', 'unpaid'])->default('paid');
            $table->boolean('requires_approval')->default(true);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });

        // ── Leave Allocations (annual balance per employee) ───────────────────
        Schema::create('leave_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('year');
            $table->decimal('allocated_days', 6, 2)->default(0);
            $table->decimal('used_days',      6, 2)->default(0);
            $table->decimal('balance_days',   6, 2)->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'leave_type_id', 'year'], 'leave_alloc_unique');
        });

        // ── Leave Requests ───────────────────────────────────────────────────
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete();
            $table->date('from_date');
            $table->date('to_date');
            $table->decimal('days', 5, 2);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id', 'status']);
            $table->index(['company_id', 'from_date', 'to_date']);
        });

        // ── Attendances ──────────────────────────────────────────────────────
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->enum('status', [
                'present', 'absent', 'half_day', 'wfh',
                'holiday', 'leave', 'late', 'on_duty'
            ])->default('present');
            $table->decimal('working_hours', 5, 2)->nullable();
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('shift')->nullable();               // morning, afternoon, night
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('marked_by')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date'], 'attendance_emp_date_unique');
            $table->index(['company_id', 'date']);
            $table->index(['company_id', 'employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_allocations');
        Schema::dropIfExists('leave_types');
    }
};
