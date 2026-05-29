<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Company;
use App\Models\Account;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use App\Models\Employee;
use App\Models\Department;
use App\Models\SalaryStructure;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Budget;
use App\Models\BudgetLine;
use App\Models\Journal;
use App\Models\JournalLine;
use App\Models\FiscalYear;
use App\Models\TaxRate;
use App\Models\User;

class DemoDataSeeder extends Seeder
{
    private Company $company;
    private FiscalYear $fiscalYear;
    private array $accounts = [];
    private array $taxRates = [];
    private User $adminUser;

    public function run(): void
    {
        $this->company    = Company::where('slug', 'ai-financial-services')->firstOrFail();
        $this->fiscalYear = FiscalYear::where('company_id', $this->company->id)->where('is_current', true)->firstOrFail();
        $this->adminUser  = User::where('company_id', $this->company->id)->first();

        foreach (Account::where('company_id', $this->company->id)->get() as $acc) {
            $this->accounts[$acc->code] = $acc;
        }
        foreach (TaxRate::where('company_id', $this->company->id)->get() as $tr) {
            $this->taxRates[$tr->name] = $tr;
        }

        $this->command->info('Seeding customers...');
        $customers = $this->seedCustomers();

        $this->command->info('Seeding vendors...');
        $vendors = $this->seedVendors();

        $this->command->info('Seeding bank accounts...');
        $bankAccounts = $this->seedBankAccounts();

        $this->command->info('Seeding invoices...');
        $this->seedInvoices($customers, $vendors);

        $this->command->info('Seeding expenses...');
        $this->seedExpenses($vendors);

        $this->command->info('Seeding bank transactions...');
        $this->seedBankTransactions($bankAccounts);

        $this->command->info('Seeding employees & payroll...');
        $this->seedPayroll();

        $this->command->info('Seeding assets...');
        $this->seedAssets();

        $this->command->info('Seeding budgets...');
        $this->seedBudgets();

        $this->command->info('Seeding journal entries...');
        $this->seedJournals();

        $this->command->info('✅ Demo data seeded successfully!');
    }

    // ─────────────────────────────────────────────────────────────
    // CUSTOMERS
    // ─────────────────────────────────────────────────────────────
    private function seedCustomers(): array
    {
        $data = [
            ['name' => 'Reliance Industries Ltd',   'company_name' => 'Reliance Industries Limited',  'email' => 'accounts@reliance.com',  'phone' => '022-22780000', 'gst_number' => '27AAACR5055K1ZP', 'pan_number' => 'AAACR5055K', 'billing_city' => 'Mumbai',    'billing_state' => 'Maharashtra', 'customer_type' => 'company',    'credit_limit' => 5000000, 'credit_days' => 45, 'outstanding_balance' => 185000],
            ['name' => 'Tata Consultancy Services', 'company_name' => 'TCS Limited',                  'email' => 'billing@tcs.com',         'phone' => '022-67789999', 'gst_number' => '27AAACT2727Q1ZW', 'pan_number' => 'AAACT2727Q', 'billing_city' => 'Mumbai',    'billing_state' => 'Maharashtra', 'customer_type' => 'company',    'credit_limit' => 3000000, 'credit_days' => 30, 'outstanding_balance' => 320000],
            ['name' => 'Infosys Limited',            'company_name' => 'Infosys Ltd',                  'email' => 'finance@infosys.com',     'phone' => '080-28520261', 'gst_number' => '29AABCI1681B1ZN', 'pan_number' => 'AABCI1681B', 'billing_city' => 'Bangalore', 'billing_state' => 'Karnataka',   'customer_type' => 'company',    'credit_limit' => 2000000, 'credit_days' => 30, 'outstanding_balance' => 95000],
            ['name' => 'Wipro Limited',              'company_name' => 'Wipro Ltd',                    'email' => 'accounts@wipro.com',      'phone' => '080-28440011', 'gst_number' => '29AAACW0456F1ZK', 'pan_number' => 'AAACW0456F', 'billing_city' => 'Bangalore', 'billing_state' => 'Karnataka',   'customer_type' => 'company',    'credit_limit' => 1500000, 'credit_days' => 45, 'outstanding_balance' => 0],
            ['name' => 'HDFC Bank Limited',          'company_name' => 'HDFC Bank Ltd',               'email' => 'vendor@hdfcbank.com',     'phone' => '022-67606161', 'gst_number' => '27AAAAH0148L1ZX', 'pan_number' => 'AAAAH0148L', 'billing_city' => 'Mumbai',    'billing_state' => 'Maharashtra', 'customer_type' => 'company',    'credit_limit' => 10000000,'credit_days' => 15, 'outstanding_balance' => 750000],
            ['name' => 'Mahindra & Mahindra',        'company_name' => 'M&M Limited',                  'email' => 'payments@mahindra.com',   'phone' => '022-24901441', 'gst_number' => '27AABCM1852P1ZL', 'pan_number' => 'AABCM1852P', 'billing_city' => 'Mumbai',    'billing_state' => 'Maharashtra', 'customer_type' => 'company',    'credit_limit' => 2500000, 'credit_days' => 30, 'outstanding_balance' => 210000],
            ['name' => 'Rajesh Kumar Sharma',        'company_name' => null,                           'email' => 'rajesh.sharma@gmail.com', 'phone' => '9876543210',   'gst_number' => null,               'pan_number' => 'BCPPS1234D',  'billing_city' => 'Delhi',     'billing_state' => 'Delhi',       'customer_type' => 'individual', 'credit_limit' => 100000,  'credit_days' => 30, 'outstanding_balance' => 12500],
            ['name' => 'Priya Enterprises',          'company_name' => 'Priya Trading Co.',           'email' => 'priya@priyaent.com',      'phone' => '9988776655',   'gst_number' => '06AABCP3456K1ZQ', 'pan_number' => 'AABCP3456K',  'billing_city' => 'Gurugram',  'billing_state' => 'Haryana',     'customer_type' => 'company',    'credit_limit' => 500000,  'credit_days' => 30, 'outstanding_balance' => 45000],
        ];

        $customers = [];
        foreach ($data as $i => $row) {
            $customers[] = Customer::firstOrCreate(
                ['company_id' => $this->company->id, 'email' => $row['email']],
                array_merge($row, [
                    'company_id'    => $this->company->id,
                    'customer_code' => 'CUST-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'currency'      => 'INR',
                    'is_active'     => true,
                    'status'        => 'active',
                    'created_by'    => $this->adminUser->id,
                ])
            );
        }
        return $customers;
    }

    // ─────────────────────────────────────────────────────────────
    // VENDORS
    // ─────────────────────────────────────────────────────────────
    private function seedVendors(): array
    {
        $data = [
            ['name' => 'Microsoft India',         'email' => 'billing@microsoft.in',     'phone' => '1800-102-1100', 'gst_number' => '29AABCM6519Q1ZJ', 'city' => 'Hyderabad', 'state' => 'Telangana',   'vendor_type' => 'service_provider', 'payment_days' => 30, 'outstanding_balance' => 45000,  'tds_applicable' => true,  'tds_rate' => 2],
            ['name' => 'Google Cloud India',      'email' => 'invoices@google.com',       'phone' => '1800-419-0150', 'gst_number' => '29AABCG0434M1ZD', 'city' => 'Bangalore', 'state' => 'Karnataka',   'vendor_type' => 'service_provider', 'payment_days' => 30, 'outstanding_balance' => 38000,  'tds_applicable' => true,  'tds_rate' => 2],
            ['name' => 'Amazon Web Services',     'email' => 'aws-billing@amazon.com',    'phone' => '1800-572-1842', 'gst_number' => '29AABCA4268J1ZM', 'city' => 'Mumbai',    'state' => 'Maharashtra', 'vendor_type' => 'service_provider', 'payment_days' => 30, 'outstanding_balance' => 22000,  'tds_applicable' => true,  'tds_rate' => 2],
            ['name' => 'Zoho Corporation',        'email' => 'billing@zoho.com',          'phone' => '044-67447070',  'gst_number' => '33AAACZ2329H1ZB', 'city' => 'Chennai',   'state' => 'Tamil Nadu',  'vendor_type' => 'service_provider', 'payment_days' => 15, 'outstanding_balance' => 8500,   'tds_applicable' => false, 'tds_rate' => 0],
            ['name' => 'Reliance Jio Infocomm',   'email' => 'enterprise@jio.com',        'phone' => '022-33339999',  'gst_number' => '27AABCR5055K1ZA', 'city' => 'Mumbai',    'state' => 'Maharashtra', 'vendor_type' => 'supplier',         'payment_days' => 30, 'outstanding_balance' => 12000,  'tds_applicable' => false, 'tds_rate' => 0],
            ['name' => 'Sharma & Associates',     'email' => 'ca@sharmaassoc.com',        'phone' => '9988001122',    'gst_number' => '07BBBPS1234A1ZW', 'city' => 'Delhi',     'state' => 'Delhi',       'vendor_type' => 'contractor',       'payment_days' => 30, 'outstanding_balance' => 55000,  'tds_applicable' => true,  'tds_rate' => 10],
            ['name' => 'Quick Clean Services',    'email' => 'accounts@quickclean.in',    'phone' => '9876001234',    'gst_number' => '27AADCQ1234E1ZP', 'city' => 'Mumbai',    'state' => 'Maharashtra', 'vendor_type' => 'service_provider', 'payment_days' => 15, 'outstanding_balance' => 5000,   'tds_applicable' => false, 'tds_rate' => 0],
            ['name' => 'HP India Sales Pvt Ltd',  'email' => 'hpindia-billing@hp.com',    'phone' => '044-22545678',  'gst_number' => '33AAACH0456P1ZE', 'city' => 'Chennai',   'state' => 'Tamil Nadu',  'vendor_type' => 'supplier',         'payment_days' => 45, 'outstanding_balance' => 128000, 'tds_applicable' => true,  'tds_rate' => 1],
        ];

        $vendors = [];
        foreach ($data as $i => $row) {
            $vendors[] = Vendor::firstOrCreate(
                ['company_id' => $this->company->id, 'email' => $row['email']],
                array_merge($row, [
                    'company_id'  => $this->company->id,
                    'vendor_code' => 'VND-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'currency'    => 'INR',
                    'is_active'   => true,
                    'created_by'  => $this->adminUser->id,
                ])
            );
        }
        return $vendors;
    }

    // ─────────────────────────────────────────────────────────────
    // BANK ACCOUNTS
    // ─────────────────────────────────────────────────────────────
    private function seedBankAccounts(): array
    {
        $data = [
            ['account_name' => 'HDFC Current Account',  'bank_name' => 'HDFC Bank',  'account_number' => '50200012345678', 'account_type' => 'current',  'ifsc_code' => 'HDFC0001234', 'branch_name' => 'BKC Branch',      'opening_balance' => 2500000, 'current_balance' => 3187450],
            ['account_name' => 'SBI Savings Account',   'bank_name' => 'SBI',        'account_number' => '33456789012345', 'account_type' => 'savings',  'ifsc_code' => 'SBIN0001234', 'branch_name' => 'Fort Branch',     'opening_balance' => 500000,  'current_balance' => 687320],
            ['account_name' => 'Axis Bank OD Account',  'bank_name' => 'Axis Bank',  'account_number' => '91234567890123', 'account_type' => 'current',  'ifsc_code' => 'UTIB0000123', 'branch_name' => 'Andheri Branch',  'opening_balance' => 1000000, 'current_balance' => 945200],
            ['account_name' => 'Petty Cash',             'bank_name' => 'Cash',       'account_number' => '0000000000',     'account_type' => 'cash',     'ifsc_code' => null,          'branch_name' => 'Head Office',     'opening_balance' => 50000,   'current_balance' => 24500],
        ];

        $accounts = [];
        foreach ($data as $row) {
            $accounts[] = BankAccount::firstOrCreate(
                ['company_id' => $this->company->id, 'account_number' => $row['account_number']],
                array_merge($row, [
                    'company_id' => $this->company->id,
                    'currency'   => 'INR',
                    'is_active'  => true,
                    'is_default' => $row['account_name'] === 'HDFC Current Account',
                ])
            );
        }
        return $accounts;
    }

    // ─────────────────────────────────────────────────────────────
    // INVOICES
    // ─────────────────────────────────────────────────────────────
    private function seedInvoices(array $customers, array $vendors): void
    {
        $gst18 = $this->taxRates['GST 18%'] ?? null;
        $gst12 = $this->taxRates['GST 12%'] ?? null;

        $salesData = [
            ['customer' => 0, 'items' => [['Financial Analytics Platform License', 150000, 1, 18], ['Implementation Support', 25000, 2, 18]], 'date' => '-60 days', 'status' => 'paid'],
            ['customer' => 1, 'items' => [['AI-Powered ERP Integration',          250000, 1, 18], ['Training & Onboarding',    15000, 5, 18]], 'date' => '-45 days', 'status' => 'paid'],
            ['customer' => 2, 'items' => [['Annual SaaS Subscription',            120000, 1, 18]], 'date' => '-30 days', 'status' => 'partial'],
            ['customer' => 3, 'items' => [['Consulting Services - Q4',             80000, 1, 18]], 'date' => '-20 days', 'status' => 'sent'],
            ['customer' => 4, 'items' => [['Custom Module Development',           350000, 1, 18], ['API Integration',          45000, 1, 18]], 'date' => '-10 days', 'status' => 'sent'],
            ['customer' => 5, 'items' => [['Data Migration Services',              95000, 1, 18]], 'date' => '-5 days',  'status' => 'draft'],
            ['customer' => 0, 'items' => [['Quarterly Maintenance Contract',       55000, 1, 18]], 'date' => '-90 days', 'status' => 'paid'],
            ['customer' => 1, 'items' => [['Cloud Migration Project Phase 1',     180000, 1, 18]], 'date' => '-75 days', 'status' => 'paid'],
        ];

        foreach ($salesData as $i => $sale) {
            $customer = $customers[$sale['customer']];
            $invoiceDate = Carbon::now()->modify($sale['date']);
            $dueDate     = $invoiceDate->copy()->addDays(30);

            [$subtotal, $taxAmount, $grandTotal] = $this->calcTotals($sale['items']);

            $paidAmount = match ($sale['status']) {
                'paid'    => $grandTotal,
                'partial' => round($grandTotal * 0.4, 2),
                default   => 0,
            };

            Invoice::firstOrCreate(
                ['company_id' => $this->company->id, 'invoice_number' => 'INV-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT)],
                [
                    'company_id'      => $this->company->id,
                    'fiscal_year_id'  => $this->fiscalYear->id,
                    'invoice_number'  => 'INV-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                    'type'            => 'sales',
                    'party_type'      => 'customer',
                    'party_id'        => $customer->id,
                    'invoice_date'    => $invoiceDate->toDateString(),
                    'due_date'        => $dueDate->toDateString(),
                    'currency'        => 'INR',
                    'subtotal'        => $subtotal,
                    'taxable_amount'  => $subtotal,
                    'tax_amount'      => $taxAmount,
                    'cgst_amount'     => $taxAmount / 2,
                    'sgst_amount'     => $taxAmount / 2,
                    'grand_total'     => $grandTotal,
                    'paid_amount'     => $paidAmount,
                    'balance_due'     => $grandTotal - $paidAmount,
                    'status'          => $sale['status'],
                    'payment_status'  => $sale['status'] === 'paid' ? 'paid' : ($paidAmount > 0 ? 'partial' : 'unpaid'),
                    'created_by'      => $this->adminUser->id,
                ]
            );
        }

        // Purchase invoices (bills)
        $purchaseData = [
            ['vendor' => 0, 'items' => [['Microsoft 365 Business Premium',  2500, 20, 18]], 'date' => '-55 days', 'status' => 'paid'],
            ['vendor' => 1, 'items' => [['Google Workspace Enterprise',      4200, 15, 18]], 'date' => '-40 days', 'status' => 'paid'],
            ['vendor' => 2, 'items' => [['AWS EC2 & S3 Usage',              35000,  1, 18]], 'date' => '-25 days', 'status' => 'partial'],
            ['vendor' => 5, 'items' => [['CA Services - Audit FY 2024-25',  85000,  1, 18]], 'date' => '-15 days', 'status' => 'sent'],
            ['vendor' => 7, 'items' => [['Laptop - HP EliteBook 840 G10',   95000,  2, 12]], 'date' => '-7 days',  'status' => 'draft'],
        ];

        foreach ($purchaseData as $i => $purchase) {
            $vendor = $vendors[$purchase['vendor']];
            $invoiceDate = Carbon::now()->modify($purchase['date']);
            $dueDate     = $invoiceDate->copy()->addDays(30);

            [$subtotal, $taxAmount, $grandTotal] = $this->calcTotals($purchase['items']);

            $paidAmount = match ($purchase['status']) {
                'paid'    => $grandTotal,
                'partial' => round($grandTotal * 0.5, 2),
                default   => 0,
            };

            Invoice::firstOrCreate(
                ['company_id' => $this->company->id, 'invoice_number' => 'BILL-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT)],
                [
                    'company_id'     => $this->company->id,
                    'fiscal_year_id' => $this->fiscalYear->id,
                    'invoice_number' => 'BILL-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                    'type'           => 'purchase',
                    'party_type'     => 'vendor',
                    'party_id'       => $vendor->id,
                    'invoice_date'   => $invoiceDate->toDateString(),
                    'due_date'       => $dueDate->toDateString(),
                    'currency'       => 'INR',
                    'subtotal'       => $subtotal,
                    'taxable_amount' => $subtotal,
                    'tax_amount'     => $taxAmount,
                    'cgst_amount'    => $taxAmount / 2,
                    'sgst_amount'    => $taxAmount / 2,
                    'grand_total'    => $grandTotal,
                    'paid_amount'    => $paidAmount,
                    'balance_due'    => $grandTotal - $paidAmount,
                    'status'         => $purchase['status'],
                    'payment_status' => $purchase['status'] === 'paid' ? 'paid' : ($paidAmount > 0 ? 'partial' : 'unpaid'),
                    'created_by'     => $this->adminUser->id,
                ]
            );
        }
    }

    private function calcTotals(array $items): array
    {
        $subtotal   = 0;
        $taxAmount  = 0;
        foreach ($items as [$name, $price, $qty, $taxPct]) {
            $base = $price * $qty;
            $subtotal  += $base;
            $taxAmount += round($base * $taxPct / 100, 2);
        }
        return [$subtotal, $taxAmount, $subtotal + $taxAmount];
    }

    // ─────────────────────────────────────────────────────────────
    // EXPENSES
    // ─────────────────────────────────────────────────────────────
    private function seedExpenses(array $vendors): void
    {
        $categories = ExpenseCategory::where('company_id', $this->company->id)
            ->pluck('id', 'name');

        $data = [
            ['description' => 'Flight tickets - Mumbai to Delhi (BD conference)',           'amount' => 18500, 'tax' => 1665, 'cat' => 'Travel',         'date' => '-35 days', 'status' => 'approved',   'method' => 'card'],
            ['description' => 'Hotel stay - The Oberoi Delhi (3 nights)',                  'amount' => 24000, 'tax' => 2160, 'cat' => 'Accommodation',  'date' => '-34 days', 'status' => 'approved',   'method' => 'card'],
            ['description' => 'Team lunch - Toit Brewpub Bangalore',                       'amount' => 4200,  'tax' => 504,  'cat' => 'Meals & Dining', 'date' => '-28 days', 'status' => 'approved',   'method' => 'cash'],
            ['description' => 'Office stationery - pens, notebooks, folders',             'amount' => 2800,  'tax' => 252,  'cat' => 'Office Supplies', 'date' => '-20 days', 'status' => 'submitted',  'method' => 'cash'],
            ['description' => 'Figma Professional plan - annual subscription',            'amount' => 12000, 'tax' => 2160, 'cat' => 'Software',       'date' => '-15 days', 'status' => 'approved',   'method' => 'card'],
            ['description' => 'React & TypeScript advanced training - Udemy',             'amount' => 3500,  'tax' => 630,  'cat' => 'Training',       'date' => '-10 days', 'status' => 'submitted',  'method' => 'card'],
            ['description' => 'Google Ads campaign - Q4 brand awareness',                 'amount' => 45000, 'tax' => 8100, 'cat' => 'Marketing',      'date' => '-8 days',  'status' => 'approved',   'method' => 'bank'],
            ['description' => 'Cab rides - office to airport (multiple trips)',            'amount' => 6500,  'tax' => 0,    'cat' => 'Travel',         'date' => '-5 days',  'status' => 'draft',      'method' => 'cash'],
            ['description' => 'Miscellaneous office repairs',                              'amount' => 8500,  'tax' => 1530, 'cat' => 'Miscellaneous',  'date' => '-3 days',  'status' => 'draft',      'method' => 'cash'],
            ['description' => 'LinkedIn Recruiter subscription - 1 month',               'amount' => 28000, 'tax' => 5040, 'cat' => 'Software',       'date' => '-2 days',  'status' => 'submitted',  'method' => 'card'],
        ];

        foreach ($data as $i => $row) {
            $cat = $categories[$row['cat']] ?? null;
            Expense::firstOrCreate(
                ['company_id' => $this->company->id, 'expense_number' => 'EXP-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT)],
                [
                    'company_id'     => $this->company->id,
                    'expense_number' => 'EXP-2024-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                    'category_id'    => $cat,
                    'employee_id'    => $this->adminUser->id,
                    'expense_date'   => Carbon::now()->modify($row['date'])->toDateString(),
                    'description'    => $row['description'],
                    'amount'         => $row['amount'],
                    'tax_amount'     => $row['tax'],
                    'total_amount'   => $row['amount'] + $row['tax'],
                    'payment_method' => $row['method'],
                    'status'         => $row['status'],
                    'created_by'     => $this->adminUser->id,
                ]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    // BANK TRANSACTIONS
    // ─────────────────────────────────────────────────────────────
    private function seedBankTransactions(array $bankAccounts): void
    {
        $hdfcAccount = $bankAccounts[0];

        $transactions = [
            ['date' => '-58 days', 'type' => 'credit', 'amount' => 177000,  'desc' => 'INV-2024-00001 payment - Reliance Industries',    'ref' => 'NEFT/2024001/REL'],
            ['date' => '-50 days', 'type' => 'debit',  'amount' => 50000,   'desc' => 'Advance salary payment - October',                'ref' => 'NEFT/2024002/SAL'],
            ['date' => '-43 days', 'type' => 'credit', 'amount' => 295000,  'desc' => 'INV-2024-00002 payment - TCS',                    'ref' => 'RTGS/2024003/TCS'],
            ['date' => '-38 days', 'type' => 'debit',  'amount' => 59000,   'desc' => 'Microsoft India - Bill payment',                  'ref' => 'NEFT/2024004/MS'],
            ['date' => '-30 days', 'type' => 'credit', 'amount' => 48000,   'desc' => 'INV-2024-00003 partial - Infosys',                'ref' => 'IMPS/2024005/INFY'],
            ['date' => '-28 days', 'type' => 'debit',  'amount' => 350000,  'desc' => 'Salary disbursement - October 2024',              'ref' => 'NEFT/2024006/PAYROLL'],
            ['date' => '-25 days', 'type' => 'debit',  'amount' => 41300,   'desc' => 'AWS invoice payment',                             'ref' => 'NEFT/2024007/AWS'],
            ['date' => '-22 days', 'type' => 'credit', 'amount' => 1200000, 'desc' => 'HDFC Bank - Project advance',                     'ref' => 'RTGS/2024008/HDFC'],
            ['date' => '-18 days', 'type' => 'debit',  'amount' => 45000,   'desc' => 'Google Ads payment',                              'ref' => 'NEFT/2024009/GADS'],
            ['date' => '-15 days', 'type' => 'debit',  'amount' => 28000,   'desc' => 'Office rent - November 2024',                     'ref' => 'NEFT/2024010/RENT'],
            ['date' => '-10 days', 'type' => 'credit', 'amount' => 85000,   'desc' => 'INV-2024-00007 payment - Reliance Q2',            'ref' => 'IMPS/2024011/REL'],
            ['date' => '-7 days',  'type' => 'debit',  'amount' => 350000,  'desc' => 'Salary disbursement - November 2024',             'ref' => 'NEFT/2024012/PAYROLL'],
            ['date' => '-4 days',  'type' => 'credit', 'amount' => 212400,  'desc' => 'INV-2024-00008 payment - TCS Phase 1',            'ref' => 'RTGS/2024013/TCS'],
            ['date' => '-2 days',  'type' => 'debit',  'amount' => 5000,    'desc' => 'Bank charges - November',                         'ref' => 'CHG/2024014'],
            ['date' => '-1 days',  'type' => 'credit', 'amount' => 15000,   'desc' => 'Interest income - FD',                            'ref' => 'INT/2024015'],
        ];

        foreach ($transactions as $txn) {
            if (!BankTransaction::where('company_id', $this->company->id)->where('reference_number', $txn['ref'])->exists()) {
                BankTransaction::create([
                    'company_id'       => $this->company->id,
                    'bank_account_id'  => $hdfcAccount->id,
                    'transaction_date' => Carbon::now()->modify($txn['date'])->toDateString(),
                    'transaction_type' => $txn['type'],
                    'amount'           => $txn['amount'],
                    'description'      => $txn['desc'],
                    'reference_number' => $txn['ref'],
                    'payment_mode'     => str_contains($txn['ref'], 'RTGS') ? 'rtgs' : (str_contains($txn['ref'], 'IMPS') ? 'imps' : 'neft'),
                    'is_reconciled'    => Carbon::now()->modify($txn['date'])->diffInDays() > 14,
                    'source'           => 'manual',
                    'created_by'       => $this->adminUser->id,
                ]);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // PAYROLL
    // ─────────────────────────────────────────────────────────────
    private function seedPayroll(): void
    {
        $structure = SalaryStructure::firstOrCreate(
            ['company_id' => $this->company->id, 'name' => 'Standard Monthly'],
            [
                'company_id'    => $this->company->id,
                'pay_frequency' => 'monthly',
                'components'    => [
                    'earnings'   => [['name' => 'Basic', 'percent' => 50], ['name' => 'HRA', 'percent' => 20], ['name' => 'DA', 'percent' => 10], ['name' => 'Special Allowance', 'percent' => 20]],
                    'deductions' => [['name' => 'PF', 'percent' => 12], ['name' => 'Professional Tax', 'flat' => 200]],
                ],
                'is_active' => true,
            ]
        );

        $departments = Department::where('company_id', $this->company->id)->pluck('id', 'name');

        $empData = [
            ['first_name' => 'Aryan',    'last_name' => 'Mehta',    'code' => 'EMP001', 'dept' => 'Finance',     'designation' => 'Finance Manager',        'salary' => 85000,  'join' => '2022-04-01'],
            ['first_name' => 'Sneha',    'last_name' => 'Patil',    'code' => 'EMP002', 'dept' => 'Accounting',  'designation' => 'Senior Accountant',      'salary' => 65000,  'join' => '2022-06-15'],
            ['first_name' => 'Rahul',    'last_name' => 'Desai',    'code' => 'EMP003', 'dept' => 'IT',          'designation' => 'Software Engineer',      'salary' => 75000,  'join' => '2023-01-10'],
            ['first_name' => 'Kavita',   'last_name' => 'Joshi',    'code' => 'EMP004', 'dept' => 'HR',          'designation' => 'HR Manager',             'salary' => 60000,  'join' => '2021-08-01'],
            ['first_name' => 'Vikram',   'last_name' => 'Singh',    'code' => 'EMP005', 'dept' => 'Operations',  'designation' => 'Operations Executive',   'salary' => 45000,  'join' => '2023-03-15'],
            ['first_name' => 'Priya',    'last_name' => 'Nair',     'code' => 'EMP006', 'dept' => 'Marketing',   'designation' => 'Marketing Specialist',   'salary' => 55000,  'join' => '2022-11-01'],
            ['first_name' => 'Rohan',    'last_name' => 'Kumar',    'code' => 'EMP007', 'dept' => 'Sales',       'designation' => 'Sales Executive',        'salary' => 50000,  'join' => '2023-07-01'],
            ['first_name' => 'Ananya',   'last_name' => 'Sharma',   'code' => 'EMP008', 'dept' => 'IT',          'designation' => 'UI/UX Designer',         'salary' => 70000,  'join' => '2022-09-20'],
            ['first_name' => 'Deepak',   'last_name' => 'Verma',    'code' => 'EMP009', 'dept' => 'Finance',     'designation' => 'Financial Analyst',      'salary' => 72000,  'join' => '2021-05-12'],
            ['first_name' => 'Meera',    'last_name' => 'Pillai',   'code' => 'EMP010', 'dept' => 'Accounting',  'designation' => 'Junior Accountant',      'salary' => 40000,  'join' => '2024-01-15'],
        ];

        $employees = [];
        foreach ($empData as $emp) {
            $deptId = $departments[$emp['dept']] ?? null;
            $grossSalary = $emp['salary'];
            $hra         = round($grossSalary * 0.2, 2);
            $pf          = round($grossSalary * 0.12, 2);
            $netSalary   = $grossSalary - $pf - 200;

            $employees[] = Employee::firstOrCreate(
                ['company_id' => $this->company->id, 'employee_code' => $emp['code']],
                [
                    'company_id'           => $this->company->id,
                    'employee_code'        => $emp['code'],
                    'first_name'           => $emp['first_name'],
                    'last_name'            => $emp['last_name'],
                    'email'                => strtolower($emp['first_name'] . '.' . $emp['last_name']) . '@aifms.com',
                    'phone'                => '98' . rand(10000000, 99999999),
                    'department_id'        => $deptId,
                    'designation'          => $emp['designation'],
                    'date_of_joining'      => $emp['join'],
                    'salary_structure_id'  => $structure->id,
                    'basic_salary'         => round($grossSalary * 0.5, 2),
                    'hra'                  => $hra,
                    'gross_salary'         => $grossSalary,
                    'net_salary'           => $netSalary,
                    'pf_applicable'        => true,
                    'employment_type'      => 'full_time',
                    'status'               => 'active',
                ]
            );
        }

        // Seed 3 months of payroll runs
        $months = ['2024-09', '2024-10', '2024-11'];
        foreach ($months as $month) {
            $monthCarbon = Carbon::parse($month . '-01');

            $run = PayrollRun::firstOrCreate(
                ['company_id' => $this->company->id, 'month' => $month],
                [
                    'company_id'       => $this->company->id,
                    'run_number'       => 'PR-' . str_replace('-', '', $month) . '-001',
                    'month'            => $month,
                    'pay_period_start' => $monthCarbon->startOfMonth()->toDateString(),
                    'pay_period_end'   => $monthCarbon->copy()->endOfMonth()->toDateString(),
                    'payment_date'     => $monthCarbon->copy()->endOfMonth()->toDateString(),
                    'status'           => 'completed',
                    'created_by'       => $this->adminUser->id,
                    'total_gross'      => 0,
                    'total_net'        => 0,
                    'total_deductions' => 0,
                    'employee_count'   => count($employees),
                ]
            );

            $totalGross = 0;
            $totalNet   = 0;
            foreach ($employees as $i => $employee) {
                $gross     = (float) $employee->gross_salary;
                $pf        = round($gross * 0.12, 2);
                $pt        = 200;
                $deductions = $pf + $pt;
                $net        = $gross - $deductions;
                $totalGross += $gross;
                $totalNet   += $net;

                Payslip::firstOrCreate(
                    ['payroll_run_id' => $run->id, 'employee_id' => $employee->id],
                    [
                        'payroll_run_id'   => $run->id,
                        'employee_id'      => $employee->id,
                        'company_id'       => $this->company->id,
                        'payslip_number'   => 'PS-' . $month . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                        'month'            => $month,
                        'pay_period_start' => $monthCarbon->startOfMonth()->toDateString(),
                        'pay_period_end'   => $monthCarbon->copy()->endOfMonth()->toDateString(),
                        'working_days'     => (int) $monthCarbon->copy()->endOfMonth()->day,
                        'present_days'     => (int) $monthCarbon->copy()->endOfMonth()->day,
                        'basic_salary'     => round($gross * 0.5, 2),
                        'hra'              => round($gross * 0.2, 2),
                        'gross_earnings'   => $gross,
                        'total_deductions' => $deductions,
                        'net_pay'          => $net,
                        'employee_pf'      => $pf,
                        'employer_pf'      => $pf,
                        'professional_tax' => $pt,
                        'status'           => 'generated',
                    ]
                );
            }

            $run->update(['total_gross' => $totalGross, 'total_net' => $totalNet, 'total_deductions' => $totalGross - $totalNet]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ASSETS
    // ─────────────────────────────────────────────────────────────
    private function seedAssets(): void
    {
        $categories = [
            ['name' => 'IT Equipment',      'code' => 'IT'],
            ['name' => 'Office Furniture',  'code' => 'FURN'],
            ['name' => 'Vehicles',          'code' => 'VEH'],
            ['name' => 'Office Equipment',  'code' => 'OFFEQ'],
        ];
        $catMap = [];
        foreach ($categories as $cat) {
            $c = AssetCategory::firstOrCreate(
                ['company_id' => $this->company->id, 'code' => $cat['code']],
                array_merge($cat, ['company_id' => $this->company->id, 'is_active' => true])
            );
            $catMap[$cat['code']] = $c->id;
        }

        $assets = [
            ['name' => 'Dell Precision 7670 Workstation', 'code' => 'IT-001', 'cat' => 'IT',   'date' => '2023-04-15', 'cost' => 185000, 'life' => 5, 'salvage' => 15000, 'method' => 'straight_line',   'location' => 'IT Department'],
            ['name' => 'Apple MacBook Pro 16" M3',        'code' => 'IT-002', 'cat' => 'IT',   'date' => '2023-08-10', 'cost' => 250000, 'life' => 5, 'salvage' => 25000, 'method' => 'straight_line',   'location' => 'Design Team'],
            ['name' => 'HP EliteBook 840 G10 (x5)',       'code' => 'IT-003', 'cat' => 'IT',   'date' => '2024-01-20', 'cost' => 475000, 'life' => 4, 'salvage' => 47500, 'method' => 'straight_line',   'location' => 'General Office'],
            ['name' => 'Cisco Catalyst 2960 Switch',      'code' => 'IT-004', 'cat' => 'IT',   'date' => '2022-11-05', 'cost' => 85000,  'life' => 7, 'salvage' => 5000,  'method' => 'straight_line',   'location' => 'Server Room'],
            ['name' => 'Executive Conference Table',      'code' => 'FURN-001','cat' => 'FURN', 'date' => '2022-06-01', 'cost' => 125000, 'life' => 10,'salvage' => 10000, 'method' => 'straight_line',   'location' => 'Board Room'],
            ['name' => 'Office Chairs (20 units)',        'code' => 'FURN-002','cat' => 'FURN', 'date' => '2022-06-01', 'cost' => 140000, 'life' => 8, 'salvage' => 14000, 'method' => 'straight_line',   'location' => 'General Office'],
            ['name' => 'Toyota Innova Crysta',            'code' => 'VEH-001', 'cat' => 'VEH',  'date' => '2021-10-12', 'cost' => 2200000,'life' => 8, 'salvage' => 300000,'method' => 'declining_balance','location' => 'Company Fleet'],
            ['name' => 'Ricoh MP C4504 Colour MFP',      'code' => 'OFFEQ-001','cat' => 'OFFEQ','date' => '2023-03-01', 'cost' => 95000,  'life' => 5, 'salvage' => 5000,  'method' => 'straight_line',   'location' => 'Admin Area'],
        ];

        foreach ($assets as $a) {
            $purchase = Carbon::parse($a['date']);
            $monthsOwned = $purchase->diffInMonths(Carbon::now());
            $annualDep   = ($a['cost'] - $a['salvage']) / $a['life'];
            $accumulated = min(round($annualDep * $monthsOwned / 12, 2), $a['cost'] - $a['salvage']);
            $currentVal  = $a['cost'] - $accumulated;

            Asset::firstOrCreate(
                ['company_id' => $this->company->id, 'asset_code' => $a['code']],
                [
                    'company_id'              => $this->company->id,
                    'asset_code'              => $a['code'],
                    'name'                    => $a['name'],
                    'category_id'             => $catMap[$a['cat']],
                    'purchase_date'           => $a['date'],
                    'purchase_cost'           => $a['cost'],
                    'useful_life_years'       => $a['life'],
                    'salvage_value'           => $a['salvage'],
                    'depreciation_method'     => $a['method'],
                    'depreciation_start_date' => $a['date'],
                    'book_value'              => $currentVal,
                    'accumulated_depreciation'=> $accumulated,
                    'location'                => $a['location'],
                    'status'                  => 'active',
                    'created_by'              => $this->adminUser->id,
                ]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    // BUDGETS
    // ─────────────────────────────────────────────────────────────
    private function seedBudgets(): void
    {
        $budgets = [
            ['name' => 'FY 2024-25 Annual Operating Budget', 'start' => '2024-04-01', 'end' => '2025-03-31', 'period' => 'annual',    'total' => 12000000, 'actual' => 8450000, 'status' => 'approved'],
            ['name' => 'Q3 2024-25 Marketing Budget',        'start' => '2024-10-01', 'end' => '2024-12-31', 'period' => 'quarterly', 'total' => 800000,   'actual' => 620000,  'status' => 'approved'],
            ['name' => 'Q3 2024-25 IT Infrastructure',       'start' => '2024-10-01', 'end' => '2024-12-31', 'period' => 'quarterly', 'total' => 1500000,  'actual' => 950000,  'status' => 'approved'],
            ['name' => 'Q4 2024-25 Sales Target Budget',     'start' => '2025-01-01', 'end' => '2025-03-31', 'period' => 'quarterly', 'total' => 2000000,  'actual' => 0,       'status' => 'draft'],
            ['name' => 'Product Launch - AI Module',         'start' => '2024-11-01', 'end' => '2025-01-31', 'period' => 'project',   'total' => 3500000,  'actual' => 1200000, 'status' => 'approved'],
        ];

        $expenseAcc = $this->accounts['6001'] ?? null;
        $incomeAcc  = $this->accounts['4001'] ?? null;

        foreach ($budgets as $b) {
            $budget = Budget::firstOrCreate(
                ['company_id' => $this->company->id, 'name' => $b['name']],
                [
                    'company_id'      => $this->company->id,
                    'fiscal_year_id'  => $this->fiscalYear->id,
                    'name'            => $b['name'],
                    'budget_type'     => $b['period'],
                    'start_date'      => $b['start'],
                    'end_date'        => $b['end'],
                    'status'          => $b['status'],
                    'total_amount'    => $b['total'],
                    'allocated_amount'=> $b['total'],
                    'spent_amount'    => $b['actual'],
                    'remaining_amount'=> $b['total'] - $b['actual'],
                    'created_by'      => $this->adminUser->id,
                    'approved_by'     => $b['status'] === 'approved' ? $this->adminUser->id : null,
                    'approved_at'     => $b['status'] === 'approved' ? now() : null,
                ]
            );

            // Add budget lines
            if ($expenseAcc && !BudgetLine::where('budget_id', $budget->id)->exists()) {
                $lineItems = [
                    ['account_id' => $this->accounts['6001']->id ?? null, 'amount' => round($b['total'] * 0.35, 2), 'actual_amount' => round($b['actual'] * 0.35, 2), 'period_type' => 'monthly'],
                    ['account_id' => $this->accounts['6002']->id ?? null, 'amount' => round($b['total'] * 0.15, 2), 'actual_amount' => round($b['actual'] * 0.12, 2), 'period_type' => 'monthly'],
                    ['account_id' => $this->accounts['6005']->id ?? null, 'amount' => round($b['total'] * 0.20, 2), 'actual_amount' => round($b['actual'] * 0.25, 2), 'period_type' => 'monthly'],
                    ['account_id' => $this->accounts['6007']->id ?? null, 'amount' => round($b['total'] * 0.15, 2), 'actual_amount' => round($b['actual'] * 0.10, 2), 'period_type' => 'monthly'],
                    ['account_id' => $this->accounts['6004']->id ?? null, 'amount' => round($b['total'] * 0.15, 2), 'actual_amount' => round($b['actual'] * 0.18, 2), 'period_type' => 'monthly'],
                ];
                foreach ($lineItems as $line) {
                    if ($line['account_id']) {
                        BudgetLine::create(array_merge($line, ['budget_id' => $budget->id]));
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // JOURNAL ENTRIES
    // ─────────────────────────────────────────────────────────────
    private function seedJournals(): void
    {
        if (Journal::where('company_id', $this->company->id)->exists()) {
            return;
        }

        $journals = [
            [
                'number' => 'JNL-2024-00001', 'type' => 'receipt',  'date' => '-60 days',
                'narration' => 'Payment received from Reliance Industries for INV-2024-00001',
                'status' => 'posted',
                'lines' => [
                    ['account' => '1002', 'debit' => 177000, 'credit' => 0,      'desc' => 'HDFC Bank receipt'],
                    ['account' => '1100', 'debit' => 0,      'credit' => 177000, 'desc' => 'Accounts Receivable - Reliance'],
                ],
            ],
            [
                'number' => 'JNL-2024-00002', 'type' => 'sales',    'date' => '-45 days',
                'narration' => 'Sales invoice - TCS AI ERP Integration INV-2024-00002',
                'status' => 'posted',
                'lines' => [
                    ['account' => '1100', 'debit' => 344150, 'credit' => 0,      'desc' => 'Accounts Receivable - TCS'],
                    ['account' => '4001', 'debit' => 0,      'credit' => 265000, 'desc' => 'Service Revenue'],
                    ['account' => '4003', 'debit' => 0,      'credit' => 15750,  'desc' => 'Training Revenue'],
                    ['account' => '2100', 'debit' => 0,      'credit' => 31700,  'desc' => 'GST CGST Payable'],
                    ['account' => '2101', 'debit' => 0,      'credit' => 31700,  'desc' => 'GST SGST Payable'],
                ],
            ],
            [
                'number' => 'JNL-2024-00003', 'type' => 'payment',  'date' => '-38 days',
                'narration' => 'Payment to Microsoft India for software licenses',
                'status' => 'posted',
                'lines' => [
                    ['account' => '2001', 'debit' => 59000, 'credit' => 0,     'desc' => 'Accounts Payable - Microsoft'],
                    ['account' => '1002', 'debit' => 0,     'credit' => 59000, 'desc' => 'HDFC Bank payment'],
                ],
            ],
            [
                'number' => 'JNL-2024-00004', 'type' => 'general',  'date' => '-28 days',
                'narration' => 'Monthly payroll October 2024',
                'status' => 'posted',
                'lines' => [
                    ['account' => '6001', 'debit' => 617000, 'credit' => 0,      'desc' => 'Gross salaries expense'],
                    ['account' => '2300', 'debit' => 0,      'credit' => 548630, 'desc' => 'Net salaries payable'],
                    ['account' => '2400', 'debit' => 0,      'credit' => 68370,  'desc' => 'PF payable'],
                ],
            ],
            [
                'number' => 'JNL-2024-00005', 'type' => 'adjustment', 'date' => '-10 days',
                'narration' => 'Depreciation entry - October 2024',
                'status' => 'draft',
                'lines' => [
                    ['account' => '6009', 'debit' => 45750, 'credit' => 0,     'desc' => 'Depreciation expense for the month'],
                    ['account' => '1600', 'debit' => 0,     'credit' => 45750, 'desc' => 'Accumulated depreciation'],
                ],
            ],
        ];

        foreach ($journals as $j) {
            $totalDebit  = array_sum(array_column($j['lines'], 'debit'));
            $totalCredit = array_sum(array_column($j['lines'], 'credit'));

            $journal = Journal::create([
                'company_id'      => $this->company->id,
                'fiscal_year_id'  => $this->fiscalYear->id,
                'journal_number'  => $j['number'],
                'journal_type'    => $j['type'],
                'date'            => Carbon::now()->modify($j['date'])->toDateString(),
                'narration'       => $j['narration'],
                'total_debit'     => $totalDebit,
                'total_credit'    => $totalCredit,
                'status'          => $j['status'],
                'created_by'      => $this->adminUser->id,
                'posted_by'       => $j['status'] === 'posted' ? $this->adminUser->id : null,
                'posted_at'       => $j['status'] === 'posted' ? now() : null,
            ]);

            foreach ($j['lines'] as $i => $line) {
                $acc = $this->accounts[$line['account']] ?? null;
                if ($acc) {
                    JournalLine::create([
                        'journal_id'  => $journal->id,
                        'account_id'  => $acc->id,
                        'company_id'  => $this->company->id,
                        'debit'       => $line['debit'],
                        'credit'      => $line['credit'],
                        'description' => $line['desc'],
                        'sort_order'  => $i,
                    ]);
                }
            }
        }
    }
}
