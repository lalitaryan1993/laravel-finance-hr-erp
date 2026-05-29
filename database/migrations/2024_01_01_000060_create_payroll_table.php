<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->foreignId('head_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });

        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('pay_frequency')->default('monthly'); // monthly, weekly, bi_weekly
            $table->json('components')->nullable(); // earnings + deductions
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code')->index();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('designation')->nullable();
            $table->date('date_of_joining');
            $table->date('date_of_leaving')->nullable();
            $table->string('employment_type')->default('full_time'); // full_time, part_time, contract
            $table->string('status')->default('active');
            $table->string('pan_number')->nullable();
            $table->string('uan_number')->nullable();   // PF UAN
            $table->string('esi_number')->nullable();
            $table->string('aadhar_number')->nullable();
            $table->json('bank_details')->nullable();
            $table->foreignId('salary_structure_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('basic_salary', 20, 4)->default(0);
            $table->decimal('hra', 20, 4)->default(0);
            $table->decimal('gross_salary', 20, 4)->default(0);
            $table->decimal('net_salary', 20, 4)->default(0);
            $table->boolean('pf_applicable')->default(true);
            $table->boolean('esi_applicable')->default(false);
            $table->string('tax_regime')->default('new'); // old, new
            $table->json('tax_declarations')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'employee_code']);
            $table->index(['company_id', 'status', 'department_id']);
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('run_number')->index();
            $table->string('month');         // e.g., 2024-03
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->date('payment_date');
            $table->string('status')->default('draft'); // draft, processing, approved, paid, cancelled
            $table->decimal('total_gross', 20, 4)->default(0);
            $table->decimal('total_deductions', 20, 4)->default(0);
            $table->decimal('total_net', 20, 4)->default(0);
            $table->decimal('total_employer_pf', 20, 4)->default(0);
            $table->decimal('total_employer_esi', 20, 4)->default(0);
            $table->integer('employee_count')->default(0);
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'month', 'status']);
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payroll_run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('payslip_number')->index();
            $table->string('month');
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->integer('working_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('lop_days')->default(0);     // Loss of Pay
            $table->decimal('basic_salary', 20, 4)->default(0);
            $table->decimal('hra', 20, 4)->default(0);
            $table->json('earnings')->nullable();          // All earning components
            $table->json('deductions')->nullable();        // All deduction components
            $table->decimal('gross_earnings', 20, 4)->default(0);
            $table->decimal('total_deductions', 20, 4)->default(0);
            $table->decimal('net_pay', 20, 4)->default(0);
            $table->decimal('employee_pf', 20, 4)->default(0);
            $table->decimal('employer_pf', 20, 4)->default(0);
            $table->decimal('employee_esi', 20, 4)->default(0);
            $table->decimal('employer_esi', 20, 4)->default(0);
            $table->decimal('professional_tax', 20, 4)->default(0);
            $table->decimal('tds', 20, 4)->default(0);
            $table->decimal('bonus', 20, 4)->default(0);
            $table->string('status')->default('generated');
            $table->string('pdf_path')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('salary_structures');
        Schema::dropIfExists('departments');
    }
};
