<?php

namespace App\Http\Controllers\Installer;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class InstallerController extends Controller
{
    public function welcome()
    {
        return Inertia::render('Installer/Welcome', [
            'appVersion' => config('app.version', '1.0.0'),
        ]);
    }

    public function requirements()
    {
        $requirements = [
            ['name' => 'PHP >= 8.2',         'met' => version_compare(PHP_VERSION, '8.2.0', '>=')],
            ['name' => 'BCMath Extension',    'met' => extension_loaded('bcmath')],
            ['name' => 'Ctype Extension',     'met' => extension_loaded('ctype')],
            ['name' => 'Fileinfo Extension',  'met' => extension_loaded('fileinfo')],
            ['name' => 'JSON Extension',      'met' => extension_loaded('json')],
            ['name' => 'Mbstring Extension',  'met' => extension_loaded('mbstring')],
            ['name' => 'OpenSSL Extension',   'met' => extension_loaded('openssl')],
            ['name' => 'PDO Extension',       'met' => extension_loaded('pdo')],
            ['name' => 'PDO MySQL Extension', 'met' => extension_loaded('pdo_mysql')],
            ['name' => 'Tokenizer Extension', 'met' => extension_loaded('tokenizer')],
            ['name' => 'XML Extension',       'met' => extension_loaded('xml')],
            ['name' => 'Storage Writable',    'met' => is_writable(storage_path())],
            ['name' => 'Bootstrap Writable',  'met' => is_writable(base_path('bootstrap/cache'))],
        ];

        $allMet = collect($requirements)->every(fn ($r) => $r['met']);

        return Inertia::render('Installer/Requirements', [
            'requirements' => $requirements,
            'allMet'       => $allMet,
        ]);
    }

    public function database()
    {
        return Inertia::render('Installer/Database', [
            'env' => [
                'host'     => env('DB_HOST', '127.0.0.1'),
                'port'     => env('DB_PORT', '3306'),
                'database' => env('DB_DATABASE', ''),
                'username' => env('DB_USERNAME', ''),
            ],
        ]);
    }

    public function saveDatabase(Request $request)
    {
        $data = $request->validate([
            'host'     => 'required|string',
            'port'     => 'required|integer',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        // Test connection before saving
        try {
            $pdo = new \PDO(
                "mysql:host={$data['host']};port={$data['port']};dbname={$data['database']}",
                $data['username'],
                $data['password'] ?? ''
            );
        } catch (\PDOException $e) {
            return back()->withErrors(['database' => 'Could not connect: ' . $e->getMessage()]);
        }

        // Write to .env
        $this->updateEnv([
            'DB_HOST'     => $data['host'],
            'DB_PORT'     => $data['port'],
            'DB_DATABASE' => $data['database'],
            'DB_USERNAME' => $data['username'],
            'DB_PASSWORD' => $data['password'] ?? '',
        ]);

        return redirect()->route('installer.admin');
    }

    public function admin()
    {
        return Inertia::render('Installer/Admin');
    }

    public function saveAdmin(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'name'         => 'required|string|max:255',
            'email'        => 'required|email',
            'password'     => 'required|string|min:8|confirmed',
            'currency'     => 'required|size:3',
            'timezone'     => 'required|string',
        ]);

        // Store in session; actual creation happens in run step
        session([
            'installer_admin'   => $data,
            'installer_step'    => 'admin_done',
        ]);

        return redirect()->route('installer.complete');
    }

    public function complete()
    {
        return Inertia::render('Installer/Complete', [
            'ready' => session()->has('installer_admin'),
        ]);
    }

    public function run(Request $request)
    {
        $adminData = session('installer_admin');

        if (!$adminData) {
            return response()->json(['error' => 'Setup data missing. Please restart the wizard.'], 422);
        }

        try {
            // Run migrations
            Artisan::call('migrate', ['--force' => true]);

            // Seed roles & permissions
            Artisan::call('db:seed', ['--class' => 'RolesPermissionsSeeder', '--force' => true]);

            // Create company
            $company = Company::create([
                'name'      => $adminData['company_name'],
                'slug'      => \Illuminate\Support\Str::slug($adminData['company_name']),
                'currency'  => $adminData['currency'],
                'timezone'  => $adminData['timezone'],
                'is_active' => true,
            ]);

            // Create admin user
            $user = User::create([
                'name'       => $adminData['name'],
                'email'      => $adminData['email'],
                'password'   => Hash::make($adminData['password']),
                'company_id' => $company->id,
                'is_active'  => true,
            ]);

            $role = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
            $user->assignRole($role);

            // Mark as installed
            file_put_contents(storage_path('installed'), now()->toIso8601String());

            session()->forget(['installer_admin', 'installer_step']);

            return response()->json(['success' => true, 'redirect' => route('login')]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function updateEnv(array $values): void
    {
        $envPath = base_path('.env');
        $content = file_get_contents($envPath);

        foreach ($values as $key => $value) {
            $value = str_contains($value, ' ') ? '"' . $value . '"' : $value;

            if (preg_match("/^{$key}=.*/m", $content)) {
                $content = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $content);
            } else {
                $content .= "\n{$key}={$value}";
            }
        }

        file_put_contents($envPath, $content);

        // Clear config cache so new values are picked up
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }
    }
}
