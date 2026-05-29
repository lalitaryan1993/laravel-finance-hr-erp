<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fiscal_year_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('accounting_period_id')->nullable()->constrained()->nullOnDelete();
            $table->string('journal_number')->index();
            $table->string('reference')->nullable();
            $table->string('journal_type');           // general, sales, purchase, payment, receipt, contra, adjustment
            $table->date('date');
            $table->text('narration')->nullable();
            $table->decimal('total_debit', 20, 4)->default(0);
            $table->decimal('total_credit', 20, 4)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->string('status')->default('draft'); // draft, posted, voided, reversed
            $table->boolean('is_recurring')->default(false);
            $table->unsignedBigInteger('recurring_template_id')->nullable();
            $table->unsignedBigInteger('reversed_by')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->string('source_module')->nullable(); // invoice, expense, payroll, etc.
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('source_type')->nullable();
            $table->string('approved_by_name')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('posted_by')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->json('attachments')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'date', 'status']);
            $table->index(['company_id', 'journal_type']);
            $table->index(['source_module', 'source_id']);
        });

        Schema::create('journal_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('company_id')->constrained();
            $table->text('description')->nullable();
            $table->decimal('debit', 20, 4)->default(0);
            $table->decimal('credit', 20, 4)->default(0);
            // amount is computed in application layer
            $table->string('currency', 3)->default('INR');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->decimal('base_debit', 20, 4)->default(0);
            $table->decimal('base_credit', 20, 4)->default(0);
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cost_center_id')->nullable();
            $table->foreignId('project_id')->nullable();
            $table->string('partner_type')->nullable(); // customer, vendor
            $table->unsignedBigInteger('partner_id')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->timestamp('reconciled_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['journal_id']);
            $table->index(['account_id', 'company_id']);
            $table->index(['partner_type', 'partner_id']);
        });

        // Recurring journal templates
        Schema::create('recurring_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('frequency');  // daily, weekly, monthly, quarterly, yearly
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('next_run_date');
            $table->integer('occurrences_remaining')->nullable();
            $table->json('journal_template');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_journals');
        Schema::dropIfExists('journal_lines');
        Schema::dropIfExists('journals');
    }
};
