<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use App\Models\AccountGroup;
use App\Models\Account;
use App\Models\TaxRate;
use App\Models\ExpenseCategory;
use App\Models\FiscalYear;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // ── COMPANY ───────────────────────────────────────────────────────────
        $company = Company::firstOrCreate(['slug' => 'ai-financial-services'], [
            'name'                 => 'AI Financial Services Ltd',
            'legal_name'           => 'AI Financial Services Private Limited',
            'slug'                 => 'ai-financial-services',
            'registration_number'  => 'MH-2020-1234567',
            'tax_id'               => '27AABCA1234Z1Z5',
            'pan_number'           => 'AABCA1234Z',
            'email'                => 'admin@aifms.com',
            'phone'                => '+91-22-1234-5678',
            'industry'             => 'Financial Services',
            'company_type'         => 'private_limited',
            'address_line1'        => '123, Business Tower, Bandra Kurla Complex',
            'city'                 => 'Mumbai',
            'state'                => 'Maharashtra',
            'country'              => 'India',
            'pincode'              => '400051',
            'currency'             => 'INR',
            'currency_symbol'      => '₹',
            'timezone'             => 'Asia/Kolkata',
            'financial_year_start' => '04',
            'gst_registered'       => true,
            'tds_applicable'       => true,
            'subscription_plan'    => 'enterprise',
            'invoice_prefix'       => 'INV',
            'invoice_sequence'     => 1,
            'is_active'            => true,
        ]);

        // ── BRANCHES ─────────────────────────────────────────────────────────
        $headOffice = Branch::firstOrCreate(
            ['company_id' => $company->id, 'code' => 'HO'],
            ['name' => 'Head Office - Mumbai', 'branch_type' => 'head_office', 'email' => 'ho@aifms.com', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'is_head_office' => true, 'is_active' => true]
        );

        Branch::firstOrCreate(['company_id' => $company->id, 'code' => 'DEL'], ['name' => 'Delhi Branch',     'city' => 'New Delhi', 'state' => 'Delhi',     'is_active' => true]);
        Branch::firstOrCreate(['company_id' => $company->id, 'code' => 'BLR'], ['name' => 'Bangalore Branch', 'city' => 'Bangalore', 'state' => 'Karnataka', 'is_active' => true]);

        // ── FISCAL YEAR ───────────────────────────────────────────────────────
        FiscalYear::firstOrCreate(
            ['company_id' => $company->id, 'name' => 'FY 2024-25'],
            ['start_date' => '2024-04-01', 'end_date' => '2025-03-31', 'status' => 'open', 'is_current' => true]
        );

        // ── SUPER ADMIN ───────────────────────────────────────────────────────
        $superAdmin = User::firstOrCreate(
            ['email' => 'super@aifms.com'],
            ['name' => 'Super Admin', 'password' => Hash::make('Admin@123'), 'company_id' => $company->id, 'branch_id' => $headOffice->id, 'is_active' => true]
        );
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }
        $company->update(['created_by' => $superAdmin->id]);

        // ── DEMO USERS ────────────────────────────────────────────────────────
        $users = [
            ['name' => 'John Smith',   'email' => 'owner@aifms.com',       'role' => 'company-owner'],
            ['name' => 'Priya Sharma', 'email' => 'finance@aifms.com',     'role' => 'finance-manager'],
            ['name' => 'Rahul Gupta',  'email' => 'accountant@aifms.com',  'role' => 'accountant'],
            ['name' => 'Anita Singh',  'email' => 'auditor@aifms.com',     'role' => 'auditor'],
            ['name' => 'Vikram Nair',  'email' => 'hr@aifms.com',          'role' => 'hr-manager'],
            ['name' => 'Meera Pillai', 'email' => 'employee@aifms.com',    'role' => 'employee'],
            ['name' => 'Arjun Patel',  'email' => 'analyst@aifms.com',     'role' => 'read-only-analyst'],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                ['name' => $u['name'], 'password' => Hash::make('Admin@123'), 'company_id' => $company->id, 'branch_id' => $headOffice->id, 'is_active' => true]
            );
            if (!$user->hasRole($u['role'])) {
                $user->assignRole($u['role']);
            }
        }

        // ── DEPARTMENTS ───────────────────────────────────────────────────────
        foreach (['Finance', 'Accounting', 'HR', 'IT', 'Operations', 'Marketing', 'Sales'] as $dept) {
            Department::firstOrCreate(
                ['company_id' => $company->id, 'name' => $dept],
                ['code' => strtoupper(substr($dept, 0, 3)), 'is_active' => true]
            );
        }

        $this->seedChartOfAccounts($company);
        $this->seedTaxRates($company);
        $this->seedExpenseCategories($company);

        $this->command->info("\n=== AI-FMS Seeded Successfully ===");
        $this->command->info("Super Admin:     super@aifms.com     / Admin@123");
        $this->command->info("Company Owner:   owner@aifms.com     / Admin@123");
        $this->command->info("Finance Manager: finance@aifms.com   / Admin@123");
        $this->command->info("Accountant:      accountant@aifms.com/ Admin@123");
    }

    private function seedChartOfAccounts(Company $company): void
    {
        $cid = $company->id;
        $groups = [
            ['name' => 'Current Assets',       'code' => '1000', 'type' => 'asset',     'nature' => 'debit'],
            ['name' => 'Fixed Assets',          'code' => '1500', 'type' => 'asset',     'nature' => 'debit'],
            ['name' => 'Current Liabilities',   'code' => '2000', 'type' => 'liability', 'nature' => 'credit'],
            ['name' => 'Long-term Liabilities', 'code' => '2500', 'type' => 'liability', 'nature' => 'credit'],
            ['name' => 'Equity',                'code' => '3000', 'type' => 'equity',    'nature' => 'credit'],
            ['name' => 'Revenue',               'code' => '4000', 'type' => 'income',    'nature' => 'credit'],
            ['name' => 'Cost of Revenue',       'code' => '5000', 'type' => 'expense',   'nature' => 'debit'],
            ['name' => 'Operating Expenses',    'code' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['name' => 'Finance Costs',         'code' => '7000', 'type' => 'expense',   'nature' => 'debit'],
            ['name' => 'Tax Expenses',          'code' => '8000', 'type' => 'expense',   'nature' => 'debit'],
        ];
        $groupMap = [];
        foreach ($groups as $g) {
            $group = AccountGroup::firstOrCreate(
                ['company_id' => $cid, 'code' => $g['code']],
                array_merge($g, ['is_system' => true])
            );
            $groupMap[$g['code']] = $group->id;
        }

        $accounts = [
            ['code' => '1001', 'name' => 'Cash in Hand',             'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_cash_account' => true],
            ['code' => '1002', 'name' => 'Bank - HDFC Current',      'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_bank_account' => true],
            ['code' => '1003', 'name' => 'Bank - SBI Savings',       'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_bank_account' => true],
            ['code' => '1100', 'name' => 'Accounts Receivable',      'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_reconcilable' => true],
            ['code' => '1400', 'name' => 'Input GST CGST',           'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_tax_account' => true],
            ['code' => '1401', 'name' => 'Input GST SGST',           'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_tax_account' => true],
            ['code' => '1402', 'name' => 'Input GST IGST',           'group' => '1000', 'type' => 'asset',     'nature' => 'debit',  'is_tax_account' => true],
            ['code' => '1500', 'name' => 'Office Equipment',         'group' => '1500', 'type' => 'asset',     'nature' => 'debit'],
            ['code' => '1501', 'name' => 'Computers & Servers',      'group' => '1500', 'type' => 'asset',     'nature' => 'debit'],
            ['code' => '1600', 'name' => 'Accumulated Depreciation', 'group' => '1500', 'type' => 'asset',     'nature' => 'credit'],
            ['code' => '2001', 'name' => 'Accounts Payable',         'group' => '2000', 'type' => 'liability', 'nature' => 'credit', 'is_reconcilable' => true],
            ['code' => '2100', 'name' => 'GST Payable CGST',        'group' => '2000', 'type' => 'liability', 'nature' => 'credit', 'is_tax_account' => true],
            ['code' => '2101', 'name' => 'GST Payable SGST',        'group' => '2000', 'type' => 'liability', 'nature' => 'credit', 'is_tax_account' => true],
            ['code' => '2102', 'name' => 'GST Payable IGST',        'group' => '2000', 'type' => 'liability', 'nature' => 'credit', 'is_tax_account' => true],
            ['code' => '2200', 'name' => 'TDS Payable',             'group' => '2000', 'type' => 'liability', 'nature' => 'credit', 'is_tax_account' => true],
            ['code' => '2300', 'name' => 'Salaries Payable',        'group' => '2000', 'type' => 'liability', 'nature' => 'credit'],
            ['code' => '2400', 'name' => 'PF Payable',              'group' => '2000', 'type' => 'liability', 'nature' => 'credit'],
            ['code' => '2500', 'name' => 'Bank Loan',               'group' => '2500', 'type' => 'liability', 'nature' => 'credit'],
            ['code' => '3001', 'name' => 'Share Capital',           'group' => '3000', 'type' => 'equity',    'nature' => 'credit'],
            ['code' => '3002', 'name' => 'Retained Earnings',       'group' => '3000', 'type' => 'equity',    'nature' => 'credit'],
            ['code' => '4001', 'name' => 'Service Revenue',         'group' => '4000', 'type' => 'income',    'nature' => 'credit'],
            ['code' => '4002', 'name' => 'Product Sales',           'group' => '4000', 'type' => 'income',    'nature' => 'credit'],
            ['code' => '4003', 'name' => 'Consulting Revenue',      'group' => '4000', 'type' => 'income',    'nature' => 'credit'],
            ['code' => '4900', 'name' => 'Other Income',            'group' => '4000', 'type' => 'income',    'nature' => 'credit'],
            ['code' => '5001', 'name' => 'Cost of Services',        'group' => '5000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6001', 'name' => 'Salaries & Wages',        'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6002', 'name' => 'Office Rent',             'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6003', 'name' => 'Utilities',               'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6004', 'name' => 'Travel & Transportation', 'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6005', 'name' => 'Marketing & Advertising', 'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6006', 'name' => 'Professional Fees',       'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6007', 'name' => 'Software & Technology',   'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6008', 'name' => 'Office Supplies',         'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '6009', 'name' => 'Depreciation Expense',    'group' => '6000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '7001', 'name' => 'Interest Expense',        'group' => '7000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '7002', 'name' => 'Bank Charges',            'group' => '7000', 'type' => 'expense',   'nature' => 'debit'],
            ['code' => '8001', 'name' => 'Income Tax Expense',      'group' => '8000', 'type' => 'expense',   'nature' => 'debit'],
        ];

        foreach ($accounts as $a) {
            Account::firstOrCreate(
                ['company_id' => $cid, 'code' => $a['code']],
                [
                    'account_group_id' => $groupMap[$a['group']],
                    'name'             => $a['name'],
                    'type'             => $a['type'],
                    'nature'           => $a['nature'],
                    'is_bank_account'  => $a['is_bank_account'] ?? false,
                    'is_cash_account'  => $a['is_cash_account'] ?? false,
                    'is_tax_account'   => $a['is_tax_account'] ?? false,
                    'is_reconcilable'  => $a['is_reconcilable'] ?? false,
                    'is_system'        => true,
                    'is_active'        => true,
                ]
            );
        }
    }

    private function seedTaxRates(Company $company): void
    {
        $rates = [
            ['name' => 'GST 0%',  'type' => 'gst', 'rate' => 0,  'components' => []],
            ['name' => 'GST 5%',  'type' => 'gst', 'rate' => 5,  'components' => ['cgst' => 2.5, 'sgst' => 2.5, 'igst' => 5]],
            ['name' => 'GST 12%', 'type' => 'gst', 'rate' => 12, 'components' => ['cgst' => 6,   'sgst' => 6,   'igst' => 12]],
            ['name' => 'GST 18%', 'type' => 'gst', 'rate' => 18, 'components' => ['cgst' => 9,   'sgst' => 9,   'igst' => 18]],
            ['name' => 'GST 28%', 'type' => 'gst', 'rate' => 28, 'components' => ['cgst' => 14,  'sgst' => 14,  'igst' => 28]],
            ['name' => 'TDS 1%',  'type' => 'tds', 'rate' => 1,  'components' => []],
            ['name' => 'TDS 2%',  'type' => 'tds', 'rate' => 2,  'components' => []],
            ['name' => 'TDS 10%', 'type' => 'tds', 'rate' => 10, 'components' => []],
        ];

        foreach ($rates as $r) {
            TaxRate::firstOrCreate(
                ['company_id' => $company->id, 'name' => $r['name']],
                array_merge($r, ['is_active' => true])
            );
        }
    }

    private function seedExpenseCategories(Company $company): void
    {
        $cats = [
            ['name' => 'Travel',         'color' => '#3b82f6'],
            ['name' => 'Accommodation',  'color' => '#8b5cf6'],
            ['name' => 'Meals & Dining', 'color' => '#f59e0b'],
            ['name' => 'Office Supplies','color' => '#10b981'],
            ['name' => 'Software',       'color' => '#6366f1'],
            ['name' => 'Training',       'color' => '#ec4899'],
            ['name' => 'Marketing',      'color' => '#f43f5e'],
            ['name' => 'Miscellaneous',  'color' => '#94a3b8'],
        ];

        foreach ($cats as $c) {
            ExpenseCategory::firstOrCreate(
                ['company_id' => $company->id, 'name' => $c['name']],
                array_merge($c, ['is_active' => true])
            );
        }
    }
}
