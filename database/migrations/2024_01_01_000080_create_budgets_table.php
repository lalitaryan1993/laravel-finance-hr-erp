<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fiscal_year_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('budget_type')->default('annual'); // annual, quarterly, monthly, project
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('draft'); // draft, active, approved, closed
            $table->decimal('total_amount', 20, 4)->default(0);
            $table->decimal('allocated_amount', 20, 4)->default(0);
            $table->decimal('spent_amount', 20, 4)->default(0);
            $table->decimal('remaining_amount', 20, 4)->default(0);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'fiscal_year_id', 'status']);
        });

        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('expense_category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('amount', 20, 4)->default(0);
            $table->decimal('actual_amount', 20, 4)->default(0);
            $table->decimal('variance', 20, 4)->default(0);
            $table->json('monthly_breakdown')->nullable(); // Amount per month
            $table->string('period_type')->default('annual');
            $table->timestamps();
        });

        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('budget_lines');
        Schema::dropIfExists('budgets');
    }
};
