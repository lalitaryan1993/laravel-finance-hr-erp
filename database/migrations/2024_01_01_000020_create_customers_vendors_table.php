<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('customer_code')->nullable();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('website')->nullable();
            $table->string('pan_number')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('customer_type')->default('individual'); // individual, company
            $table->text('billing_address')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_country')->default('India');
            $table->string('billing_pincode')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->decimal('credit_limit', 20, 4)->default(0);
            $table->integer('credit_days')->default(30);
            $table->decimal('outstanding_balance', 20, 4)->default(0);
            $table->foreignId('ledger_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('payment_terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('status')->default('active');
            $table->json('bank_details')->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'is_active']);
            $table->unique(['company_id', 'customer_code']);
        });

        // Vendors
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('vendor_code')->nullable();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('website')->nullable();
            $table->string('pan_number')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('vendor_type')->default('supplier'); // supplier, contractor, service_provider
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('pincode')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->integer('payment_days')->default(30);
            $table->decimal('outstanding_balance', 20, 4)->default(0);
            $table->foreignId('ledger_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('payment_terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('rating')->nullable();
            $table->json('bank_details')->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('tds_applicable')->default(false);
            $table->string('tds_section')->nullable();
            $table->decimal('tds_rate', 5, 2)->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'is_active']);
            $table->unique(['company_id', 'vendor_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('customers');
    }
};
