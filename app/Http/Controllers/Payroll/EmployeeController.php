<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\SalaryStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $employees = Employee::where('company_id', $companyId)
            ->with('department:id,name', 'reportingManager:id,first_name,last_name,employee_code')
            ->withCount(['emergencyContacts', 'documents'])
            ->when($request->search, fn ($q, $v) =>
                $q->where(fn ($q) =>
                    $q->where('first_name', 'like', "%{$v}%")
                      ->orWhere('last_name', 'like', "%{$v}%")
                      ->orWhere('employee_code', 'like', "%{$v}%")
                      ->orWhere('email', 'like', "%{$v}%")))
            ->when($request->department_id, fn ($q, $v) => $q->where('department_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->employment_type, fn ($q, $v) => $q->where('employment_type', $v))
            ->when($request->completeness === 'complete', fn ($q) =>
                $q->whereNotNull('first_name')
                  ->where(fn ($q) => $q->whereNotNull('email')->orWhereNotNull('phone'))
                  ->whereNotNull('department_id')
                  ->whereNotNull('designation')
                  ->whereNotNull('date_of_joining')
                  ->has('emergencyContacts')
                  ->has('documents'))
            ->when($request->completeness === 'incomplete', fn ($q) =>
                $q->where(fn ($q) =>
                    $q->whereNull('first_name')
                      ->orWhere(fn ($q) => $q->whereNull('email')->whereNull('phone'))
                      ->orWhereNull('department_id')
                      ->orWhereNull('designation')
                      ->orWhereNull('date_of_joining')
                      ->orDoesntHave('emergencyContacts')
                      ->orDoesntHave('documents')))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($employee) => $this->withProfileCompleteness($employee));

        $stats = [
            'active' => Employee::where('company_id', $companyId)->where('status', 'active')->count(),
            'onboarding' => Employee::where('company_id', $companyId)->whereHas('lifecycleTasks', fn ($q) =>
                $q->where('type', 'onboarding')->whereIn('status', ['pending', 'in_progress'])
            )->count(),
            'probation' => Employee::where('company_id', $companyId)
                ->where('status', 'active')
                ->whereNotNull('probation_end_date')
                ->whereDate('probation_end_date', '>=', now()->toDateString())
                ->count(),
            'incomplete_profiles' => Employee::where('company_id', $companyId)
                ->where(fn ($q) =>
                    $q->whereNull('first_name')
                      ->orWhere(fn ($q) => $q->whereNull('email')->whereNull('phone'))
                      ->orWhereNull('department_id')
                      ->orWhereNull('designation')
                      ->orWhereNull('date_of_joining')
                      ->orDoesntHave('emergencyContacts')
                      ->orDoesntHave('documents'))
                ->count(),
            'documents_expiring' => \App\Models\EmployeeDocument::where('company_id', $companyId)
                ->whereNotNull('expiry_date')
                ->whereBetween('expiry_date', [now()->toDateString(), now()->addDays(45)->toDateString()])
                ->count(),
        ];

        return Inertia::render('Payroll/Employees/Index', [
            'employees'   => $employees,
            'departments' => Department::where('company_id', $companyId)->get(['id', 'name']),
            'stats'       => $stats,
            'filters'     => $request->only(['search', 'department_id', 'status', 'employment_type', 'completeness']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        return Inertia::render('Payroll/Employees/Create', [
            'departments'      => Department::where('company_id', $companyId)->get(['id', 'name']),
            'salaryStructures' => SalaryStructure::where('company_id', $companyId)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name'           => 'required|string|max:255',
            'last_name'            => 'nullable|string|max:255',
            'email'                => 'nullable|email',
            'phone'                => 'nullable|string|max:20',
            'employee_code'        => 'nullable|string|max:20',
            'department_id'        => 'nullable|exists:departments,id',
            'salary_structure_id'  => 'nullable|exists:salary_structures,id',
            'designation'          => 'nullable|string|max:100',
            'date_of_joining'      => 'nullable|date',
            'date_of_birth'        => 'nullable|date',
            'basic_salary'         => 'nullable|numeric|min:0',
            'pan_number'           => 'nullable|string|max:10',
            'bank_account_number'  => 'nullable|string|max:30',
            'bank_ifsc'            => 'nullable|string|max:15',
            'employment_type'      => 'nullable|in:full_time,part_time,contract,intern',
            'status'               => 'nullable|in:active,inactive,terminated',
        ]);

        $bankDetails = array_filter([
            'account_number' => $data['bank_account_number'] ?? null,
            'ifsc'           => $data['bank_ifsc'] ?? null,
        ]);
        unset($data['bank_account_number'], $data['bank_ifsc']);

        Employee::create(array_merge($data, [
            'company_id'     => $request->user()->company_id,
            'status'         => $data['status'] ?? 'active',
            'date_of_joining'=> $data['date_of_joining'] ?? now()->toDateString(),
            'bank_details'   => $bankDetails ?: null,
        ]));

        return redirect()->route('payroll.employees.index')->with('success', 'Employee added.');
    }

    public function show(Employee $employee)
    {
        $this->authorizeCompanyEmployee(request(), $employee);

        $employee->load([
            'department',
            'salaryStructure',
            'payslips',
            'reportingManager:id,first_name,last_name,employee_code',
            'emergencyContacts',
            'documents',
            'educations',
            'experiences',
            'dependents',
            'assignedAssets',
            'lifecycleTasks',
            'notes.author:id,name',
        ]);

        $employeePayload = $employee->toArray();
        $employeePayload['documents'] = $employee->getRelation('documents')->values();
        $employeePayload['emergency_contacts'] = $employee->emergencyContacts->values();
        $employeePayload['assigned_assets'] = $employee->assignedAssets->values();
        $employeePayload['lifecycle_tasks'] = $employee->lifecycleTasks->values();

        $companyId = $employee->company_id;

        return Inertia::render('Payroll/Employees/Show', [
            'employee' => $employeePayload,
            'managers' => Employee::where('company_id', $companyId)
                ->where('id', '!=', $employee->id)
                ->where('status', 'active')
                ->get(['id', 'first_name', 'last_name', 'employee_code']),
            'hrOptions' => [
                'documentTypes' => ['aadhaar', 'pan', 'passport', 'driving_license', 'offer_letter', 'contract', 'resume', 'certificate', 'other'],
                'assetStatuses' => ['issued', 'returned', 'lost', 'damaged'],
                'lifecycleTypes' => ['onboarding', 'offboarding'],
            ],
        ]);
    }

    public function edit(Employee $employee)
    {
        $this->authorizeCompanyEmployee(request(), $employee);
        $companyId = $employee->company_id;

        return Inertia::render('Payroll/Employees/Edit', [
            'employee'         => $employee,
            'departments'      => Department::where('company_id', $companyId)->get(['id', 'name']),
            'salaryStructures' => SalaryStructure::where('company_id', $companyId)->get(['id', 'name']),
            'managers'         => Employee::where('company_id', $companyId)
                ->where('id', '!=', $employee->id)
                ->where('status', 'active')
                ->get(['id', 'first_name', 'last_name', 'employee_code']),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $this->authorizeCompanyEmployee($request, $employee);

        $data = $request->validate([
            'first_name'          => 'required|string|max:255',
            'last_name'           => 'nullable|string|max:255',
            'email'               => 'nullable|email',
            'phone'               => 'nullable|string|max:20',
            'department_id'       => 'nullable|exists:departments,id',
            'salary_structure_id' => 'nullable|exists:salary_structures,id',
            'designation'         => 'nullable|string|max:100',
            'basic_salary'        => 'nullable|numeric|min:0',
            'status'              => 'nullable|in:active,inactive,terminated',
            'date_of_joining'     => 'nullable|date',
            'date_of_birth'       => 'nullable|date',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_ifsc'           => 'nullable|string|max:15',
            'gender'              => 'nullable|string|max:30',
            'marital_status'      => 'nullable|string|max:30',
            'blood_group'         => 'nullable|string|max:10',
            'personal_email'      => 'nullable|email|max:255',
            'current_address'     => 'nullable|string|max:1000',
            'permanent_address'   => 'nullable|string|max:1000',
            'reporting_manager_id'=> 'nullable|exists:employees,id',
            'work_location'       => 'nullable|string|max:100',
            'probation_end_date'  => 'nullable|date',
            'confirmation_date'   => 'nullable|date',
            'notice_period_days'  => 'nullable|integer|min:0|max:365',
            'exit_date'           => 'nullable|date',
            'exit_reason'         => 'nullable|string|max:100',
            'rehire_eligible'     => 'boolean',
            'exit_notes'          => 'nullable|string|max:1000',
        ]);

        $bankDetails = array_filter([
            'account_number' => $data['bank_account_number'] ?? null,
            'ifsc'           => $data['bank_ifsc'] ?? null,
        ]);
        unset($data['bank_account_number'], $data['bank_ifsc']);

        $employee->update(array_merge($data, [
            'bank_details' => $bankDetails ?: null,
        ]));

        return back()->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee)
    {
        $this->authorizeCompanyEmployee(request(), $employee);
        $employee->delete();

        return redirect()->route('payroll.employees.index')->with('success', 'Employee removed.');
    }

    private function withProfileCompleteness(Employee $employee): Employee
    {
        $checks = [
            filled($employee->first_name),
            filled($employee->email) || filled($employee->phone),
            filled($employee->department_id),
            filled($employee->designation),
            filled($employee->date_of_joining),
            $employee->emergency_contacts_count > 0,
            $employee->documents_count > 0,
        ];

        $completed = collect($checks)->filter()->count();
        $employee->profile_completeness = [
            'completed' => $completed,
            'total' => count($checks),
            'percent' => (int) round(($completed / count($checks)) * 100),
            'is_complete' => $completed === count($checks),
        ];

        return $employee;
    }

    private function authorizeCompanyEmployee(Request $request, Employee $employee): void
    {
        abort_unless($request->user()?->company_id === $employee->company_id, 403);
    }
}
