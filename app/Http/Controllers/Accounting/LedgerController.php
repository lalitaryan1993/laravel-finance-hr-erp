<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use App\Models\JournalLine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $accounts = Account::forCompany($companyId)->active()
            ->select('id', 'code', 'name', 'type', 'nature', 'current_balance')
            ->orderBy('code')
            ->get();

        $account        = null;
        $entries        = [];
        $openingBalance = 0;

        if ($request->account_id) {
            $account = Account::find($request->account_id);

            if ($account && $request->from) {
                $openingBalance = (float) JournalLine::where('account_id', $request->account_id)
                    ->whereHas('journal', fn ($q) => $q->where('status', 'posted')
                        ->where('date', '<', $request->from))
                    ->selectRaw('SUM(debit) - SUM(credit) as balance')
                    ->value('balance') ?? 0;
            }

            $lines = JournalLine::where('account_id', $request->account_id)
                ->whereHas('journal', fn ($q) => $q->where('status', 'posted')
                    ->when($request->from, fn ($j, $v) => $j->where('date', '>=', $v))
                    ->when($request->to,   fn ($j, $v) => $j->where('date', '<=', $v)))
                ->with(['journal' => fn ($q) => $q->select('id', 'journal_number', 'date', 'narration')])
                ->orderBy(
                    \App\Models\Journal::select('date')->whereColumn('journals.id', 'journal_lines.journal_id')
                )
                ->get();

            $entries = $lines->map(fn ($line) => [
                'id'             => $line->id,
                'date'           => $line->journal?->date,
                'journal_number' => $line->journal?->journal_number,
                'narration'      => $line->journal?->narration,
                'description'    => $line->description,
                'debit'          => (float) $line->debit,
                'credit'         => (float) $line->credit,
            ])->values()->all();
        }

        return Inertia::render('Accounting/Ledger/Index', [
            'accounts'       => $accounts,
            'account'        => $account,
            'entries'        => $entries,
            'openingBalance' => $openingBalance,
            'filters'        => $request->only(['account_id', 'from', 'to']),
        ]);
    }

    public function trialBalance(Request $request)
    {
        $companyId = $request->user()->company_id;

        $accounts = Account::forCompany($companyId)
            ->with(['journalLines' => fn ($q) => $q->whereHas('journal', fn ($j) =>
                $j->where('status', 'posted')
            )])
            ->orderBy('code')
            ->get()
            ->map(fn ($account) => [
                'id'     => $account->id,
                'code'   => $account->code,
                'name'   => $account->name,
                'type'   => $account->type,
                'debit'  => $account->journalLines->sum('debit'),
                'credit' => $account->journalLines->sum('credit'),
            ])
            ->filter(fn ($a) => $a['debit'] > 0 || $a['credit'] > 0);

        return Inertia::render('Accounting/Ledger/TrialBalance', [
            'accounts' => $accounts->values(),
            'totals'   => [
                'debit'  => $accounts->sum('debit'),
                'credit' => $accounts->sum('credit'),
            ],
        ]);
    }

    public function reconciliation(Request $request)
    {
        $companyId = $request->user()->company_id;

        $bankAccounts = BankAccount::where('company_id', $companyId)
            ->active()
            ->get(['id', 'account_name', 'bank_name', 'account_number', 'currency',
                   'current_balance', 'last_reconciled_date', 'last_reconciled_balance']);

        $transactions = collect();
        $selectedAccount = null;

        if ($request->bank_account_id) {
            $selectedAccount = BankAccount::find($request->bank_account_id);

            $txQuery = BankTransaction::where('bank_account_id', $request->bank_account_id)
                ->where('is_reconciled', false)
                ->when($request->from, fn ($q, $v) => $q->where('transaction_date', '>=', $v))
                ->when($request->to,   fn ($q, $v) => $q->where('transaction_date', '<=', $v))
                ->orderBy('transaction_date', 'desc');

            $transactions = $txQuery->get([
                'id', 'transaction_date', 'description', 'reference_number',
                'transaction_type', 'amount', 'balance', 'is_reconciled',
            ]);
        }

        $stats = [
            'accounts_to_reconcile' => BankAccount::where('company_id', $companyId)
                ->active()
                ->whereHas('transactions', fn ($q) => $q->where('is_reconciled', false))
                ->count(),
            'reconciled_this_month' => BankTransaction::whereHas('bankAccount', fn ($q) =>
                $q->where('company_id', $companyId))
                ->where('is_reconciled', true)
                ->whereMonth('reconciled_at', now()->month)
                ->whereYear('reconciled_at', now()->year)
                ->count(),
            'unmatched_entries' => BankTransaction::whereHas('bankAccount', fn ($q) =>
                $q->where('company_id', $companyId))
                ->where('is_reconciled', false)
                ->count(),
        ];

        return Inertia::render('Accounting/Ledger/Reconciliation', [
            'bankAccounts'    => $bankAccounts,
            'transactions'    => $transactions,
            'selectedAccount' => $selectedAccount,
            'stats'           => $stats,
            'filters'         => $request->only(['bank_account_id', 'from', 'to']),
        ]);
    }

    public function reconcileTransactions(Request $request)
    {
        $request->validate([
            'transaction_ids'   => 'required|array',
            'transaction_ids.*' => 'exists:bank_transactions,id',
            'bank_account_id'   => 'required|exists:bank_accounts,id',
        ]);

        $now = now();
        BankTransaction::whereIn('id', $request->transaction_ids)
            ->update(['is_reconciled' => true, 'reconciled_at' => $now]);

        BankAccount::where('id', $request->bank_account_id)->update([
            'last_reconciled_date'    => $now->toDateString(),
            'last_reconciled_balance' => BankTransaction::where('bank_account_id', $request->bank_account_id)
                ->where('is_reconciled', true)
                ->latest('transaction_date')
                ->value('balance') ?? 0,
        ]);

        return back()->with('success', count($request->transaction_ids) . ' transaction(s) reconciled.');
    }
}
