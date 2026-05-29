<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Accounting\AccountController;
use App\Http\Controllers\Accounting\JournalController;
use App\Http\Controllers\Accounting\LedgerController;
use App\Http\Controllers\Invoicing\InvoiceController;
use App\Http\Controllers\Expenses\ExpenseController;
use App\Http\Controllers\Banking\BankAccountController;
use App\Http\Controllers\Banking\BankTransactionController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Vendors\VendorController;
use App\Http\Controllers\Budget\BudgetController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Payroll\EmployeeController;
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Assets\AssetController;
use App\Http\Controllers\Tax\TaxController;
use App\Http\Controllers\AI\AIAssistantController;

/*
|--------------------------------------------------------------------------
| Public API routes (no auth required)
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/auth/login',   [AuthController::class, 'apiLogin'])->name('api.login');
    Route::post('/auth/refresh', [AuthController::class, 'apiRefresh'])->name('api.refresh');

    /*
    |----------------------------------------------------------------------
    | Sanctum-protected routes
    |----------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {

        // Current user
        Route::get('/me', fn (Request $request) => response()->json([
            'user'    => $request->user()->only('id', 'name', 'email', 'company_id'),
            'company' => $request->user()->company?->only('id', 'name', 'currency'),
        ]));
        Route::post('/auth/logout', [AuthController::class, 'apiLogout'])->name('api.logout');

        // ── Accounting ────────────────────────────────────────────────
        Route::prefix('accounting')->group(function () {
            Route::get('/accounts',              [AccountController::class, 'index']);
            Route::post('/accounts',             [AccountController::class, 'store']);
            Route::get('/accounts/{account}',    [AccountController::class, 'show']);
            Route::put('/accounts/{account}',    [AccountController::class, 'update']);
            Route::delete('/accounts/{account}', [AccountController::class, 'destroy']);

            Route::get('/journals',              [JournalController::class, 'index']);
            Route::post('/journals',             [JournalController::class, 'store']);
            Route::get('/journals/{journal}',    [JournalController::class, 'show']);
            Route::post('/journals/{journal}/post',    [JournalController::class, 'post']);
            Route::post('/journals/{journal}/void',    [JournalController::class, 'void']);

            Route::get('/trial-balance',         [LedgerController::class, 'trialBalance']);
            Route::get('/ledger',                [LedgerController::class, 'index']);
        });

        // ── Invoices ─────────────────────────────────────────────────
        Route::prefix('invoices')->group(function () {
            Route::get('/',                      [InvoiceController::class, 'index']);
            Route::post('/',                     [InvoiceController::class, 'store']);
            Route::get('/{invoice}',             [InvoiceController::class, 'show']);
            Route::put('/{invoice}',             [InvoiceController::class, 'update']);
            Route::delete('/{invoice}',          [InvoiceController::class, 'destroy']);
            Route::post('/{invoice}/send',       [InvoiceController::class, 'send']);
            Route::post('/{invoice}/payment',    [InvoiceController::class, 'recordPayment']);
        });

        // ── Expenses ─────────────────────────────────────────────────
        Route::prefix('expenses')->group(function () {
            Route::get('/',              [ExpenseController::class, 'index']);
            Route::post('/',             [ExpenseController::class, 'store']);
            Route::get('/{expense}',     [ExpenseController::class, 'show']);
            Route::put('/{expense}',     [ExpenseController::class, 'update']);
            Route::delete('/{expense}',  [ExpenseController::class, 'destroy']);
            Route::post('/{expense}/submit',  [ExpenseController::class, 'submit']);
            Route::post('/{expense}/approve', [ExpenseController::class, 'approve']);
            Route::post('/{expense}/reject',  [ExpenseController::class, 'reject']);
        });

        // ── Banking ───────────────────────────────────────────────────
        Route::prefix('banking')->group(function () {
            Route::get('/accounts',              [BankAccountController::class, 'index']);
            Route::post('/accounts',             [BankAccountController::class, 'store']);
            Route::get('/accounts/{account}',    [BankAccountController::class, 'show']);
            Route::put('/accounts/{account}',    [BankAccountController::class, 'update']);
            Route::get('/transactions',          [BankTransactionController::class, 'index']);
            Route::get('/transfers',             [BankTransactionController::class, 'transfers']);
            Route::post('/transfers',            [BankTransactionController::class, 'storeTransfer']);
        });

        // ── Customers ────────────────────────────────────────────────
        Route::prefix('customers')->group(function () {
            Route::get('/',                      [CustomerController::class, 'index']);
            Route::post('/',                     [CustomerController::class, 'store']);
            Route::get('/{customer}',            [CustomerController::class, 'show']);
            Route::put('/{customer}',            [CustomerController::class, 'update']);
            Route::delete('/{customer}',         [CustomerController::class, 'destroy']);
            Route::get('/{customer}/statement',  [CustomerController::class, 'statement']);
        });

        // ── Vendors ───────────────────────────────────────────────────
        Route::prefix('vendors')->group(function () {
            Route::get('/',                      [VendorController::class, 'index']);
            Route::post('/',                     [VendorController::class, 'store']);
            Route::get('/{vendor}',              [VendorController::class, 'show']);
            Route::put('/{vendor}',              [VendorController::class, 'update']);
            Route::delete('/{vendor}',           [VendorController::class, 'destroy']);
        });

        // ── Budget ────────────────────────────────────────────────────
        Route::prefix('budgets')->group(function () {
            Route::get('/',              [BudgetController::class, 'index']);
            Route::post('/',             [BudgetController::class, 'store']);
            Route::get('/{budget}',      [BudgetController::class, 'show']);
            Route::delete('/{budget}',   [BudgetController::class, 'destroy']);
            Route::post('/{budget}/approve', [BudgetController::class, 'approve']);
        });

        // ── Reports ───────────────────────────────────────────────────
        Route::prefix('reports')->group(function () {
            Route::get('/pnl',           [ReportController::class, 'pnl']);
            Route::get('/balance-sheet', [ReportController::class, 'balanceSheet']);
            Route::get('/cash-flow',     [ReportController::class, 'cashFlow']);
        });

        // ── Payroll ───────────────────────────────────────────────────
        Route::prefix('payroll')->group(function () {
            Route::get('/employees',             [EmployeeController::class, 'index']);
            Route::post('/employees',            [EmployeeController::class, 'store']);
            Route::get('/employees/{employee}',  [EmployeeController::class, 'show']);
            Route::put('/employees/{employee}',  [EmployeeController::class, 'update']);
            Route::get('/payslips',              [PayrollController::class, 'payslips']);
            Route::post('/run',                  [PayrollController::class, 'runPayroll']);
        });

        // ── Assets ────────────────────────────────────────────────────
        Route::prefix('assets')->group(function () {
            Route::get('/',              [AssetController::class, 'index']);
            Route::post('/',             [AssetController::class, 'store']);
            Route::get('/{asset}',       [AssetController::class, 'show']);
            Route::put('/{asset}',       [AssetController::class, 'update']);
            Route::delete('/{asset}',    [AssetController::class, 'destroy']);
        });

        // ── Tax ───────────────────────────────────────────────────────
        Route::prefix('tax')->group(function () {
            Route::get('/gst',     [TaxController::class, 'gst']);
            Route::get('/tds',     [TaxController::class, 'tds']);
        });

        // ── AI Assistant ─────────────────────────────────────────────
        Route::prefix('ai')->group(function () {
            Route::post('/chat',     [AIAssistantController::class, 'chat']);
            Route::post('/analyze',  [AIAssistantController::class, 'analyze']);
            Route::post('/forecast', [AIAssistantController::class, 'forecast']);
        });
    });
});
