<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Expense;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\Employee;
use App\Models\ApprovalRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
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
}
