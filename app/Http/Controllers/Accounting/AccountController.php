<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AccountGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $accounts = Account::forCompany($companyId)
            ->with('accountGroup')
            ->orderBy('code')
            ->paginate(50)
            ->withQueryString();

        $groups = AccountGroup::where('company_id', $companyId)->get();

        return Inertia::render('Accounting/Accounts/Index', [
            'accounts' => $accounts,
            'groups'   => $groups,
            'filters'  => $request->only(['search', 'type', 'is_active']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;
        return Inertia::render('Accounting/Accounts/Create', [
            'groups' => AccountGroup::where('company_id', $companyId)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'             => 'required|string|max:20',
            'name'             => 'required|string|max:255',
            'account_group_id' => 'required|exists:account_groups,id',
            'type'             => 'required|in:asset,liability,equity,income,expense',
            'nature'           => 'required|in:debit,credit',
            'opening_balance'  => 'nullable|numeric',
            'description'      => 'nullable|string',
            'is_active'        => 'boolean',
        ]);

        $data['company_id'] = $request->user()->company_id;
        $data['created_by'] = $request->user()->id;

        Account::create($data);

        return redirect()->route('accounting.accounts.index')
                         ->with('success', 'Account created successfully.');
    }

    public function show(Account $account)
    {
        $account->load('accountGroup', 'journalLines.journal');
        return Inertia::render('Accounting/Accounts/Show', ['account' => $account]);
    }

    public function edit(Account $account)
    {
        $groups = AccountGroup::where('company_id', $account->company_id)->get();
        return Inertia::render('Accounting/Accounts/Edit', ['account' => $account, 'groups' => $groups]);
    }

    public function update(Request $request, Account $account)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'account_group_id' => 'required|exists:account_groups,id',
            'description'      => 'nullable|string',
            'is_active'        => 'boolean',
        ]);

        $account->update($data);
        return redirect()->route('accounting.accounts.index')->with('success', 'Account updated.');
    }

    public function destroy(Account $account)
    {
        if ($account->is_system) {
            return back()->withErrors(['error' => 'Cannot delete a system account.']);
        }
        $account->delete();
        return redirect()->route('accounting.accounts.index')->with('success', 'Account deleted.');
    }

    public function toggle(Account $account)
    {
        $account->update(['is_active' => !$account->is_active]);
        return back()->with('success', 'Account status updated.');
    }

    public function statement(Request $request, Account $account)
    {
        $lines = $account->journalLines()
            ->with('journal')
            ->when($request->from, fn ($q, $v) => $q->whereHas('journal', fn ($j) => $j->where('date', '>=', $v)))
            ->when($request->to,   fn ($q, $v) => $q->whereHas('journal', fn ($j) => $j->where('date', '<=', $v)))
            ->orderBy('created_at')
            ->paginate(50);

        return Inertia::render('Accounting/Accounts/Statement', ['account' => $account, 'lines' => $lines]);
    }
}
