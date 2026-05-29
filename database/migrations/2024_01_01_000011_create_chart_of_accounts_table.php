<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type');                    // asset, liability, equity, income, expense
            $table->string('nature');                  // debit, credit
            $table->foreignId('parent_id')->nullable()->constrained('account_groups');
            $table->integer('depth')->default(0);
            $table->string('path')->nullable();
            $table->boolean('is_system')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('account_group_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();          // Account code e.g., 1001
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type');                    // asset, liability, equity, income, expense
            $table->string('sub_type')->nullable();    // current_asset, fixed_asset, etc.
            $table->string('nature');                  // debit, credit
            $table->decimal('opening_balance', 20, 4)->default(0);
            $table->string('opening_balance_type')->nullable(); // debit, credit
            $table->decimal('current_balance', 20, 4)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->boolean('is_bank_account')->default(false);
            $table->boolean('is_cash_account')->default(false);
            $table->boolean('is_tax_account')->default(false);
            $table->boolean('is_reconcilable')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->boolean('allow_direct_posting')->default(true);
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'type', 'is_active']);
            $table->index(['company_id', 'account_group_id']);
            $table->index(['code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('account_groups');
    }
};
