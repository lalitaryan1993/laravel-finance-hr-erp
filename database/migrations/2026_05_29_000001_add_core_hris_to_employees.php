<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('phone');
            $table->string('marital_status')->nullable()->after('gender');
            $table->string('blood_group')->nullable()->after('marital_status');
            $table->string('personal_email')->nullable()->after('email');
            $table->text('current_address')->nullable()->after('designation');
            $table->text('permanent_address')->nullable()->after('current_address');
            $table->foreignId('reporting_manager_id')->nullable()->after('department_id')->constrained('employees')->nullOnDelete();
            $table->string('work_location')->nullable()->after('designation');
            $table->date('probation_end_date')->nullable()->after('date_of_joining');
            $table->date('confirmation_date')->nullable()->after('probation_end_date');
            $table->unsignedSmallInteger('notice_period_days')->nullable()->after('employment_type');
            $table->date('exit_date')->nullable()->after('date_of_leaving');
            $table->string('exit_reason')->nullable()->after('exit_date');
            $table->boolean('rehire_eligible')->default(true)->after('exit_reason');
            $table->text('exit_notes')->nullable()->after('rehire_eligible');
        });

        Schema::create('employee_emergency_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('relationship');
            $table->string('phone', 30);
            $table->string('alternate_phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
        });

        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
            $table->index(['company_id', 'expiry_date']);
        });

        Schema::create('employee_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('qualification');
            $table->string('institution')->nullable();
            $table->string('field_of_study')->nullable();
            $table->unsignedSmallInteger('start_year')->nullable();
            $table->unsignedSmallInteger('end_year')->nullable();
            $table->string('grade')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
        });

        Schema::create('employee_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('employer_name');
            $table->string('job_title')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();
            $table->text('responsibilities')->nullable();
            $table->decimal('last_salary', 20, 4)->nullable();
            $table->text('reason_for_leaving')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
        });

        Schema::create('employee_dependents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('relationship');
            $table->date('date_of_birth')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('is_nominee')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
        });

        Schema::create('employee_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('asset_name');
            $table->string('asset_code')->nullable();
            $table->string('category')->nullable();
            $table->date('issued_on')->nullable();
            $table->date('return_due_on')->nullable();
            $table->date('returned_on')->nullable();
            $table->string('condition_issued')->nullable();
            $table->string('condition_returned')->nullable();
            $table->string('status')->default('issued');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
            $table->index(['company_id', 'status']);
        });

        Schema::create('employee_lifecycle_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('completed_by')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['company_id', 'employee_id', 'type']);
            $table->index(['company_id', 'status']);
        });

        Schema::create('employee_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('note_type')->default('general');
            $table->text('body');
            $table->string('visibility')->default('internal');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_notes');
        Schema::dropIfExists('employee_lifecycle_tasks');
        Schema::dropIfExists('employee_assets');
        Schema::dropIfExists('employee_dependents');
        Schema::dropIfExists('employee_experiences');
        Schema::dropIfExists('employee_educations');
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('employee_emergency_contacts');

        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reporting_manager_id');
            $table->dropColumn([
                'gender',
                'marital_status',
                'blood_group',
                'personal_email',
                'current_address',
                'permanent_address',
                'work_location',
                'probation_end_date',
                'confirmation_date',
                'notice_period_days',
                'exit_date',
                'exit_reason',
                'rehire_eligible',
                'exit_notes',
            ]);
        });
    }
};

