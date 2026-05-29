<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $month     = $request->month ?? now()->format('Y-m');
        $deptId    = $request->department_id;

        $employees = Employee::forCompany($companyId)
            ->active()
            ->with('department')
            ->when($deptId, fn ($q, $v) => $q->where('department_id', $v))
            ->select('id', 'first_name', 'last_name', 'employee_code', 'designation', 'department_id')
            ->get();

        $empIds = $employees->pluck('id');

        $attendances = Attendance::whereIn('employee_id', $empIds)
            ->forMonth($month)
            ->get()
            ->groupBy('employee_id');

        // Build summary: days in month
        $carbon     = Carbon::parse($month . '-01');
        $daysInMonth = $carbon->daysInMonth;
        $workingDays = $this->workingDaysInMonth($carbon);

        $summary = $employees->map(function ($emp) use ($attendances, $daysInMonth) {
            $records = $attendances[$emp->id] ?? collect();
            return [
                'employee'     => $emp,
                'present'      => $records->whereIn('status', ['present', 'wfh', 'on_duty'])->count(),
                'absent'       => $records->where('status', 'absent')->count(),
                'half_day'     => $records->where('status', 'half_day')->count(),
                'leave'        => $records->where('status', 'leave')->count(),
                'late'         => $records->where('status', 'late')->count(),
                'wfh'          => $records->where('status', 'wfh')->count(),
                'records'      => $records->keyBy(fn ($r) => $r->date->format('Y-m-d')),
            ];
        });

        $departments = \App\Models\Department::where('company_id', $companyId)->where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Payroll/Attendance/Index', [
            'summary'      => $summary,
            'month'        => $month,
            'daysInMonth'  => $daysInMonth,
            'workingDays'  => $workingDays,
            'departments'  => $departments,
            'filters'      => $request->only(['month', 'department_id']),
        ]);
    }

    public function mark(Request $request)
    {
        $companyId = $request->user()->company_id;
        $date      = $request->date ?? now()->toDateString();

        $employees = Employee::forCompany($companyId)
            ->active()
            ->with('department')
            ->select('id', 'first_name', 'last_name', 'employee_code', 'designation', 'department_id')
            ->get();

        $existing = Attendance::whereIn('employee_id', $employees->pluck('id'))
            ->forDate($date)
            ->get()
            ->keyBy('employee_id');

        return Inertia::render('Payroll/Attendance/Mark', [
            'employees'   => $employees,
            'existing'    => $existing,
            'date'        => $date,
            'departments' => \App\Models\Department::where('company_id', $companyId)->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function saveBulk(Request $request)
    {
        $request->validate([
            'date'                 => 'required|date',
            'records'              => 'required|array',
            'records.*.employee_id'=> 'required|exists:employees,id',
            'records.*.status'     => 'required|in:present,absent,half_day,wfh,holiday,leave,late,on_duty',
            'records.*.check_in'   => 'nullable|date_format:H:i',
            'records.*.check_out'  => 'nullable|date_format:H:i',
            'records.*.notes'      => 'nullable|string|max:255',
        ]);

        $companyId = $request->user()->company_id;
        $userId    = $request->user()->id;

        foreach ($request->records as $rec) {
            Attendance::updateOrCreate(
                ['employee_id' => $rec['employee_id'], 'date' => $request->date],
                [
                    'company_id'     => $companyId,
                    'status'         => $rec['status'],
                    'check_in'       => $rec['check_in']  ?? null,
                    'check_out'      => $rec['check_out'] ?? null,
                    'notes'          => $rec['notes']     ?? null,
                    'working_hours'  => $this->calcHours($rec['check_in'] ?? null, $rec['check_out'] ?? null),
                    'marked_by'      => $userId,
                ]
            );
        }

        return back()->with('success', 'Attendance saved for ' . count($request->records) . ' employees.');
    }

    public function report(Request $request)
    {
        $companyId  = $request->user()->company_id;
        $employeeId = $request->employee_id;
        $month      = $request->month ?? now()->format('Y-m');

        $employees = Employee::forCompany($companyId)->active()
            ->select('id', 'first_name', 'last_name', 'employee_code', 'designation')
            ->orderBy('first_name')
            ->get();

        $employee = $employeeId ? Employee::forCompany($companyId)->find($employeeId) : null;

        $records = $employee
            ? Attendance::where('employee_id', $employeeId)->forMonth($month)->orderBy('date')->get()
            : collect();

        return Inertia::render('Payroll/Attendance/Report', [
            'employees' => $employees,
            'employee'  => $employee,
            'records'   => $records,
            'month'     => $month,
        ]);
    }

    private function calcHours(?string $in, ?string $out): ?float
    {
        if (!$in || !$out) return null;
        $start = Carbon::createFromFormat('H:i', $in);
        $end   = Carbon::createFromFormat('H:i', $out);
        return $end->diffInMinutes($start) / 60;
    }

    private function workingDaysInMonth(Carbon $month): int
    {
        $days = 0;
        $day  = $month->copy()->startOfMonth();
        while ($day->lte($month->copy()->endOfMonth())) {
            if (!$day->isWeekend()) $days++;
            $day->addDay();
        }
        return $days;
    }
}
