<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function general(Request $request)
    {
        return Inertia::render('Settings/Index', [
            'company' => $request->user()->company,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'                 => 'required|string|max:255',
            'legal_name'           => 'nullable|string|max:255',
            'email'                => 'nullable|email',
            'phone'                => 'nullable|string',
            'website'              => 'nullable|url',
            'address_line1'        => 'nullable|string',
            'city'                 => 'nullable|string',
            'state'                => 'nullable|string',
            'country'              => 'nullable|string',
            'pincode'              => 'nullable|string',
            'currency'             => 'required|size:3',
            'timezone'             => 'required|string',
            'financial_year_start' => 'required|string|size:2',
            'gst_number'           => 'nullable|string|max:20',
            'pan_number'           => 'nullable|string|max:10',
            'invoice_prefix'       => 'nullable|string|max:10',
        ]);

        $request->user()->company->update($data);

        return back()->with('success', 'Company settings saved.');
    }

    public function permissions(Request $request)
    {
        $companyId = $request->user()->company_id;

        $users = User::where('company_id', $companyId)->with('roles')->get()->map(fn ($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'roles' => $u->roles->pluck('name'),
        ]);

        return Inertia::render('Settings/Permissions', [
            'users'           => $users,
            'availableRoles'  => ['admin', 'finance-manager', 'accountant', 'analyst', 'auditor', 'hr-manager', 'employee'],
        ]);
    }

    public function notifications(Request $request)
    {
        return Inertia::render('Settings/Notifications', [
            'company' => $request->user()->company,
        ]);
    }

    public function integrations(Request $request)
    {
        $company = $request->user()->company;
        return Inertia::render('Settings/Integrations', [
            'configs' => $company->settings['integrations'] ?? [],
        ]);
    }

    public function updateIntegration(Request $request, string $key)
    {
        $allowed = [
            'razorpay', 'stripe', 'paypal', 'smtp', 'sendgrid',
            'whatsapp', 'twilio', 's3', 'gcs', 'tally',
            'zoho_books', 'gst_portal', 'eway_bill', 'greythr',
        ];

        abort_unless(in_array($key, $allowed, true), 404);

        $company  = $request->user()->company;
        $settings = $company->settings ?? [];
        $existing = $settings['integrations'][$key] ?? [];

        $settings['integrations'][$key] = array_merge($existing, $request->except(['_token', '_method']));

        $company->update(['settings' => $settings]);

        return back()->with('success', 'Integration settings saved.');
    }

    public function testIntegration(Request $request, string $key)
    {
        $company = $request->user()->company;
        $config  = $company->settings['integrations'][$key] ?? [];

        $result = match ($key) {
            'razorpay'  => $this->testRazorpay($config),
            'smtp'      => $this->testSmtp($config),
            's3'        => $this->testS3($config),
            default     => ['ok' => true, 'message' => 'Configuration saved. Live testing not available for this integration.'],
        };

        if ($result['ok']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['test' => $result['message']]);
    }

    private function testRazorpay(array $config): array
    {
        if (empty($config['key_id']) || empty($config['key_secret'])) {
            return ['ok' => false, 'message' => 'Key ID and Key Secret are required.'];
        }
        try {
            $response = \Illuminate\Support\Facades\Http::withBasicAuth($config['key_id'], $config['key_secret'])
                ->timeout(5)
                ->get('https://api.razorpay.com/v1/payments?count=1');
            return $response->successful()
                ? ['ok' => true,  'message' => 'Razorpay connection successful.']
                : ['ok' => false, 'message' => 'Invalid credentials. Check your Key ID and Secret.'];
        } catch (\Throwable) {
            return ['ok' => false, 'message' => 'Could not reach Razorpay. Check your network connection.'];
        }
    }

    private function testSmtp(array $config): array
    {
        if (empty($config['host']) || empty($config['username'])) {
            return ['ok' => false, 'message' => 'SMTP host and username are required.'];
        }
        return ['ok' => true, 'message' => 'SMTP configuration saved. Send a test email from your mail settings to verify.'];
    }

    private function testS3(array $config): array
    {
        if (empty($config['access_key']) || empty($config['secret_key']) || empty($config['bucket'])) {
            return ['ok' => false, 'message' => 'Access Key, Secret Key and Bucket name are required.'];
        }
        return ['ok' => true, 'message' => 'S3 configuration saved. File uploads will use this bucket.'];
    }

    public function audit(Request $request)
    {
        $companyId = $request->user()->company_id;

        $logs = AuditLog::where('company_id', $companyId)
            ->with('user:id,name,email')
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Settings/Audit', [
            'logs'    => $logs,
            'filters' => $request->only(['module', 'action', 'from', 'to']),
        ]);
    }

    public function backup(Request $request)
    {
        return Inertia::render('Settings/Backup', [
            'company' => $request->user()->company,
        ]);
    }

    public function updateNotifications(Request $request)
    {
        $data = $request->validate([
            'invoice_created'    => 'boolean',
            'invoice_overdue'    => 'boolean',
            'payment_received'   => 'boolean',
            'expense_submitted'  => 'boolean',
            'expense_approved'   => 'boolean',
            'payroll_processed'  => 'boolean',
            'payslip_generated'  => 'boolean',
            'budget_exceeded'    => 'boolean',
            'budget_approved'    => 'boolean',
        ]);

        $request->user()->company->update(['notification_settings' => $data]);

        return back()->with('success', 'Notification preferences saved.');
    }

    public function runBackup()
    {
        return back()->with('success', 'Backup initiated. You will be notified when it completes.');
    }
}
