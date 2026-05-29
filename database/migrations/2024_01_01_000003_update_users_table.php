<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->unique()->index();
            $table->foreignId('company_id')->after('uuid')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->after('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('phone')->after('email')->nullable();
            $table->string('avatar')->after('phone')->nullable();
            $table->string('employee_id')->after('avatar')->nullable();
            $table->string('designation')->after('employee_id')->nullable();
            $table->string('department')->after('designation')->nullable();
            $table->date('date_of_joining')->after('department')->nullable();
            $table->string('status')->default('active')->after('date_of_joining');
            $table->string('two_factor_secret')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->string('timezone')->default('Asia/Kolkata');
            $table->string('locale')->default('en');
            $table->string('currency')->default('INR');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('preferences')->nullable();
            $table->json('notification_preferences')->nullable();

            $table->index(['company_id', 'branch_id']);
            $table->index(['status', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'uuid', 'company_id', 'branch_id', 'phone', 'avatar', 'employee_id',
                'designation', 'department', 'date_of_joining', 'status',
                'two_factor_secret', 'two_factor_enabled', 'two_factor_confirmed_at',
                'timezone', 'locale', 'currency', 'last_login_at', 'last_login_ip',
                'is_active', 'preferences', 'notification_preferences',
            ]);
        });
    }
};
