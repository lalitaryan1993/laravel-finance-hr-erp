<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Accounting\AccountController;
use App\Http\Controllers\Accounting\JournalController;
use App\Http\Controllers\Accounting\LedgerController;
use App\Http\Controllers\Invoicing\InvoiceController;
use App\Http\Controllers\Expenses\ExpenseController;
use App\Http\Controllers\Banking\BankAccountController;
use App\Http\Controllers\Banking\BankTransactionController;
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Payroll\EmployeeController;
use App\Http\Controllers\Payroll\EmployeeHrController;
use App\Http\Controllers\Payroll\EmployeeAccountController;
use App\Http\Controllers\Payroll\AttendanceController;
use App\Http\Controllers\Payroll\LeaveController;
use App\Http\Controllers\Payroll\DepartmentController;
use App\Http\Controllers\Tax\TaxController;
use App\Http\Controllers\Assets\AssetController;
use App\Http\Controllers\Vendors\VendorController;
use App\Http\Controllers\Vendor\PurchaseOrderController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Budget\BudgetController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Settings\UserController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\Settings\CompanyController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\AI\AIAssistantController;
use App\Http\Controllers\Approvals\ApprovalController;
use App\Http\Controllers\Installer\InstallerController;
use App\Http\Controllers\Employee\EmployeePortalController;

/*
|--------------------------------------------------------------------------
| INSTALLER (no auth needed before install)
|--------------------------------------------------------------------------
*/
Route::group(['prefix' => 'install', 'middleware' => 'installer.check'], function () {
    Route::get('/',              [InstallerController::class, 'welcome'])->name('installer.welcome');
    Route::get('/requirements',  [InstallerController::class, 'requirements'])->name('installer.requirements');
    Route::get('/database',      [InstallerController::class, 'database'])->name('installer.database');
    Route::post('/database',     [InstallerController::class, 'saveDatabase'])->name('installer.database.save');
    Route::get('/admin',         [InstallerController::class, 'admin'])->name('installer.admin');
    Route::post('/admin',        [InstallerController::class, 'saveAdmin'])->name('installer.admin.save');
    Route::get('/complete',      [InstallerController::class, 'complete'])->name('installer.complete');
    Route::post('/run',          [InstallerController::class, 'run'])->name('installer.run');
});

/*
|--------------------------------------------------------------------------
| AUTH routes (guests only)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login',                  [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',                 [AuthController::class, 'login'])->name('login.submit');
    Route::get('/register',               [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register',              [AuthController::class, 'register'])->name('register.submit');
    Route::get('/forgot-password',        [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password',       [AuthController::class, 'forgotPassword'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password',        [AuthController::class, 'resetPassword'])->name('password.update');
    Route::get('/two-factor',             [AuthController::class, 'show2FA'])->name('2fa.index');
    Route::post('/two-factor',            [AuthController::class, 'verify2FA'])->name('2fa.verify');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

/*
|--------------------------------------------------------------------------
| AUTHENTICATED routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // ── Redirects ──────────────────────────────────────────────────────────
    Route::get('/', fn () => redirect()->route('dashboard'));

    // ── Dashboard ──────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware('can:dashboard.view');

    // ── Profile (own profile — no module permission needed) ────────────────
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/password', [AuthController::class, 'updatePassword'])->name('profile.password');

    // ── Help & Support ────────────────────────────────────────────────────
    Route::get('/help', fn () => Inertia::render('Help/Index'))->name('help');

    // ── Employee Self-Service (no module permission — scoped to own data) ─
    Route::prefix('me')->name('me.')->group(function () {
        Route::get('/payslips',   [EmployeePortalController::class, 'payslips'])->name('payslips');
        Route::get('/leave',      [EmployeePortalController::class, 'leave'])->name('leave');
        Route::post('/leave',     [EmployeePortalController::class, 'storeLeave'])->name('leave.store');
        Route::get('/attendance', [EmployeePortalController::class, 'attendance'])->name('attendance');
    });

    /*
    |----------------------------------------------------------------------
    | ACCOUNTING  —  requires: accounting.view
    |----------------------------------------------------------------------
    */
    Route::prefix('accounting')->name('accounting.')->middleware('can:accounting.view')->group(function () {
        Route::resource('accounts', AccountController::class);
        Route::post('accounts/{account}/toggle',    [AccountController::class, 'toggle'])->name('accounts.toggle');
        Route::get('accounts/{account}/statement',  [AccountController::class, 'statement'])->name('accounts.statement');

        Route::resource('journal', JournalController::class);
        Route::post('journal/{journal}/post',    [JournalController::class, 'post'])->name('journal.post')->middleware('can:accounting.post_journal');
        Route::post('journal/{journal}/void',    [JournalController::class, 'void'])->name('journal.void')->middleware('can:accounting.void_journal');
        Route::post('journal/{journal}/reverse', [JournalController::class, 'reverse'])->name('journal.reverse')->middleware('can:accounting.post_journal');

        Route::get('ledger',         [LedgerController::class, 'index'])->name('ledger.index');
        Route::get('trial-balance',  [LedgerController::class, 'trialBalance'])->name('ledger.trial-balance');
        Route::get('reconciliation', [LedgerController::class, 'reconciliation'])->name('ledger.reconciliation');
        Route::post('reconciliation',[LedgerController::class, 'reconcileTransactions'])->name('ledger.reconciliation.post')->middleware('can:accounting.edit');
    });

    /*
    |----------------------------------------------------------------------
    | INVOICING  —  requires: invoicing.view
    |----------------------------------------------------------------------
    */
    Route::prefix('invoices')->name('invoices.')->middleware('can:invoicing.view')->group(function () {
        Route::get('/',             [InvoiceController::class, 'index'])->name('index');
        Route::get('/sales',        [InvoiceController::class, 'sales'])->name('sales');
        Route::get('/purchase',     [InvoiceController::class, 'purchase'])->name('purchase');
        Route::get('/credit-notes', [InvoiceController::class, 'creditNotes'])->name('credit-notes');
        Route::get('/proforma',     [InvoiceController::class, 'proforma'])->name('proforma');
        Route::get('/recurring',    [InvoiceController::class, 'recurring'])->name('recurring');
        Route::get('/create',       [InvoiceController::class, 'create'])->name('create')->middleware('can:invoicing.create');
        Route::post('/',            [InvoiceController::class, 'store'])->name('store')->middleware('can:invoicing.create');
        Route::get('/{invoice}',        [InvoiceController::class, 'show'])->name('show');
        Route::get('/{invoice}/edit',   [InvoiceController::class, 'edit'])->name('edit')->middleware('can:invoicing.edit');
        Route::put('/{invoice}',        [InvoiceController::class, 'update'])->name('update')->middleware('can:invoicing.edit');
        Route::delete('/{invoice}',     [InvoiceController::class, 'destroy'])->name('destroy')->middleware('can:invoicing.delete');
        Route::post('/{invoice}/send',  [InvoiceController::class, 'send'])->name('send')->middleware('can:invoicing.send');
        Route::get('/{invoice}/pdf',    [InvoiceController::class, 'pdf'])->name('pdf');
        Route::get('/{invoice}/preview',[InvoiceController::class, 'preview'])->name('preview');
        Route::post('/{invoice}/payment',              [InvoiceController::class, 'recordPayment'])->name('payment')->middleware('can:invoicing.record_payment');
        Route::put('/{invoice}/payments/{payment}',   [InvoiceController::class, 'updatePayment'])->name('payment.update')->middleware('can:invoicing.record_payment');
        Route::delete('/{invoice}/payments/{payment}',[InvoiceController::class, 'destroyPayment'])->name('payment.destroy')->middleware('can:invoicing.record_payment');
        Route::post('/{invoice}/duplicate',[InvoiceController::class, 'duplicate'])->name('duplicate')->middleware('can:invoicing.create');
    });

    /*
    |----------------------------------------------------------------------
    | EXPENSES  —  requires: expenses.view
    |----------------------------------------------------------------------
    */
    Route::prefix('expenses')->name('expenses.')->middleware('can:expenses.view')->group(function () {
        Route::get('/',          [ExpenseController::class, 'index'])->name('index');
        Route::get('/create',    [ExpenseController::class, 'create'])->name('create')->middleware('can:expenses.create');
        Route::post('/',         [ExpenseController::class, 'store'])->name('store')->middleware('can:expenses.create');
        Route::get('/claims',    [ExpenseController::class, 'claims'])->name('claims');
        Route::get('/approvals', [ExpenseController::class, 'approvals'])->name('approvals');
        Route::get('/policies',  [ExpenseController::class, 'policies'])->name('policies');
        Route::post('/policies',            [ExpenseController::class, 'storePolicy'])->name('policies.store')->middleware('can:expenses.approve');
        Route::put('/policies/{policy}',    [ExpenseController::class, 'updatePolicy'])->name('policies.update')->middleware('can:expenses.approve');
        Route::delete('/policies/{policy}', [ExpenseController::class, 'destroyPolicy'])->name('policies.destroy')->middleware('can:expenses.approve');
        Route::get('/{expense}',            [ExpenseController::class, 'show'])->name('show');
        Route::put('/{expense}',            [ExpenseController::class, 'update'])->name('update')->middleware('can:expenses.edit');
        Route::delete('/{expense}',         [ExpenseController::class, 'destroy'])->name('destroy')->middleware('can:expenses.delete');
        Route::post('/{expense}/submit',    [ExpenseController::class, 'submit'])->name('submit');
        Route::post('/{expense}/approve',   [ExpenseController::class, 'approve'])->name('approve')->middleware('can:expenses.approve');
        Route::post('/{expense}/reject',    [ExpenseController::class, 'reject'])->name('reject')->middleware('can:expenses.approve');
    });

    /*
    |----------------------------------------------------------------------
    | BANKING  —  requires: banking.view
    |----------------------------------------------------------------------
    */
    Route::get('/banking', fn () => redirect('/banking/accounts'));

    Route::prefix('banking')->name('banking.')->middleware('can:banking.view')->group(function () {
        Route::resource('accounts', BankAccountController::class);
        Route::get('transactions',   [BankTransactionController::class, 'index'])->name('transactions.index');
        Route::get('reconciliation', [BankTransactionController::class, 'reconciliation'])->name('reconciliation');
        Route::get('transfers',      [BankTransactionController::class, 'transfers'])->name('transfers');
        Route::post('transfers',     [BankTransactionController::class, 'storeTransfer'])->name('transfers.store')->middleware('can:banking.create');
    });

    /*
    |----------------------------------------------------------------------
    | PAYROLL & HR  —  requires: payroll.view
    |----------------------------------------------------------------------
    */
    Route::prefix('payroll')->name('payroll.')->middleware('can:payroll.view')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('index');

        // Employees
        Route::resource('employees', EmployeeController::class);
        Route::put('employees/{employee}/hr', [EmployeeHrController::class, 'updateHr'])->name('employees.hr.update')->middleware('can:payroll.edit');

        // Emergency Contacts
        Route::post('employees/{employee}/emergency-contacts',             [EmployeeHrController::class, 'storeEmergencyContact'])->name('employees.emergency-contacts.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/emergency-contacts/{contact}',    [EmployeeHrController::class, 'updateEmergencyContact'])->name('employees.emergency-contacts.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/emergency-contacts/{contact}', [EmployeeHrController::class, 'destroyEmergencyContact'])->name('employees.emergency-contacts.destroy')->middleware('can:payroll.edit');

        // Documents
        Route::post('employees/{employee}/documents',              [EmployeeHrController::class, 'storeDocument'])->name('employees.documents.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/documents/{document}',    [EmployeeHrController::class, 'updateDocument'])->name('employees.documents.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/documents/{document}', [EmployeeHrController::class, 'destroyDocument'])->name('employees.documents.destroy')->middleware('can:payroll.edit');

        // Educations
        Route::post('employees/{employee}/educations',               [EmployeeHrController::class, 'storeEducation'])->name('employees.educations.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/educations/{education}',    [EmployeeHrController::class, 'updateEducation'])->name('employees.educations.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/educations/{education}', [EmployeeHrController::class, 'destroyEducation'])->name('employees.educations.destroy')->middleware('can:payroll.edit');

        // Experiences
        Route::post('employees/{employee}/experiences',               [EmployeeHrController::class, 'storeExperience'])->name('employees.experiences.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/experiences/{experience}',   [EmployeeHrController::class, 'updateExperience'])->name('employees.experiences.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/experiences/{experience}',[EmployeeHrController::class, 'destroyExperience'])->name('employees.experiences.destroy')->middleware('can:payroll.edit');

        // Dependents
        Route::post('employees/{employee}/dependents',               [EmployeeHrController::class, 'storeDependent'])->name('employees.dependents.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/dependents/{dependent}',    [EmployeeHrController::class, 'updateDependent'])->name('employees.dependents.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/dependents/{dependent}', [EmployeeHrController::class, 'destroyDependent'])->name('employees.dependents.destroy')->middleware('can:payroll.edit');

        // Assets
        Route::post('employees/{employee}/assets',           [EmployeeHrController::class, 'storeAsset'])->name('employees.assets.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/assets/{asset}',    [EmployeeHrController::class, 'updateAsset'])->name('employees.assets.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/assets/{asset}', [EmployeeHrController::class, 'destroyAsset'])->name('employees.assets.destroy')->middleware('can:payroll.edit');

        // Lifecycle Tasks
        Route::post('employees/{employee}/lifecycle-tasks',           [EmployeeHrController::class, 'storeLifecycleTask'])->name('employees.lifecycle-tasks.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/lifecycle-tasks/{task}',     [EmployeeHrController::class, 'updateLifecycleTask'])->name('employees.lifecycle-tasks.update')->middleware('can:payroll.edit');
        Route::post('employees/{employee}/lifecycle-tasks/{task}/complete', [EmployeeHrController::class, 'completeLifecycleTask'])->name('employees.lifecycle-tasks.complete')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/lifecycle-tasks/{task}',  [EmployeeHrController::class, 'destroyLifecycleTask'])->name('employees.lifecycle-tasks.destroy')->middleware('can:payroll.edit');

        // Notes
        Route::post('employees/{employee}/notes',        [EmployeeHrController::class, 'storeNote'])->name('employees.notes.store')->middleware('can:payroll.edit');
        Route::put('employees/{employee}/notes/{note}',  [EmployeeHrController::class, 'updateNote'])->name('employees.notes.update')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/notes/{note}',[EmployeeHrController::class, 'destroyNote'])->name('employees.notes.destroy')->middleware('can:payroll.edit');

        // Photo upload
        Route::post('employees/{employee}/photo', [EmployeeController::class, 'uploadPhoto'])->name('employees.photo')->middleware('can:payroll.edit');

        // Account management
        Route::post('employees/{employee}/account',                [EmployeeAccountController::class, 'createAccount'])->name('employees.account.create')->middleware('can:payroll.edit');
        Route::post('employees/{employee}/account/link',           [EmployeeAccountController::class, 'linkAccount'])->name('employees.account.link')->middleware('can:payroll.edit');
        Route::post('employees/{employee}/account/reset-password', [EmployeeAccountController::class, 'resetPassword'])->name('employees.account.reset-password')->middleware('can:payroll.edit');
        Route::delete('employees/{employee}/account',              [EmployeeAccountController::class, 'unlinkAccount'])->name('employees.account.unlink')->middleware('can:payroll.edit');

        // Salary Structures
        Route::get('structures',               [PayrollController::class, 'structures'])->name('structures');
        Route::post('structures',              [PayrollController::class, 'storeStructure'])->name('structures.store')->middleware('can:payroll.create');
        Route::put('structures/{structure}',   [PayrollController::class, 'updateStructure'])->name('structures.update')->middleware('can:payroll.edit');
        Route::delete('structures/{structure}',[PayrollController::class, 'destroyStructure'])->name('structures.destroy')->middleware('can:payroll.delete');

        // Payroll Processing
        Route::get('process',              [PayrollController::class, 'process'])->name('process')->middleware('can:payroll.process');
        Route::post('run',                 [PayrollController::class, 'runPayroll'])->name('run')->middleware('can:payroll.process');
        Route::get('payslips',             [PayrollController::class, 'payslips'])->name('payslips');
        Route::get('payslips/{payslip}/pdf',[PayrollController::class, 'payslipPdf'])->name('payslips.pdf');
        Route::get('reports',              [PayrollController::class, 'reports'])->name('reports');

        // Departments
        Route::get('departments',               [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('departments',              [DepartmentController::class, 'store'])->name('departments.store')->middleware('can:payroll.create');
        Route::put('departments/{department}',  [DepartmentController::class, 'update'])->name('departments.update')->middleware('can:payroll.edit');
        Route::delete('departments/{department}',[DepartmentController::class, 'destroy'])->name('departments.destroy')->middleware('can:payroll.delete');

        // Attendance
        Route::get('attendance',         [AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('attendance/mark',    [AttendanceController::class, 'mark'])->name('attendance.mark')->middleware('can:payroll.edit');
        Route::post('attendance/bulk',   [AttendanceController::class, 'saveBulk'])->name('attendance.bulk')->middleware('can:payroll.edit');
        Route::get('attendance/report',  [AttendanceController::class, 'report'])->name('attendance.report');

        // Leave Types
        Route::get('leave/types',               [LeaveController::class, 'types'])->name('leave.types');
        Route::post('leave/types',              [LeaveController::class, 'storeType'])->name('leave.types.store')->middleware('can:payroll.create');
        Route::put('leave/types/{leaveType}',   [LeaveController::class, 'updateType'])->name('leave.types.update')->middleware('can:payroll.edit');
        Route::delete('leave/types/{leaveType}',[LeaveController::class, 'destroyType'])->name('leave.types.destroy')->middleware('can:payroll.delete');

        // Leave Allocations
        Route::get('leave/allocations',         [LeaveController::class, 'allocations'])->name('leave.allocations');
        Route::post('leave/allocations',        [LeaveController::class, 'allocate'])->name('leave.allocations.store')->middleware('can:payroll.edit');
        Route::post('leave/allocations/bulk',   [LeaveController::class, 'bulkAllocate'])->name('leave.allocations.bulk')->middleware('can:payroll.edit');

        // Leave Requests
        Route::get('leave',                               [LeaveController::class, 'index'])->name('leave.index');
        Route::get('leave/apply',                         [LeaveController::class, 'apply'])->name('leave.apply');
        Route::post('leave',                              [LeaveController::class, 'store'])->name('leave.store');
        Route::get('leave/balance',                       [LeaveController::class, 'balance'])->name('leave.balance');
        Route::post('leave/{leaveRequest}/approve',       [LeaveController::class, 'approve'])->name('leave.approve')->middleware('can:payroll.edit');
        Route::post('leave/{leaveRequest}/reject',        [LeaveController::class, 'reject'])->name('leave.reject')->middleware('can:payroll.edit');
        Route::post('leave/{leaveRequest}/cancel',        [LeaveController::class, 'cancel'])->name('leave.cancel');
    });

    /*
    |----------------------------------------------------------------------
    | TAX  —  requires: tax.view
    |----------------------------------------------------------------------
    */
    Route::prefix('tax')->name('tax.')->middleware('can:tax.view')->group(function () {
        Route::get('gst',      [TaxController::class, 'gst'])->name('gst');
        Route::get('tds',      [TaxController::class, 'tds'])->name('tds');
        Route::get('reports',  [TaxController::class, 'reports'])->name('reports');
        Route::get('settings', [TaxController::class, 'settings'])->name('settings');
        Route::post('rates',              [TaxController::class, 'store'])->name('rates.store')->middleware('can:tax.manage');
        Route::put('rates/{taxRate}',     [TaxController::class, 'update'])->name('rates.update')->middleware('can:tax.manage');
        Route::delete('rates/{taxRate}',  [TaxController::class, 'destroy'])->name('rates.destroy')->middleware('can:tax.manage');
        Route::post('rates/{taxRate}/toggle',[TaxController::class, 'toggle'])->name('rates.toggle')->middleware('can:tax.manage');
    });

    /*
    |----------------------------------------------------------------------
    | ASSETS  —  requires: assets.view
    |----------------------------------------------------------------------
    */
    Route::prefix('assets')->name('assets.')->middleware('can:assets.view')->group(function () {
        Route::get('/',                  [AssetController::class, 'index'])->name('index');
        Route::get('/create',            [AssetController::class, 'create'])->name('create')->middleware('can:assets.create');
        Route::get('/depreciation',      [AssetController::class, 'depreciation'])->name('depreciation');
        Route::get('/maintenance',       [AssetController::class, 'maintenance'])->name('maintenance');
        Route::post('/',                 [AssetController::class, 'store'])->name('store')->middleware('can:assets.create');
        Route::post('/run-depreciation', [AssetController::class, 'runDepreciation'])->name('run-depreciation')->middleware('can:assets.edit');
        Route::get('/{asset}',           [AssetController::class, 'show'])->name('show');
        Route::put('/{asset}',           [AssetController::class, 'update'])->name('update')->middleware('can:assets.edit');
        Route::delete('/{asset}',        [AssetController::class, 'destroy'])->name('destroy')->middleware('can:assets.delete');
    });

    /*
    |----------------------------------------------------------------------
    | VENDORS  —  requires: vendors.view
    |----------------------------------------------------------------------
    */
    Route::prefix('vendors')->name('vendors.')->middleware('can:vendors.view')->group(function () {
        Route::get('payments', [VendorController::class, 'payments'])->name('payments');
        Route::resource('purchase-orders', PurchaseOrderController::class);
        Route::resource('/', VendorController::class)->parameters(['' => 'vendor']);
    });

    /*
    |----------------------------------------------------------------------
    | CUSTOMERS  —  requires: customers.view
    |----------------------------------------------------------------------
    */
    Route::prefix('customers')->name('customers.')->middleware('can:customers.view')->group(function () {
        Route::get('/outstanding',          [CustomerController::class, 'outstanding'])->name('outstanding');
        Route::resource('/', CustomerController::class)->parameters(['' => 'customer']);
        Route::get('/{customer}/statement', [CustomerController::class, 'statement'])->name('statement');
    });

    /*
    |----------------------------------------------------------------------
    | BUDGET  —  requires: budget.view
    |----------------------------------------------------------------------
    */
    Route::prefix('budget')->name('budget.')->middleware('can:budget.view')->group(function () {
        Route::get('/forecast', [BudgetController::class, 'forecast'])->name('forecast');
        Route::get('/variance', [BudgetController::class, 'variance'])->name('variance');
        Route::resource('/', BudgetController::class)->parameters(['' => 'budget']);
    });

    /*
    |----------------------------------------------------------------------
    | REPORTS  —  requires: reports.view
    |----------------------------------------------------------------------
    */
    Route::prefix('reports')->name('reports.')->middleware('can:reports.view')->group(function () {
        Route::get('/',              [ReportController::class, 'index'])->name('index');
        Route::get('/pnl',           [ReportController::class, 'pnl'])->name('pnl');
        Route::get('/balance-sheet', [ReportController::class, 'balanceSheet'])->name('balance-sheet');
        Route::get('/cash-flow',     [ReportController::class, 'cashFlow'])->name('cash-flow');
        Route::get('/financial',     [ReportController::class, 'financial'])->name('financial');
        Route::post('/export',       [ReportController::class, 'export'])->name('export')->middleware('can:reports.export');
    });

    /*
    |----------------------------------------------------------------------
    | AI ASSISTANT  —  requires: ai.use
    |----------------------------------------------------------------------
    */
    Route::prefix('ai')->name('ai.')->middleware('can:ai.use')->group(function () {
        Route::get('/',          [AIAssistantController::class, 'index'])->name('index');
        Route::post('/chat',     [AIAssistantController::class, 'chat'])->name('chat');
        Route::post('/analyze',  [AIAssistantController::class, 'analyze'])->name('analyze');
        Route::post('/forecast', [AIAssistantController::class, 'forecast'])->name('forecast');
    });

    /*
    |----------------------------------------------------------------------
    | APPROVALS  —  accessible to all authenticated users
    |----------------------------------------------------------------------
    */
    Route::prefix('approvals')->name('approvals.')->group(function () {
        Route::get('/',                    [ApprovalController::class, 'index'])->name('index');
        Route::post('/{approval}/approve', [ApprovalController::class, 'approve'])->name('approve');
        Route::post('/{approval}/reject',  [ApprovalController::class, 'reject'])->name('reject');
    });

    /*
    |----------------------------------------------------------------------
    | COMPANIES  —  requires: settings.manage_company
    |----------------------------------------------------------------------
    */
    Route::resource('companies', CompanyController::class)
        ->names('companies')
        ->middleware('can:settings.manage_company');

    /*
    |----------------------------------------------------------------------
    | SETTINGS  —  requires: settings.view
    |----------------------------------------------------------------------
    */
    Route::prefix('settings')->name('settings.')->middleware('can:settings.view')->group(function () {
        Route::get('/',  [SettingsController::class, 'general'])->name('general');
        Route::put('/',  [SettingsController::class, 'update'])->name('update')->middleware('can:settings.manage_company');

        // User management — requires: settings.manage_users
        Route::resource('users', UserController::class)->middleware('can:settings.manage_users');
        Route::put('/users/{user}/roles', [PermissionController::class, 'syncUserRoles'])->name('users.sync-roles')->middleware('can:settings.manage_users');

        // Role & permission management — requires: settings.manage_roles
        Route::get('/permissions',                  [PermissionController::class, 'index'])->name('permissions')->middleware('can:settings.manage_roles');
        Route::post('/roles',                       [PermissionController::class, 'storeRole'])->name('roles.store')->middleware('can:settings.manage_roles');
        Route::put('/roles/{role}',                 [PermissionController::class, 'updateRole'])->name('roles.update')->middleware('can:settings.manage_roles');
        Route::delete('/roles/{role}',              [PermissionController::class, 'destroyRole'])->name('roles.destroy')->middleware('can:settings.manage_roles');
        Route::put('/roles/{role}/permissions',     [PermissionController::class, 'syncPermissions'])->name('roles.sync-permissions')->middleware('can:settings.manage_roles');
        Route::put('/permissions/matrix',           [PermissionController::class, 'syncMatrix'])->name('permissions.sync-matrix')->middleware('can:settings.manage_roles');

        // Notifications, Integrations, Audit, Backup — settings.view is enough
        Route::get('/notifications',         [SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications',         [SettingsController::class, 'updateNotifications'])->name('notifications.update');
        Route::get('/integrations',          [SettingsController::class, 'integrations'])->name('integrations');
        Route::put('/integrations/{key}',    [SettingsController::class, 'updateIntegration'])->name('integrations.update');
        Route::post('/integrations/{key}/test', [SettingsController::class, 'testIntegration'])->name('integrations.test');
        Route::get('/audit',                 [SettingsController::class, 'audit'])->name('audit');
        Route::get('/backup',                [SettingsController::class, 'backup'])->name('backup');
        Route::post('/backup/run',           [SettingsController::class, 'runBackup'])->name('backup.run');
    });
});
