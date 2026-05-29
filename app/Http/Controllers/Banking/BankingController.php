<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankingController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        return Inertia::render('Banking/Index', [
            'bankAccounts'       => BankAccount::where('company_id', $companyId)->where('is_active', true)->get(),
            'recentTransactions' => BankTransaction::whereHas('bankAccount', fn ($q) => $q->where('company_id', $companyId))
                ->with('bankAccount')
                ->latest('transaction_date')
                ->take(20)
                ->get(),
        ]);
    }
}
