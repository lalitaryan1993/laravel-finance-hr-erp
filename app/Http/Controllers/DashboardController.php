<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Expense;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveAllocation;
use App\Models\ApprovalRequest;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Employees get their own self-service dashboard
        if ($request->user()->hasRole('employee')) {
            return $this->employeeDashboard($request);
        }


        $companyId = $request->user()->company_id;
        $now       = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $prevMonthStart = $now->copy()->subMonth()->startOfMonth();
        $prevMonthEnd   = $now->copy()->subMonth()->endOfMonth();

        // Revenue this month
        $revenueThisMonth = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->where('status', '!=', 'draft')
            ->whereBetween('invoice_date', [$startOfMonth, $now])
            ->sum('grand_total');

        $revenuePrevMonth = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->where('status', '!=', 'draft')
            ->whereBetween('invoice_date', [$prevMonthStart, $prevMonthEnd])
            ->sum('grand_total');

        // Expenses this month
        $expensesThisMonth = Expense::forCompany($companyId)
            ->whereNotIn('status', ['draft', 'rejected'])
            ->whereBetween('expense_date', [$startOfMonth, $now])
            ->sum('total_amount');

        $expensesPrevMonth = Expense::forCompany($companyId)
            ->whereNotIn('status', ['draft', 'rejected'])
            ->whereBetween('expense_date', [$prevMonthStart, $prevMonthEnd])
            ->sum('total_amount');

        // Outstanding
        $outstanding = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->sum('balance_due');

        $overdueCount = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->where('due_date', '<', $now)
            ->whereNotIn('payment_status', ['paid'])
            ->count();

        // Pending approvals for this user
        $pendingApprovals = ApprovalRequest::where('company_id', $companyId)
            ->where('current_approver_id', $request->user()->id)
            ->where('status', 'pending')
            ->with(['requester'])
            ->latest()
            ->take(10)
            ->get();

        // Recent invoices
        $recentInvoices = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->with(['party' => fn ($q) => $q->select('id', 'name')])
            ->latest('invoice_date')
            ->take(5)
            ->get();

        // Monthly revenue chart (last 12 months)
        $monthlyRevenue = Invoice::forCompany($companyId)
            ->ofType('sales')
            ->where('status', '!=', 'draft')
            ->where('invoice_date', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(invoice_date, '%Y-%m') as month, SUM(grand_total) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyExpenses = Expense::forCompany($companyId)
            ->whereNotIn('status', ['draft', 'rejected'])
            ->where('expense_date', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(expense_date, '%Y-%m') as month, SUM(total_amount) as expense")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Employee count
        $employeeCount = Employee::forCompany($companyId)->active()->count();

        $stats = [
            'revenue'        => ['current' => $revenueThisMonth, 'previous' => $revenuePrevMonth],
            'expenses'       => ['current' => $expensesThisMonth, 'previous' => $expensesPrevMonth],
            'net_profit'     => ['current' => $revenueThisMonth - $expensesThisMonth],
            'outstanding'    => $outstanding,
            'overdue_count'  => $overdueCount,
            'employee_count' => $employeeCount,
            'pending_approvals_count' => $pendingApprovals->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats'          => $stats,
            'pendingApprovals' => $pendingApprovals,
            'recentInvoices' => $recentInvoices,
            'chartData'      => [
                'revenue'  => $monthlyRevenue,
                'expenses' => $monthlyExpenses,
            ],
        ]);
    }

    private function employeeDashboard(Request $request)
    {
        $user      = $request->user();
        $employee  = Employee::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->with(['department', 'salaryStructure'])
            ->first();

        if (! $employee) {
            return Inertia::render('Employee/Dashboard', [
                'employee'         => null,
                'attendance'       => [],
                'leaveBalance'     => [],
                'recentPayslips'   => [],
                'recentExpenses'   => [],
                'pendingTasks'     => [],
            ]);
        }

        $now = Carbon::now();
        $ym  = $now->format('Y-m');

        // Attendance this month
        $attendance = Attendance::where('employee_id', $employee->id)
            ->forMonth($ym)
            ->orderBy('date', 'desc')
            ->get(['date', 'status', 'check_in', 'check_out', 'working_hours']);

        $attStats = [
            'present'  => $attendance->where('status', 'present')->count(),
            'absent'   => $attendance->where('status', 'absent')->count(),
            'late'     => $attendance->where('status', 'late')->count(),
            'half_day' => $attendance->where('status', 'half_day')->count(),
            'total'    => $now->day,
        ];

        // Leave balance
        $leaveBalance = LeaveAllocation::where('employee_id', $employee->id)
            ->where('year', $now->year)
            ->with('leaveType:id,name')
            ->get(['leave_type_id', 'allocated_days', 'used_days', 'balance_days'])
            ->map(fn ($a) => [
                'type'      => $a->leaveType?->name ?? 'Leave',
                'allocated' => $a->allocated_days,
                'used'      => $a->used_days,
                'remaining' => $a->balance_days,
            ]);

        // Recent payslips
        $recentPayslips = $employee->payslips()
            ->latest('pay_period_start')
            ->take(6)
            ->get(['id', 'month', 'pay_period_start', 'gross_earnings', 'total_deductions', 'net_pay', 'status']);

        // Recent leave requests
        $recentLeave = LeaveRequest::where('employee_id', $employee->id)
            ->with('leaveType:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'leave_type_id', 'from_date', 'to_date', 'days', 'status', 'reason']);

        // Recent expense claims
        $recentExpenses = Expense::where('submitted_by', $user->id)
            ->orWhere('employee_id', $user->id)
            ->latest()
            ->take(5)
            ->get(['id', 'expense_number', 'description', 'total_amount', 'status', 'expense_date']);

        // Pending lifecycle tasks
        $pendingTasks = $employee->lifecycleTasks()
            ->whereNotIn('status', ['completed', 'skipped'])
            ->orderBy('due_date')
            ->take(5)
            ->get(['id', 'title', 'type', 'due_date', 'status']);

        return Inertia::render('Employee/Dashboard', [
            'employee'       => array_merge($employee->toArray(), [
                'full_name' => "{$employee->first_name} {$employee->last_name}",
            ]),
            'attStats'       => $attStats,
            'recentAttendance' => $attendance->take(7)->values(),
            'leaveBalance'   => $leaveBalance,
            'recentPayslips' => $recentPayslips,
            'recentLeave'    => $recentLeave,
            'recentExpenses' => $recentExpenses,
            'pendingTasks'   => $pendingTasks,
        ]);
    }
}
