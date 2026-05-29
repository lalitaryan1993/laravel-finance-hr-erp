<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('depreciation_method')->default('straight_line'); // straight_line, declining_balance, units_of_production
            $table->decimal('depreciation_rate', 8, 4)->default(0);
            $table->integer('useful_life_years')->nullable();
            $table->decimal('salvage_value_percent', 8, 4)->default(0);
            $table->foreignId('asset_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('depreciation_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('accumulated_depreciation_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->constrained('asset_categories')->cascadeOnDelete();
            $table->string('asset_code')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('barcode')->nullable();
            $table->string('qr_code')->nullable();
            $table->string('location')->nullable();
            $table->date('purchase_date');
            $table->decimal('purchase_cost', 20, 4);
            $table->decimal('salvage_value', 20, 4)->default(0);
            $table->decimal('book_value', 20, 4)->default(0);
            $table->decimal('accumulated_depreciation', 20, 4)->default(0);
            $table->integer('useful_life_years');
            $table->string('depreciation_method');
            $table->decimal('depreciation_rate', 8, 4)->default(0);
            $table->date('depreciation_start_date');
            $table->date('last_depreciation_date')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('purchase_invoice_number')->nullable();
            $table->string('warranty_number')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->string('status')->default('active'); // active, disposed, transferred, under_maintenance
            $table->date('disposal_date')->nullable();
            $table->decimal('disposal_amount', 20, 4)->nullable();
            $table->string('assigned_to_type')->nullable(); // user, department
            $table->unsignedBigInteger('assigned_to_id')->nullable();
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'asset_code']);
            $table->index(['company_id', 'status', 'category_id']);
        });

        Schema::create('asset_depreciations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('period');   // e.g., 2024-03
            $table->date('depreciation_date');
            $table->decimal('depreciation_amount', 20, 4);
            $table->decimal('book_value_after', 20, 4);
            $table->decimal('accumulated_depreciation', 20, 4);
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->timestamps();

            $table->index(['asset_id', 'period']);
        });

        Schema::create('asset_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('maintenance_type');  // preventive, corrective
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->text('description');
            $table->decimal('cost', 20, 4)->default(0);
            $table->string('vendor_name')->nullable();
            $table->string('status')->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_maintenances');
        Schema::dropIfExists('asset_depreciations');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_categories');
    }
};
