<?php

namespace Tests\Feature\Payroll;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CoreEmployeeHrisTest extends TestCase
{
    private array $createdCompanyIds = [];

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.url' => 'http://localhost',
            'database.default' => 'mysql',
            'database.connections.mysql.host' => '127.0.0.1',
            'database.connections.mysql.port' => '3306',
            'database.connections.mysql.database' => 'ai_fms',
            'database.connections.mysql.username' => 'root',
            'database.connections.mysql.password' => '',
        ]);

        DB::purge('mysql');
        DB::reconnect('mysql');
        URL::forceRootUrl('http://localhost');
    }

    protected function tearDown(): void
    {
        foreach (array_reverse($this->createdCompanyIds) as $companyId) {
            foreach ([
                'employee_notes',
                'employee_lifecycle_tasks',
                'employee_assets',
                'employee_dependents',
                'employee_experiences',
                'employee_educations',
                'employee_documents',
                'employee_emergency_contacts',
                'employees',
                'departments',
                'users',
            ] as $table) {
                if (Schema::hasTable($table)) {
                    DB::table($table)->where('company_id', $companyId)->delete();
                }
            }

            if (Schema::hasTable('companies')) {
                DB::table('companies')->where('id', $companyId)->delete();
            }
        }

        parent::tearDown();
    }

    public function test_employee_loads_core_hris_relationships(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $employee->emergencyContacts()->create([
            'company_id' => $company->id,
            'name' => 'Anita Sharma',
            'relationship' => 'Spouse',
            'phone' => '9876543210',
            'is_primary' => true,
        ]);

        $employee->documents()->create([
            'company_id' => $company->id,
            'document_type' => 'pan',
            'document_number' => 'ABCDE1234F',
            'status' => 'verified',
        ]);

        $employee->assignedAssets()->create([
            'company_id' => $company->id,
            'asset_name' => 'Laptop',
            'asset_code' => 'LAP-001',
            'category' => 'IT',
            'issued_on' => now()->toDateString(),
            'status' => 'issued',
        ]);

        $employee->lifecycleTasks()->create([
            'company_id' => $company->id,
            'type' => 'onboarding',
            'title' => 'Collect KYC',
            'status' => 'pending',
            'sort_order' => 1,
        ]);

        $loaded = Employee::with([
            'emergencyContacts',
            'documents',
            'assignedAssets',
            'lifecycleTasks',
        ])->findOrFail($employee->id);

        $this->assertCount(1, $loaded->emergencyContacts);
        $this->assertCount(1, $loaded->getRelation('documents'));
        $this->assertCount(1, $loaded->assignedAssets);
        $this->assertCount(1, $loaded->lifecycleTasks);
    }

    public function test_user_can_add_emergency_contact_to_company_employee(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $this->actingAs($user)
            ->post("/payroll/employees/{$employee->id}/emergency-contacts", [
                'name' => 'Ravi Sharma',
                'relationship' => 'Father',
                'phone' => '9999999999',
                'is_primary' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('employee_emergency_contacts', [
            'company_id' => $company->id,
            'employee_id' => $employee->id,
            'name' => 'Ravi Sharma',
            'is_primary' => true,
        ]);
    }

    public function test_user_cannot_add_document_to_other_company_employee(): void
    {
        [, $user] = $this->employeeFixture();
        [$otherCompany, , $otherEmployee] = $this->employeeFixture('Other Company', 'other@example.com');

        $this->actingAs($user)
            ->post("/payroll/employees/{$otherEmployee->id}/documents", [
                'document_type' => 'pan',
                'document_number' => 'ZZZZZ1234Z',
                'status' => 'verified',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('employee_documents', [
            'company_id' => $otherCompany->id,
            'employee_id' => $otherEmployee->id,
            'document_number' => 'ZZZZZ1234Z',
        ]);
    }

    public function test_primary_emergency_contact_is_unique_per_employee(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $first = $employee->emergencyContacts()->create([
            'company_id' => $company->id,
            'name' => 'First Contact',
            'relationship' => 'Sibling',
            'phone' => '9000000001',
            'is_primary' => true,
        ]);

        $this->actingAs($user)
            ->post("/payroll/employees/{$employee->id}/emergency-contacts", [
                'name' => 'Second Contact',
                'relationship' => 'Spouse',
                'phone' => '9000000002',
                'is_primary' => true,
            ])
            ->assertRedirect();

        $this->assertFalse($first->fresh()->is_primary);
        $this->assertDatabaseHas('employee_emergency_contacts', [
            'employee_id' => $employee->id,
            'name' => 'Second Contact',
            'is_primary' => true,
        ]);
    }

    public function test_lifecycle_task_completion_sets_completed_metadata(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $task = $employee->lifecycleTasks()->create([
            'company_id' => $company->id,
            'type' => 'onboarding',
            'title' => 'Create email account',
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->post("/payroll/employees/{$employee->id}/lifecycle-tasks/{$task->id}/complete")
            ->assertRedirect();

        $task->refresh();

        $this->assertSame('completed', $task->status);
        $this->assertSame($user->id, $task->completed_by);
        $this->assertNotNull($task->completed_at);
    }

    public function test_employee_index_includes_hris_stats(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $employee->emergencyContacts()->create([
            'company_id' => $company->id,
            'name' => 'Primary Contact',
            'relationship' => 'Spouse',
            'phone' => '9888888888',
            'is_primary' => true,
        ]);

        $this->actingAs($user)
            ->get('/payroll/employees')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Payroll/Employees/Index')
                ->has('stats.active')
                ->has('stats.onboarding')
                ->has('stats.probation')
                ->has('stats.incomplete_profiles')
                ->has('stats.documents_expiring')
            );
    }

    public function test_employee_profile_includes_hris_relationships(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();

        $employee->emergencyContacts()->create([
            'company_id' => $company->id,
            'name' => 'Primary Contact',
            'relationship' => 'Spouse',
            'phone' => '9888888888',
            'is_primary' => true,
        ]);

        $this->actingAs($user)
            ->get("/payroll/employees/{$employee->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Payroll/Employees/Show')
                ->has('employee.emergency_contacts')
                ->has('employee.documents')
                ->has('employee.educations')
                ->has('employee.experiences')
                ->has('employee.dependents')
                ->has('employee.assigned_assets')
                ->has('employee.lifecycle_tasks')
                ->has('employee.notes')
                ->has('employee.reporting_manager')
            );
    }

    public function test_employee_hr_fields_can_be_updated(): void
    {
        [$company, $user, $employee] = $this->employeeFixture();
        $manager = Employee::create([
            'company_id' => $company->id,
            'employee_code' => 'MGR-001',
            'first_name' => 'Manager',
            'last_name' => 'One',
            'email' => 'manager@example.com',
            'date_of_joining' => now()->subYear()->toDateString(),
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->put("/payroll/employees/{$employee->id}", [
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'department_id' => $employee->department_id,
                'designation' => $employee->designation,
                'basic_salary' => $employee->basic_salary,
                'status' => $employee->status,
                'date_of_joining' => $employee->date_of_joining->toDateString(),
                'personal_email' => 'personal@example.com',
                'current_address' => 'Current address',
                'work_location' => 'Mumbai',
                'probation_end_date' => now()->addMonths(3)->toDateString(),
                'reporting_manager_id' => $manager->id,
                'notice_period_days' => 60,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'personal_email' => 'personal@example.com',
            'current_address' => 'Current address',
            'work_location' => 'Mumbai',
            'reporting_manager_id' => $manager->id,
            'notice_period_days' => 60,
        ]);
    }

    private function employeeFixture(string $companyName = 'Acme Pvt Ltd', string $userEmail = 'hr@example.com'): array
    {
        $company = Company::create([
            'name' => $companyName,
            'slug' => str($companyName)->slug() . '-' . uniqid(),
            'email' => $userEmail,
        ]);
        $this->createdCompanyIds[] = $company->id;

        $user = User::create([
            'company_id' => $company->id,
            'name' => 'HR Manager',
            'email' => $userEmail,
            'password' => Hash::make('password'),
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $department = Department::create([
            'company_id' => $company->id,
            'name' => 'People Operations',
            'code' => 'HR-' . uniqid(),
            'is_active' => true,
        ]);

        $employee = Employee::create([
            'company_id' => $company->id,
            'department_id' => $department->id,
            'employee_code' => 'EMP-' . uniqid(),
            'first_name' => 'Asha',
            'last_name' => 'Sharma',
            'email' => 'asha-' . uniqid() . '@example.com',
            'phone' => '9876543210',
            'designation' => 'HR Executive',
            'date_of_joining' => now()->subMonth()->toDateString(),
            'employment_type' => 'full_time',
            'status' => 'active',
            'basic_salary' => 50000,
        ]);

        return [$company, $user, $employee];
    }
}
