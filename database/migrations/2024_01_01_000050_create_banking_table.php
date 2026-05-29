<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('account_name');
            $table->string('account_number');
            $table->string('account_type')->default('savings'); // savings, current, cash, wallet
            $table->string('bank_name')->nullable();
            $table->string('branch_name')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('swift_code')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->decimal('opening_balance', 20, 4)->default(0);
            $table->decimal('current_balance', 20, 4)->default(0);
            $table->foreignId('gl_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->date('last_reconciled_date')->nullable();
            $table->decimal('last_reconciled_balance', 20, 4)->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'is_active']);
        });

        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->date('transaction_date');
            $table->date('value_date')->nullable();
            $table->string('transaction_type'); // credit, debit
            $table->decimal('amount', 20, 4);
            $table->decimal('balance', 20, 4)->nullable();
            $table->string('reference_number')->nullable();
            $table->text('description');
            $table->string('category')->nullable();
            $table->string('payment_mode')->nullable(); // neft, rtgs, upi, imps, cash, cheque
            $table->string('cheque_number')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->string('matched_type')->nullable(); // invoice, expense, payment
            $table->unsignedBigInteger('matched_id')->nullable();
            $table->string('source')->default('manual'); // manual, import, bank_feed
            $table->json('raw_data')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['bank_account_id', 'transaction_date']);
            $table->index(['is_reconciled']);
        });

        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->nullable();
            $table->date('statement_date');
            $table->decimal('statement_balance', 20, 4);
            $table->decimal('book_balance', 20, 4);
            $table->decimal('difference', 20, 4);
            $table->string('status')->default('in_progress'); // in_progress, completed
            $table->json('reconciled_items')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('completed_by')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('fund_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('transfer_number')->index();
            $table->foreignId('from_account_id')->constrained('bank_accounts');
            $table->foreignId('to_account_id')->constrained('bank_accounts');
            $table->date('transfer_date');
            $table->decimal('amount', 20, 4);
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('completed');
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_transfers');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_accounts');
    }
};
