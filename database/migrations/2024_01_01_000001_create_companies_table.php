<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->index();
            $table->string('name');
            $table->string('legal_name')->nullable();
            $table->string('slug')->unique();
            $table->string('registration_number')->nullable();
            $table->string('tax_id')->nullable();              // GST/VAT number
            $table->string('pan_number')->nullable();          // PAN
            $table->string('cin_number')->nullable();          // CIN
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('industry')->nullable();
            $table->string('company_type')->default('private_limited');
            $table->text('address_line1')->nullable();
            $table->text('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('pincode')->nullable();
            $table->string('logo')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->string('currency_symbol', 5)->default('₹');
            $table->string('timezone')->default('Asia/Kolkata');
            $table->string('date_format')->default('d/m/Y');
            $table->string('financial_year_start')->default('04');  // April
            $table->boolean('gst_registered')->default(true);
            $table->boolean('tds_applicable')->default(true);
            $table->string('subscription_plan')->default('professional');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->json('tax_settings')->nullable();
            $table->json('notification_settings')->nullable();
            $table->string('bank_account_details')->nullable();
            $table->string('signature_path')->nullable();
            $table->string('stamp_path')->nullable();
            $table->string('invoice_prefix')->default('INV');
            $table->integer('invoice_sequence')->default(1);
            $table->string('expense_prefix')->default('EXP');
            $table->string('po_prefix')->default('PO');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active']);
            $table->index(['subscription_plan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
