<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\SalaryStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $companyId   = $request->user()->company_id;
        $currentMonth = now()->format('Y-m');

        $runs = PayrollRun::where('company_id', $companyId)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $totalActive = Employee::where('company_id', $companyId)->where('status', 'active')->count();

        $deptBreakdown = Department::where('company_id', $companyId)
            ->where('is_active', true)
            ->withCount(['employees as active_employees' => fn ($q) => $q->where('status', 'active')])
            ->orderByDesc('active_employees')
            ->take(6)
            ->get(['id', 'name']);

        $todayAttendance = Attendance::where('company_id', $companyId)
            ->forDate(now()->toDateString())
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $pendingLeave = LeaveRequest::forCompany($companyId)->where('status', 'pending')->count();

        $stats = [
            'total_employees'     => $totalActive,
            'current_month_total' => PayrollRun::where('company_id', $companyId)
                ->where('month', $currentMonth)->value('total_gross') ?? 0,
            'last_run_date'       => PayrollRun::where('company_id', $companyId)->latest()->value('payment_date'),
            'runs_this_year'      => PayrollRun::where('company_id', $companyId)->whereYear('created_at', now()->year)->count(),
            'pending_leave'       => $pendingLeave,
            'today_present'       => (int) ($todayAttendance['present'] ?? 0) + (int) ($todayAttendance['wfh'] ?? 0) + (int) ($todayAttendance['on_duty'] ?? 0),
            'today_absent'        => (int) ($todayAttendance['absent'] ?? 0),
            'dept_breakdown'      => $deptBreakdown,
        ];

        return Inertia::render('Payroll/Index', [
            'payrollRuns' => $runs,
            'stats'       => $stats,
        ]);
    }

    public function structures(Request $request)
    {
        $companyId = $request->user()->company_id;

        $structures = SalaryStructure::where('company_id', $companyId)
            ->latest()
            ->get();

        return Inertia::render('Payroll/Structures', [
            'structures' => $structures,
        ]);
    }

    public function storeStructure(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'components' => 'required|array|min:1',
            'components.*.type'       => 'required|in:earning,deduction',
            'components.*.name'       => 'required|string|max:100',
            'components.*.calc_type'  => 'required|in:fixed,percentage',
            'components.*.value'      => 'required|numeric|min:0',
            'components.*.taxable'    => 'boolean',
            'components.*.is_active'  => 'boolean',
        ]);

        SalaryStructure::create([
            'company_id' => $request->user()->company_id,
            'name'       => $data['name'],
            'components' => $data['components'],
        ]);

        return back()->with('success', 'Salary structure created.');
    }

    public function updateStructure(Request $request, SalaryStructure $structure)
    {
        abort_unless($structure->company_id === $request->user()->company_id, 403);

        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'components' => 'required|array|min:1',
            'components.*.type'       => 'required|in:earning,deduction',
            'components.*.name'       => 'required|string|max:100',
            'components.*.calc_type'  => 'required|in:fixed,percentage',
            'components.*.value'      => 'required|numeric|min:0',
            'components.*.taxable'    => 'boolean',
            'components.*.is_active'  => 'boolean',
        ]);

        $structure->update($data);

        return back()->with('success', 'Salary structure updated.');
    }

    public function destroyStructure(Request $request, SalaryStructure $structure)
    {
        abort_unless($structure->company_id === $request->user()->company_id, 403);
        $structure->delete();

        return back()->with('success', 'Salary structure deleted.');
    }

    public function process(Request $request)
    {
        $companyId = $request->user()->company_id;

        $employees = Employee::where('company_id', $companyId)
            ->where('status', 'active')
            ->with('department', 'salaryStructure')
            ->get();

        $month = $request->month ?? Carbon::now()->format('Y-m');

        return Inertia::render('Payroll/Process', [
            'employees'  => $employees,
            'month'      => $month,
            'payrollRuns'=> PayrollRun::where('company_id', $companyId)
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    public function runPayroll(Request $request)
    {
        $data = $request->validate([
            'month'        => 'required|string',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        $companyId = $request->user()->company_id;

        $monthCarbon = \Carbon\Carbon::parse($data['month'] . '-01');
        $run = PayrollRun::create([
            'company_id'      => $companyId,
            'run_number'      => 'PR-' . now()->format('Ym') . '-' . str_pad(PayrollRun::where('company_id', $companyId)->count() + 1, 3, '0', STR_PAD_LEFT),
            'month'           => $data['month'],
            'pay_period_start'=> $monthCarbon->startOfMonth()->toDateString(),
            'pay_period_end'  => $monthCarbon->copy()->endOfMonth()->toDateString(),
            'payment_date'    => $monthCarbon->copy()->endOfMonth()->toDateString(),
            'status'          => 'processing',
            'created_by'      => $request->user()->id,
            'total_gross'     => 0,
            'total_net'       => 0,
            'total_deductions'=> 0,
        ]);

        $query = Employee::where('company_id', $companyId)->where('status', 'active');

        if (!empty($data['employee_ids'])) {
            $query->whereIn('id', $data['employee_ids']);
        }

        $totalGross = 0;
        $totalNet   = 0;

        foreach ($query->with('salaryStructure')->get() as $employee) {
            $gross = $employee->basic_salary ?? 0;
            $deductions = 0;

            // PF deduction (12% of basic)
            $pf = round($gross * 0.12, 2);
            $deductions += $pf;

            // Professional Tax (flat 200 for > 10000)
            $pt = $gross > 10000 ? 200 : 0;
            $deductions += $pt;

            $net = $gross - $deductions;

            Payslip::create([
                'payroll_run_id'   => $run->id,
                'employee_id'      => $employee->id,
                'company_id'       => $companyId,
                'payslip_number'   => 'PS-' . $data['month'] . '-' . $employee->id,
                'month'            => $data['month'],
                'pay_period_start' => $monthCarbon->startOfMonth()->toDateString(),
                'pay_period_end'   => $monthCarbon->copy()->endOfMonth()->toDateString(),
                'working_days'     => (int) $monthCarbon->copy()->endOfMonth()->day,
                'present_days'     => (int) $monthCarbon->copy()->endOfMonth()->day,
                'basic_salary'     => $gross,
                'gross_earnings'   => $gross,
                'total_deductions' => $deductions,
                'net_pay'          => $net,
                'employee_pf'      => $pf,
                'professional_tax' => $pt,
                'status'           => 'generated',
            ]);

            $totalGross += $gross;
            $totalNet   += $net;
        }

        $run->update([
            'status'      => 'completed',
            'total_gross' => $totalGross,
            'total_net'   => $totalNet,
            'total_deductions' => $totalGross - $totalNet,
        ]);

        return redirect()->route('payroll.payslips')->with('success', 'Payroll processed successfully.');
    }

    public function payslips(Request $request)
    {
        $companyId = $request->user()->company_id;

        $payslips = Payslip::where('company_id', $companyId)
            ->with('employee:id,first_name,last_name,employee_code,department_id', 'employee.department:id,name')
            ->when($request->month, fn ($q, $v) => $q->where('month', $v))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Payroll/Payslips', [
            'payslips' => $payslips,
            'filters'  => $request->only(['month']),
        ]);
    }

    public function payslipPdf(Payslip $payslip)
    {
        $payslip->load('employee.department', 'payrollRun');

        return Inertia::render('Payroll/PayslipPDF', [
            'payslip' => $payslip,
        ]);
    }

    public function reports(Request $request)
    {
        $companyId = $request->user()->company_id;

        $runs = PayrollRun::where('company_id', $companyId)
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Payroll/Reports', [
            'runs'    => $runs,
            'filters' => $request->only(['year']),
        ]);
    }
}
