<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $accounts = BankAccount::where('company_id', $companyId)
            ->withSum(['transactions as total_credits' => fn ($q) => $q->where('transaction_type', 'credit')], 'amount')
            ->withSum(['transactions as total_debits'  => fn ($q) => $q->where('transaction_type', 'debit')],  'amount')
            ->get();

        return Inertia::render('Banking/Index', [
            'bankAccounts'       => $accounts,
            'recentTransactions' => BankTransaction::whereHas('bankAccount', fn ($q) =>
                    $q->where('company_id', $companyId))
                ->with('bankAccount:id,account_name,bank_name')
                ->latest('transaction_date')
                ->take(20)
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Banking/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'account_name'   => 'required|string|max:255',
            'bank_name'      => 'required|string|max:255',
            'account_number' => 'required|string|max:30',
            'ifsc_code'      => 'nullable|string|max:15',
            'branch_name'    => 'nullable|string|max:255',
            'account_type'   => 'required|in:savings,current,overdraft',
            'opening_balance'=> 'nullable|numeric',
            'currency'       => 'required|size:3',
        ]);

        BankAccount::create(array_merge($data, [
            'company_id' => $request->user()->company_id,
            'balance'    => $data['opening_balance'] ?? 0,
            'is_active'  => true,
        ]));

        return redirect()->route('banking.accounts.index')->with('success', 'Bank account added.');
    }

    public function show(BankAccount $account)
    {
        $account->load('transactions');

        return Inertia::render('Banking/Show', [
            'account' => $account,
        ]);
    }

    public function edit(BankAccount $account)
    {
        return Inertia::render('Banking/Edit', ['account' => $account]);
    }

    public function update(Request $request, BankAccount $account)
    {
        $data = $request->validate([
            'account_name' => 'required|string|max:255',
            'bank_name'    => 'required|string|max:255',
            'ifsc_code'    => 'nullable|string|max:15',
            'branch_name'  => 'nullable|string|max:255',
            'is_active'    => 'boolean',
        ]);

        $account->update($data);

        return back()->with('success', 'Bank account updated.');
    }

    public function destroy(BankAccount $account)
    {
        $account->update(['is_active' => false]);

        return redirect()->route('banking.accounts.index')->with('success', 'Bank account deactivated.');
    }
}
