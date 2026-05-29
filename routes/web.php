<?php

use Illuminate\Support\Facades\Route;
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

/*
|--------------------------------------------------------------------------
| INSTALLER (no auth needed before install)
|--------------------------------------------------------------------------
*/
Route::group(['prefix' => 'install', 'middleware' => 'installer.check'], function () {
    Route::get('/',          [InstallerController::class, 'welcome'])->name('installer.welcome');
    Route::get('/requirements', [InstallerController::class, 'requirements'])->name('installer.requirements');
    Route::get('/database',  [InstallerController::class, 'database'])->name('installer.database');
    Route::post('/database', [InstallerController::class, 'saveDatabase'])->name('installer.database.save');
    Route::get('/admin',     [InstallerController::class, 'admin'])->name('installer.admin');
    Route::post('/admin',    [InstallerController::class, 'saveAdmin'])->name('installer.admin.save');
    Route::get('/complete',  [InstallerController::class, 'complete'])->name('installer.complete');
    Route::post('/run',      [InstallerController::class, 'run'])->name('installer.run');
});

/*
|--------------------------------------------------------------------------
| AUTH routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login',              [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',             [AuthController::class, 'login'])->name('login.submit');
    Route::get('/register',           [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register',          [AuthController::class, 'register'])->name('register.submit');
    Route::get('/forgot-password',    [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password',   [AuthController::class, 'forgotPassword'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password',    [AuthController::class, 'resetPassword'])->name('password.update');
    Route::get('/two-factor',         [AuthController::class, 'show2FA'])->name('2fa.index');
    Route::post('/two-factor',        [AuthController::class, 'verify2FA'])->name('2fa.verify');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

/*
|--------------------------------------------------------------------------
| AUTHENTICATED routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');

    /*
    |----------------------------------------------------------------------
    | ACCOUNTING
    |----------------------------------------------------------------------
    */
    Route::prefix('accounting')->name('accounting.')->group(function () {
        Route::resource('accounts', AccountController::class);
        Route::post('accounts/{account}/toggle', [AccountController::class, 'toggle'])->name('accounts.toggle');
        Route::get('accounts/{account}/statement', [AccountController::class, 'statement'])->name('accounts.statement');

        Route::resource('journal', JournalController::class);
        Route::post('journal/{journal}/post',    [JournalController::class, 'post'])->name('journal.post');
        Route::post('journal/{journal}/void',    [JournalController::class, 'void'])->name('journal.void');
        Route::post('journal/{journal}/reverse', [JournalController::class, 'reverse'])->name('journal.reverse');

        Route::get('ledger',        [LedgerController::class, 'index'])->name('ledger.index');
        Route::get('trial-balance', [LedgerController::class, 'trialBalance'])->name('ledger.trial-balance');
        Route::get('reconciliation', [LedgerController::class, 'reconciliation'])->name('ledger.reconciliation');
        Route::post('reconciliation',[LedgerController::class, 'reconcileTransactions'])->name('ledger.reconciliation.post');
    });

    /*
    |----------------------------------------------------------------------
    | INVOICING
    |----------------------------------------------------------------------
    */
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/',         [InvoiceController::class, 'index'])->name('index');
        Route::get('/sales',    [InvoiceController::class, 'sales'])->name('sales');
        Route::get('/purchase', [InvoiceController::class, 'purchase'])->name('purchase');
        Route::get('/credit-notes', [InvoiceController::class, 'creditNotes'])->name('credit-notes');
        Route::get('/proforma', [InvoiceController::class, 'proforma'])->name('proforma');
        Route::get('/recurring',[InvoiceController::class, 'recurring'])->name('recurring');
        Route::get('/create',   [InvoiceController::class, 'create'])->name('create');
        Route::post('/',        [InvoiceController::class, 'store'])->name('store');
        Route::get('/{invoice}',      [InvoiceController::class, 'show'])->name('show');
        Route::get('/{invoice}/edit', [InvoiceController::class, 'edit'])->name('edit');
        Route::put('/{invoice}',      [InvoiceController::class, 'update'])->name('update');
        Route::delete('/{invoice}',   [InvoiceController::class, 'destroy'])->name('destroy');
        Route::post('/{invoice}/send',     [InvoiceController::class, 'send'])->name('send');
        Route::get('/{invoice}/pdf',       [InvoiceController::class, 'pdf'])->name('pdf');
        Route::get('/{invoice}/preview',   [InvoiceController::class, 'preview'])->name('preview');
        Route::post('/{invoice}/payment',               [InvoiceController::class, 'recordPayment'])->name('payment');
        Route::put('/{invoice}/payments/{payment}',    [InvoiceController::class, 'updatePayment'])->name('payment.update');
        Route::delete('/{invoice}/payments/{payment}', [InvoiceController::class, 'destroyPayment'])->name('payment.destroy');
        Route::post('/{invoice}/duplicate',[InvoiceController::class, 'duplicate'])->name('duplicate');
    });

    /*
    |----------------------------------------------------------------------
    | EXPENSES
    |----------------------------------------------------------------------
    */
    Route::prefix('expenses')->name('expenses.')->group(function () {
        Route::get('/',          [ExpenseController::class, 'index'])->name('index');
        Route::get('/create',    [ExpenseController::class, 'create'])->name('create');
        Route::post('/',         [ExpenseController::class, 'store'])->name('store');
        // Static paths must come before /{expense} wildcard
        Route::get('/claims',    [ExpenseController::class, 'claims'])->name('claims');
        Route::get('/approvals', [ExpenseController::class, 'approvals'])->name('approvals');
        Route::get('/policies',  [ExpenseController::class, 'policies'])->name('policies');
        Route::post('/policies',             [ExpenseController::class, 'storePolicy'])->name('policies.store');
        Route::put('/policies/{policy}',     [ExpenseController::class, 'updatePolicy'])->name('policies.update');
        Route::delete('/policies/{policy}',  [ExpenseController::class, 'destroyPolicy'])->name('policies.destroy');
        // Wildcard routes last
        Route::get('/{expense}', [ExpenseController::class, 'show'])->name('show');
        Route::put('/{expense}', [ExpenseController::class, 'update'])->name('update');
        Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->name('destroy');
        Route::post('/{expense}/submit',  [ExpenseController::class, 'submit'])->name('submit');
        Route::post('/{expense}/approve', [ExpenseController::class, 'approve'])->name('approve');
        Route::post('/{expense}/reject',  [ExpenseController::class, 'reject'])->name('reject');
    });

    /*
    |----------------------------------------------------------------------
    | BANKING
    |----------------------------------------------------------------------
    */
    Route::get('/banking', fn () => redirect('/banking/accounts'));

    Route::prefix('banking')->name('banking.')->group(function () {
        Route::resource('accounts', BankAccountController::class);
        Route::get('transactions',          [BankTransactionController::class, 'index'])->name('transactions.index');
        Route::get('reconciliation',        [BankTransactionController::class, 'reconciliation'])->name('reconciliation');
        Route::get('transfers',             [BankTransactionController::class, 'transfers'])->name('transfers');
        Route::post('transfers',            [BankTransactionController::class, 'storeTransfer'])->name('transfers.store');
    });

    /*
    |----------------------------------------------------------------------
    | PAYROLL
    |----------------------------------------------------------------------
    */
    Route::prefix('payroll')->name('payroll.')->group(function () {
        Route::get('/',                     [PayrollController::class, 'index'])->name('index');
        Route::resource('employees', EmployeeController::class);
        Route::put('employees/{employee}/hr', [EmployeeHrController::class, 'updateHr'])->name('employees.hr.update');

        Route::post('employees/{employee}/emergency-contacts', [EmployeeHrController::class, 'storeEmergencyContact'])->name('employees.emergency-contacts.store');
        Route::put('employees/{employee}/emergency-contacts/{contact}', [EmployeeHrController::class, 'updateEmergencyContact'])->name('employees.emergency-contacts.update');
        Route::delete('employees/{employee}/emergency-contacts/{contact}', [EmployeeHrController::class, 'destroyEmergencyContact'])->name('employees.emergency-contacts.destroy');

        Route::post('employees/{employee}/documents', [EmployeeHrController::class, 'storeDocument'])->name('employees.documents.store');
        Route::put('employees/{employee}/documents/{document}', [EmployeeHrController::class, 'updateDocument'])->name('employees.documents.update');
        Route::delete('employees/{employee}/documents/{document}', [EmployeeHrController::class, 'destroyDocument'])->name('employees.documents.destroy');

        Route::post('employees/{employee}/educations', [EmployeeHrController::class, 'storeEducation'])->name('employees.educations.store');
        Route::put('employees/{employee}/educations/{education}', [EmployeeHrController::class, 'updateEducation'])->name('employees.educations.update');
        Route::delete('employees/{employee}/educations/{education}', [EmployeeHrController::class, 'destroyEducation'])->name('employees.educations.destroy');

        Route::post('employees/{employee}/experiences', [EmployeeHrController::class, 'storeExperience'])->name('employees.experiences.store');
        Route::put('employees/{employee}/experiences/{experience}', [EmployeeHrController::class, 'updateExperience'])->name('employees.experiences.update');
        Route::delete('employees/{employee}/experiences/{experience}', [EmployeeHrController::class, 'destroyExperience'])->name('employees.experiences.destroy');

        Route::post('employees/{employee}/dependents', [EmployeeHrController::class, 'storeDependent'])->name('employees.dependents.store');
        Route::put('employees/{employee}/dependents/{dependent}', [EmployeeHrController::class, 'updateDependent'])->name('employees.dependents.update');
        Route::delete('employees/{employee}/dependents/{dependent}', [EmployeeHrController::class, 'destroyDependent'])->name('employees.dependents.destroy');

        Route::post('employees/{employee}/assets', [EmployeeHrController::class, 'storeAsset'])->name('employees.assets.store');
        Route::put('employees/{employee}/assets/{asset}', [EmployeeHrController::class, 'updateAsset'])->name('employees.assets.update');
        Route::delete('employees/{employee}/assets/{asset}', [EmployeeHrController::class, 'destroyAsset'])->name('employees.assets.destroy');

        Route::post('employees/{employee}/lifecycle-tasks', [EmployeeHrController::class, 'storeLifecycleTask'])->name('employees.lifecycle-tasks.store');
        Route::put('employees/{employee}/lifecycle-tasks/{task}', [EmployeeHrController::class, 'updateLifecycleTask'])->name('employees.lifecycle-tasks.update');
        Route::post('employees/{employee}/lifecycle-tasks/{task}/complete', [EmployeeHrController::class, 'completeLifecycleTask'])->name('employees.lifecycle-tasks.complete');
        Route::delete('employees/{employee}/lifecycle-tasks/{task}', [EmployeeHrController::class, 'destroyLifecycleTask'])->name('employees.lifecycle-tasks.destroy');

        Route::post('employees/{employee}/notes', [EmployeeHrController::class, 'storeNote'])->name('employees.notes.store');
        Route::put('employees/{employee}/notes/{note}', [EmployeeHrController::class, 'updateNote'])->name('employees.notes.update');
        Route::delete('employees/{employee}/notes/{note}', [EmployeeHrController::class, 'destroyNote'])->name('employees.notes.destroy');

        Route::get('structures',            [PayrollController::class, 'structures'])->name('structures');
        Route::post('structures',           [PayrollController::class, 'storeStructure'])->name('structures.store');
        Route::put('structures/{structure}',[PayrollController::class, 'updateStructure'])->name('structures.update');
        Route::delete('structures/{structure}',[PayrollController::class, 'destroyStructure'])->name('structures.destroy');
        Route::get('process',               [PayrollController::class, 'process'])->name('process');
        Route::post('run',                  [PayrollController::class, 'runPayroll'])->name('run');
        Route::get('payslips',              [PayrollController::class, 'payslips'])->name('payslips');
        Route::get('payslips/{payslip}/pdf',[PayrollController::class, 'payslipPdf'])->name('payslips.pdf');
        Route::get('reports',               [PayrollController::class, 'reports'])->name('reports');

        // Departments
        Route::get('departments',            [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('departments',           [DepartmentController::class, 'store'])->name('departments.store');
        Route::put('departments/{department}',[DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('departments/{department}',[DepartmentController::class, 'destroy'])->name('departments.destroy');

        // Attendance
        Route::get('attendance',             [AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('attendance/mark',        [AttendanceController::class, 'mark'])->name('attendance.mark');
        Route::post('attendance/bulk',       [AttendanceController::class, 'saveBulk'])->name('attendance.bulk');
        Route::get('attendance/report',      [AttendanceController::class, 'report'])->name('attendance.report');

        // Leave Types
        Route::get('leave/types',            [LeaveController::class, 'types'])->name('leave.types');
        Route::post('leave/types',           [LeaveController::class, 'storeType'])->name('leave.types.store');
        Route::put('leave/types/{leaveType}',[LeaveController::class, 'updateType'])->name('leave.types.update');
        Route::delete('leave/types/{leaveType}',[LeaveController::class, 'destroyType'])->name('leave.types.destroy');

        // Leave Allocations
        Route::get('leave/allocations',      [LeaveController::class, 'allocations'])->name('leave.allocations');
        Route::post('leave/allocations',     [LeaveController::class, 'allocate'])->name('leave.allocations.store');
        Route::post('leave/allocations/bulk',[LeaveController::class, 'bulkAllocate'])->name('leave.allocations.bulk');

        // Leave Requests
        Route::get('leave',                  [LeaveController::class, 'index'])->name('leave.index');
        Route::get('leave/apply',            [LeaveController::class, 'apply'])->name('leave.apply');
        Route::post('leave',                 [LeaveController::class, 'store'])->name('leave.store');
        Route::get('leave/balance',          [LeaveController::class, 'balance'])->name('leave.balance');
        Route::post('leave/{leaveRequest}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
        Route::post('leave/{leaveRequest}/reject',  [LeaveController::class, 'reject'])->name('leave.reject');
        Route::post('leave/{leaveRequest}/cancel',  [LeaveController::class, 'cancel'])->name('leave.cancel');
    });

    /*
    |----------------------------------------------------------------------
    | TAX
    |----------------------------------------------------------------------
    */
    Route::prefix('tax')->name('tax.')->group(function () {
        Route::get('gst',      [TaxController::class, 'gst'])->name('gst');
        Route::get('tds',      [TaxController::class, 'tds'])->name('tds');
        Route::get('reports',  [TaxController::class, 'reports'])->name('reports');
        Route::get('settings', [TaxController::class, 'settings'])->name('settings');
        Route::post('rates',               [TaxController::class, 'store'])->name('rates.store');
        Route::put('rates/{taxRate}',      [TaxController::class, 'update'])->name('rates.update');
        Route::delete('rates/{taxRate}',   [TaxController::class, 'destroy'])->name('rates.destroy');
        Route::post('rates/{taxRate}/toggle', [TaxController::class, 'toggle'])->name('rates.toggle');
    });

    /*
    |----------------------------------------------------------------------
    | ASSETS
    |----------------------------------------------------------------------
    */
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/',                      [AssetController::class, 'index'])->name('index');
        Route::get('/create',                [AssetController::class, 'create'])->name('create');
        Route::get('/depreciation',          [AssetController::class, 'depreciation'])->name('depreciation');
        Route::get('/maintenance',           [AssetController::class, 'maintenance'])->name('maintenance');
        Route::post('/',                     [AssetController::class, 'store'])->name('store');
        Route::post('/run-depreciation',     [AssetController::class, 'runDepreciation'])->name('run-depreciation');
        Route::get('/{asset}',               [AssetController::class, 'show'])->name('show');
        Route::put('/{asset}',               [AssetController::class, 'update'])->name('update');
        Route::delete('/{asset}',            [AssetController::class, 'destroy'])->name('destroy');
    });

    /*
    |----------------------------------------------------------------------
    | VENDORS
    |----------------------------------------------------------------------
    */
    Route::prefix('vendors')->name('vendors.')->group(function () {
        Route::get('payments',  [VendorController::class, 'payments'])->name('payments');
        Route::resource('purchase-orders', PurchaseOrderController::class);
        Route::resource('/', VendorController::class)->parameters(['' => 'vendor']);
    });

    /*
    |----------------------------------------------------------------------
    | CUSTOMERS
    |----------------------------------------------------------------------
    */
    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/outstanding',             [CustomerController::class, 'outstanding'])->name('outstanding');
        Route::resource('/', CustomerController::class)->parameters(['' => 'customer']);
        Route::get('/{customer}/statement',    [CustomerController::class, 'statement'])->name('statement');
    });

    /*
    |----------------------------------------------------------------------
    | BUDGET
    |----------------------------------------------------------------------
    */
    Route::prefix('budget')->name('budget.')->group(function () {
        Route::get('/forecast',  [BudgetController::class, 'forecast'])->name('forecast');
        Route::get('/variance',  [BudgetController::class, 'variance'])->name('variance');
        Route::resource('/', BudgetController::class)->parameters(['' => 'budget']);
    });

    /*
    |----------------------------------------------------------------------
    | REPORTS
    |----------------------------------------------------------------------
    */
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/',             [ReportController::class, 'index'])->name('index');
        Route::get('/pnl',          [ReportController::class, 'pnl'])->name('pnl');
        Route::get('/balance-sheet',[ReportController::class, 'balanceSheet'])->name('balance-sheet');
        Route::get('/cash-flow',    [ReportController::class, 'cashFlow'])->name('cash-flow');
        Route::get('/financial',    [ReportController::class, 'financial'])->name('financial');
        Route::post('/export',      [ReportController::class, 'export'])->name('export');
    });

    /*
    |----------------------------------------------------------------------
    | AI ASSISTANT
    |----------------------------------------------------------------------
    */
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::get('/',          [AIAssistantController::class, 'index'])->name('index');
        Route::post('/chat',     [AIAssistantController::class, 'chat'])->name('chat');
        Route::post('/analyze',  [AIAssistantController::class, 'analyze'])->name('analyze');
        Route::post('/forecast', [AIAssistantController::class, 'forecast'])->name('forecast');
    });

    /*
    |----------------------------------------------------------------------
    | APPROVALS
    |----------------------------------------------------------------------
    */
    Route::prefix('approvals')->name('approvals.')->group(function () {
        Route::get('/',                       [ApprovalController::class, 'index'])->name('index');
        Route::post('/{approval}/approve',    [ApprovalController::class, 'approve'])->name('approve');
        Route::post('/{approval}/reject',     [ApprovalController::class, 'reject'])->name('reject');
    });

    /*
    |----------------------------------------------------------------------
    | COMPANIES (Super Admin)
    |----------------------------------------------------------------------
    */
    Route::resource('companies', CompanyController::class)->names('companies');

    /*
    |----------------------------------------------------------------------
    | SETTINGS
    |----------------------------------------------------------------------
    */
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/',              [SettingsController::class, 'general'])->name('general');
        Route::put('/',              [SettingsController::class, 'update'])->name('update');
        Route::resource('users',     UserController::class);
        Route::get('/permissions',                     [PermissionController::class, 'index'])->name('permissions');
        Route::post('/roles',                          [PermissionController::class, 'storeRole'])->name('roles.store');
        Route::put('/roles/{role}',                    [PermissionController::class, 'updateRole'])->name('roles.update');
        Route::delete('/roles/{role}',                 [PermissionController::class, 'destroyRole'])->name('roles.destroy');
        Route::put('/roles/{role}/permissions',        [PermissionController::class, 'syncPermissions'])->name('roles.sync-permissions');
        Route::put('/permissions/matrix',              [PermissionController::class, 'syncMatrix'])->name('permissions.sync-matrix');
        Route::put('/users/{user}/roles',              [PermissionController::class, 'syncUserRoles'])->name('users.sync-roles');
        Route::get('/notifications',  [SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications',  [SettingsController::class, 'updateNotifications'])->name('notifications.update');
        Route::get('/integrations',              [SettingsController::class, 'integrations'])->name('integrations');
        Route::put('/integrations/{key}',        [SettingsController::class, 'updateIntegration'])->name('integrations.update');
        Route::post('/integrations/{key}/test',  [SettingsController::class, 'testIntegration'])->name('integrations.test');
        Route::get('/audit',         [SettingsController::class, 'audit'])->name('audit');
        Route::get('/backup',        [SettingsController::class, 'backup'])->name('backup');
        Route::post('/backup/run',   [SettingsController::class, 'runBackup'])->name('backup.run');
    });
});
