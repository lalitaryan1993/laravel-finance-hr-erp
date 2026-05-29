<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\JournalLine;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function pnl(Request $request)
    {
        $companyId = $request->user()->company_id;
        $from = $request->from ?? Carbon::now()->startOfYear()->toDateString();
        $to   = $request->to   ?? Carbon::now()->toDateString();

        $accounts = Account::forCompany($companyId)
            ->whereIn('type', ['income', 'expense'])
            ->where('is_active', true)
            ->get()
            ->map(fn ($acc) => [
                'id'      => $acc->id,
                'code'    => $acc->code,
                'name'    => $acc->name,
                'type'    => $acc->type,
                'balance' => JournalLine::whereHas('journal', fn ($q) =>
                    $q->where('company_id', $companyId)->where('status', 'posted')
                      ->whereBetween('date', [$from, $to]))
                    ->where('account_id', $acc->id)
                    ->selectRaw('SUM(credit) - SUM(debit) as bal')
                    ->value('bal') ?? 0,
            ]);

        $revenue  = $accounts->where('type', 'income')->sum('balance');
        $expenses = $accounts->where('type', 'expense')->sum(fn ($a) => -$a['balance']);

        return Inertia::render('Reports/ProfitLoss', [
            'accounts'   => $accounts->values(),
            'totals'     => [
                'revenue'    => $revenue,
                'expenses'   => $expenses,
                'net_profit' => $revenue - $expenses,
            ],
            'filters'    => compact('from', 'to'),
        ]);
    }

    public function balanceSheet(Request $request)
    {
        $companyId = $request->user()->company_id;
        $asOf = $request->as_of ?? Carbon::now()->toDateString();

        $accounts = Account::forCompany($companyId)
            ->whereIn('type', ['asset', 'liability', 'equity'])
            ->where('is_active', true)
            ->get()
            ->map(fn ($acc) => [
                'id'      => $acc->id,
                'code'    => $acc->code,
                'name'    => $acc->name,
                'type'    => $acc->type,
                'nature'  => $acc->nature,
                'balance' => JournalLine::whereHas('journal', fn ($q) =>
                    $q->where('company_id', $companyId)->where('status', 'posted')
                      ->where('date', '<=', $asOf))
                    ->where('account_id', $acc->id)
                    ->selectRaw('SUM(debit) - SUM(credit) as bal')
                    ->value('bal') ?? 0,
            ]);

        $totalAssets      = $accounts->where('type', 'asset')->sum('balance');
        $totalLiabilities = $accounts->where('type', 'liability')->sum('balance');
        $totalEquity      = $accounts->where('type', 'equity')->sum('balance');

        return Inertia::render('Reports/BalanceSheet', [
            'accounts' => $accounts->values(),
            'totals'   => [
                'assets'      => $totalAssets,
                'liabilities' => $totalLiabilities,
                'equity'      => $totalEquity,
            ],
            'asOf'     => $asOf,
        ]);
    }

    public function cashFlow(Request $request)
    {
        $companyId = $request->user()->company_id;
        $from = $request->from ?? Carbon::now()->startOfYear()->toDateString();
        $to   = $request->to   ?? Carbon::now()->toDateString();

        $cashAccounts = Account::forCompany($companyId)
            ->where(fn ($q) => $q->where('is_cash_account', true)->orWhere('is_bank_account', true))
            ->where('is_active', true)
            ->pluck('id');

        $inflows  = JournalLine::whereHas('journal', fn ($q) =>
            $q->where('company_id', $companyId)->where('status', 'posted')
              ->whereBetween('date', [$from, $to]))
            ->whereIn('account_id', $cashAccounts)
            ->sum('credit');

        $outflows = JournalLine::whereHas('journal', fn ($q) =>
            $q->where('company_id', $companyId)->where('status', 'posted')
              ->whereBetween('date', [$from, $to]))
            ->whereIn('account_id', $cashAccounts)
            ->sum('debit');

        return Inertia::render('Reports/CashFlow', [
            'totals'  => [
                'inflows'  => $inflows,
                'outflows' => $outflows,
                'net'      => $inflows - $outflows,
            ],
            'filters' => compact('from', 'to'),
        ]);
    }

    public function financial(Request $request)
    {
        $companyId = $request->user()->company_id;
        $year = $request->year ?? Carbon::now()->year;

        return Inertia::render('Reports/Financial', [
            'year'    => $year,
            'filters' => $request->only(['year']),
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'type'   => 'required|in:pnl,balance-sheet,cash-flow',
            'format' => 'required|in:pdf,excel,csv',
            'from'   => 'nullable|date',
            'to'     => 'nullable|date',
        ]);

        return back()->with('success', 'Export queued. Download will start shortly.');
    }
}
