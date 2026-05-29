<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use App\Models\FundTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankTransactionController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $transactions = BankTransaction::whereHas('bankAccount', fn ($q) =>
                $q->where('company_id', $companyId))
            ->with('bankAccount:id,account_name,bank_name')
            ->when($request->account_id, fn ($q, $v) => $q->where('bank_account_id', $v))
            ->when($request->type, fn ($q, $v) => $q->where('transaction_type', $v))
            ->when($request->from, fn ($q, $v) => $q->whereDate('transaction_date', '>=', $v))
            ->when($request->to,   fn ($q, $v) => $q->whereDate('transaction_date', '<=', $v))
            ->latest('transaction_date')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Banking/Transactions', [
            'transactions' => $transactions,
            'accounts'     => BankAccount::where('company_id', $companyId)->where('is_active', true)->get(['id', 'account_name', 'bank_name']),
            'filters'      => $request->only(['account_id', 'type', 'from', 'to']),
        ]);
    }

    public function reconciliation(Request $request)
    {
        $companyId = $request->user()->company_id;

        $accounts = BankAccount::where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        $selectedAccount = $request->account_id
            ? BankAccount::find($request->account_id)
            : $accounts->first();

        $transactions = $selectedAccount
            ? BankTransaction::where('bank_account_id', $selectedAccount->id)
                ->where('is_reconciled', false)
                ->latest('transaction_date')
                ->get()
            : collect();

        return Inertia::render('Banking/Reconciliation', [
            'accounts'        => $accounts,
            'selectedAccount' => $selectedAccount,
            'transactions'    => $transactions,
            'filters'         => $request->only(['account_id']),
        ]);
    }

    public function transfers(Request $request)
    {
        $companyId = $request->user()->company_id;

        $transfers = FundTransfer::whereHas('fromAccount', fn ($q) => $q->where('company_id', $companyId))
            ->with('fromAccount:id,account_name', 'toAccount:id,account_name')
            ->latest('transfer_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Banking/Transfers', [
            'transfers' => $transfers,
            'accounts'  => BankAccount::where('company_id', $companyId)->where('is_active', true)->get(['id', 'account_name', 'bank_name']),
        ]);
    }

    public function storeTransfer(Request $request)
    {
        $data = $request->validate([
            'from_account_id' => 'required|exists:bank_accounts,id',
            'to_account_id'   => 'required|exists:bank_accounts,id|different:from_account_id',
            'amount'          => 'required|numeric|min:0.01',
            'transfer_date'   => 'required|date',
            'reference'       => 'nullable|string|max:100',
            'description'     => 'nullable|string',
        ]);

        FundTransfer::create(array_merge($data, [
            'created_by' => $request->user()->id,
        ]));

        // Update balances
        BankAccount::find($data['from_account_id'])->decrement('balance', $data['amount']);
        BankAccount::find($data['to_account_id'])->increment('balance', $data['amount']);

        return redirect()->route('banking.transfers')->with('success', 'Transfer recorded.');
    }
}
