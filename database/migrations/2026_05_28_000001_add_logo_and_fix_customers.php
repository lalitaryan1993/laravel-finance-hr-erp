<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('customer_type');
            $table->string('billing_city')->nullable()->change();
            $table->string('billing_state')->nullable()->change();
            $table->string('billing_country')->default('India')->change();
            $table->string('billing_state_code', 10)->nullable()->after('billing_state');
            $table->string('billing_country_code', 5)->nullable()->after('billing_country');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['logo', 'billing_state_code', 'billing_country_code']);
        });
    }
};
