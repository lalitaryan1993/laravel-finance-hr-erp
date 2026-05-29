<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\LeaveAllocation;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeePortalController extends Controller
{
    private function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();
        return Employee::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();
    }

    public function payslips(Request $request)
    {
        $employee = $this->resolveEmployee($request);

        $payslips = $employee
            ? $employee->payslips()
                ->latest('pay_period_start')
                ->get(['id', 'month', 'pay_period_start', 'pay_period_end',
                       'gross_earnings', 'total_deductions', 'net_pay',
                       'basic_salary', 'hra', 'bonus', 'employee_pf',
                       'professional_tax', 'tds', 'status', 'pdf_path'])
            : collect();

        return Inertia::render('Employee/Payslips', [
            'employee' => $employee?->only(['id', 'first_name', 'last_name', 'employee_code', 'designation']),
            'payslips' => $payslips,
        ]);
    }

    public function leave(Request $request)
    {
        $employee = $this->resolveEmployee($request);
        $now      = Carbon::now();

        $leaveTypes = LeaveType::where('company_id', $request->user()->company_id)
            ->where('is_active', true)
            ->get(['id', 'name', 'days_per_year', 'pay_status']);

        $balance = $employee
            ? LeaveAllocation::where('employee_id', $employee->id)
                ->where('year', $now->year)
                ->with('leaveType:id,name')
                ->get()
                ->map(fn ($a) => [
                    'leave_type_id' => $a->leave_type_id,
                    'type'          => $a->leaveType?->name ?? 'Leave',
                    'allocated'     => $a->allocated_days,
                    'used'          => $a->used_days,
                    'remaining'     => $a->balance_days,
                ])
            : collect();

        $requests = $employee
            ? LeaveRequest::where('employee_id', $employee->id)
                ->with('leaveType:id,name')
                ->latest()
                ->paginate(15)
            : collect();

        return Inertia::render('Employee/Leave', [
            'employee'   => $employee?->only(['id', 'first_name', 'last_name', 'employee_code']),
            'leaveTypes' => $leaveTypes,
            'balance'    => $balance,
            'requests'   => $requests,
        ]);
    }

    public function storeLeave(Request $request)
    {
        $employee = $this->resolveEmployee($request);
        if (! $employee) {
            return back()->with('error', 'No employee record linked to your account.');
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'from_date'     => 'required|date|after_or_equal:today',
            'to_date'       => 'required|date|after_or_equal:from_date',
            'reason'        => 'required|string|max:500',
        ]);

        $days = Carbon::parse($validated['from_date'])
            ->diffInWeekdays(Carbon::parse($validated['to_date'])->addDay());

        LeaveRequest::create(array_merge($validated, [
            'company_id'  => $request->user()->company_id,
            'employee_id' => $employee->id,
            'days'        => $days,
            'status'      => 'pending',
        ]));

        return back()->with('success', 'Leave request submitted successfully.');
    }

    public function attendance(Request $request)
    {
        $employee = $this->resolveEmployee($request);
        $now      = Carbon::now();
        $month    = $request->get('month', $now->format('Y-m'));

        $records = $employee
            ? Attendance::where('employee_id', $employee->id)
                ->forMonth($month)
                ->orderBy('date')
                ->get(['date', 'status', 'check_in', 'check_out', 'working_hours', 'notes'])
            : collect();

        $stats = [
            'present'  => $records->where('status', 'present')->count(),
            'absent'   => $records->where('status', 'absent')->count(),
            'late'     => $records->where('status', 'late')->count(),
            'half_day' => $records->where('status', 'half_day')->count(),
            'on_leave' => $records->where('status', 'on_leave')->count(),
        ];

        return Inertia::render('Employee/Attendance', [
            'employee'  => $employee?->only(['id', 'first_name', 'last_name', 'employee_code']),
            'records'   => $records,
            'stats'     => $stats,
            'month'     => $month,
        ]);
    }
}
