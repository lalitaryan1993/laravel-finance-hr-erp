<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $departments = Department::where('company_id', $companyId)
            ->withCount(['employees as total_employees' => fn ($q) => $q->where('status', 'active')])
            ->orderBy('name')
            ->get();

        return Inertia::render('Payroll/Departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'code'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $data['company_id'] = $request->user()->company_id;

        Department::create($data);

        return back()->with('success', 'Department created.');
    }

    public function update(Request $request, Department $department)
    {
        abort_unless($department->company_id === $request->user()->company_id, 403);

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'code'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'boolean',
        ]);

        $department->update($data);

        return back()->with('success', 'Department updated.');
    }

    public function destroy(Request $request, Department $department)
    {
        abort_unless($department->company_id === $request->user()->company_id, 403);

        $hasEmployees = Employee::where('department_id', $department->id)->exists();
        if ($hasEmployees) {
            return back()->withErrors(['department' => 'Cannot delete a department with employees. Reassign employees first.']);
        }

        $department->delete();

        return back()->with('success', 'Department deleted.');
    }
}
