<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tax Rates
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type');              // gst, vat, tds, cess
            $table->decimal('rate', 8, 4);
            $table->string('hsn_sac_code')->nullable();
            $table->string('component')->nullable(); // cgst, sgst, igst, ugst
            $table->boolean('is_compound')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('components')->nullable(); // for GST split
            $table->timestamps();
        });

        // Invoice templates
        Schema::create('invoice_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('template_file');
            $table->json('settings')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Invoices (Sales & Purchase)
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fiscal_year_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invoice_number')->index();
            $table->string('reference_number')->nullable();
            $table->string('type');                // sales, purchase, credit_note, debit_note, proforma, advance
            $table->string('party_type');          // customer, vendor
            $table->unsignedBigInteger('party_id');
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->decimal('exchange_rate', 10, 6)->default(1);

            // Amounts
            $table->decimal('subtotal', 20, 4)->default(0);
            $table->decimal('discount_amount', 20, 4)->default(0);
            $table->decimal('discount_percent', 8, 4)->default(0);
            $table->decimal('taxable_amount', 20, 4)->default(0);
            $table->decimal('tax_amount', 20, 4)->default(0);
            $table->decimal('cgst_amount', 20, 4)->default(0);
            $table->decimal('sgst_amount', 20, 4)->default(0);
            $table->decimal('igst_amount', 20, 4)->default(0);
            $table->decimal('cess_amount', 20, 4)->default(0);
            $table->decimal('tds_amount', 20, 4)->default(0);
            $table->decimal('shipping_amount', 20, 4)->default(0);
            $table->decimal('adjustment_amount', 20, 4)->default(0);
            $table->decimal('grand_total', 20, 4)->default(0);
            $table->decimal('paid_amount', 20, 4)->default(0);
            $table->decimal('balance_due', 20, 4)->default(0);

            $table->string('status')->default('draft'); // draft, sent, viewed, partial, paid, overdue, cancelled, void
            $table->string('payment_status')->default('unpaid'); // unpaid, partial, paid
            $table->string('payment_terms')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->unsignedBigInteger('recurring_template_id')->nullable();
            $table->boolean('is_credit_note')->default(false);
            $table->unsignedBigInteger('credit_note_for')->nullable();

            // GST
            $table->string('supply_type')->nullable(); // inter_state, intra_state
            $table->string('place_of_supply')->nullable();
            $table->boolean('is_reverse_charge')->default(false);
            $table->string('gst_treatment')->nullable();

            // Bank / Payment
            $table->string('payment_link')->nullable();
            $table->string('qr_code_path')->nullable();

            // Shipping
            $table->json('shipping_address')->nullable();
            $table->json('billing_address')->nullable();

            // Notes
            $table->text('terms_conditions')->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('internal_notes')->nullable();

            // Accounting
            $table->foreignId('sales_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('receivable_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->unsignedBigInteger('journal_id')->nullable();

            $table->foreignId('template_id')->nullable()->constrained('invoice_templates')->nullOnDelete();
            $table->string('pdf_path')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'type', 'status']);
            $table->index(['company_id', 'party_type', 'party_id']);
            $table->index(['company_id', 'invoice_date']);
            $table->index(['due_date', 'status']);
            $table->index(['payment_status']);
        });

        // Invoice Line Items
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained();
            $table->string('item_type')->default('service'); // product, service
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->string('hsn_sac_code')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('quantity', 15, 4)->default(1);
            $table->decimal('unit_price', 20, 4)->default(0);
            $table->decimal('discount_percent', 8, 4)->default(0);
            $table->decimal('discount_amount', 20, 4)->default(0);
            $table->decimal('taxable_amount', 20, 4)->default(0);
            $table->decimal('tax_rate', 8, 4)->default(0);
            $table->decimal('cgst_rate', 8, 4)->default(0);
            $table->decimal('sgst_rate', 8, 4)->default(0);
            $table->decimal('igst_rate', 8, 4)->default(0);
            $table->decimal('cess_rate', 8, 4)->default(0);
            $table->decimal('tax_amount', 20, 4)->default(0);
            $table->decimal('total_amount', 20, 4)->default(0);
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('tax_rate_id')->nullable()->constrained('tax_rates')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['invoice_id']);
        });

        // Payments received/made
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payment_number')->index();
            $table->string('type');                  // received, made
            $table->string('party_type');            // customer, vendor
            $table->unsignedBigInteger('party_id');
            $table->date('payment_date');
            $table->decimal('amount', 20, 4);
            $table->string('currency', 3)->default('INR');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->string('payment_method');        // cash, bank, cheque, upi, neft, rtgs
            $table->string('reference_number')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->foreignId('bank_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('status')->default('completed');
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->json('attachments')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'type', 'party_type', 'party_id']);
            $table->index(['payment_date']);
        });

        // Payment allocations (which payment covers which invoice)
        Schema::create('payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->decimal('allocated_amount', 20, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('invoice_templates');
        Schema::dropIfExists('tax_rates');
    }
};
