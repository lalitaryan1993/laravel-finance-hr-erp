<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->decimal('budget_amount', 20, 4)->nullable();
            $table->boolean('requires_receipt')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('expense_number')->index();
            $table->foreignId('category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('expense_date');
            $table->text('description');
            $table->decimal('amount', 20, 4);
            $table->decimal('tax_amount', 20, 4)->default(0);
            $table->decimal('total_amount', 20, 4);
            $table->string('currency', 3)->default('INR');
            $table->string('payment_method')->default('cash');
            $table->string('reference_number')->nullable();
            $table->boolean('is_billable')->default(false);
            $table->unsignedBigInteger('billable_to')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, approved, rejected, paid, reimbursed
            $table->decimal('mileage_distance')->nullable();
            $table->decimal('mileage_rate')->nullable();
            $table->foreignId('project_id')->nullable();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->json('attachments')->nullable();
            $table->json('ocr_data')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status', 'expense_date']);
            $table->index(['employee_id', 'status']);
        });

        Schema::create('expense_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->decimal('max_amount', 20, 4)->nullable();
            $table->boolean('requires_receipt')->default(true);
            $table->boolean('requires_approval')->default(true);
            $table->string('approval_threshold')->nullable();
            $table->string('applicable_to')->nullable(); // role, department, all
            $table->json('applicable_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_policies');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
