<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    // ── Canonical permission definitions (must match PermissionController::MODULES) ──
    private const MODULES = [
        'Dashboard'    => ['dashboard.view'],
        'Accounting'   => ['accounting.view', 'accounting.create', 'accounting.edit', 'accounting.delete', 'accounting.post_journal', 'accounting.void_journal'],
        'Invoicing'    => ['invoicing.view', 'invoicing.create', 'invoicing.edit', 'invoicing.delete', 'invoicing.send', 'invoicing.record_payment'],
        'Expenses'     => ['expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete', 'expenses.approve'],
        'Banking'      => ['banking.view', 'banking.create', 'banking.edit', 'banking.delete', 'banking.reconcile'],
        'Payroll'      => ['payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete', 'payroll.process'],
        'Tax'          => ['tax.view', 'tax.manage'],
        'Assets'       => ['assets.view', 'assets.create', 'assets.edit', 'assets.delete'],
        'Vendors'      => ['vendors.view', 'vendors.create', 'vendors.edit', 'vendors.delete'],
        'Customers'    => ['customers.view', 'customers.create', 'customers.edit', 'customers.delete'],
        'Budget'       => ['budget.view', 'budget.create', 'budget.edit', 'budget.delete'],
        'Reports'      => ['reports.view', 'reports.export'],
        'AI Assistant' => ['ai.use'],
        'Settings'     => ['settings.view', 'settings.manage_users', 'settings.manage_roles', 'settings.manage_company'],
    ];

    // ── Role permission maps ──────────────────────────────────────────────────────
    private const ROLE_PERMISSIONS = [

        // Full system access — no restrictions
        'super-admin' => '*',

        // Full company-level access
        'company-owner' => '*',

        // Full access (same as company-owner, managed internally)
        'admin' => '*',

        // Finance lead — all financial modules, limited settings
        'finance-manager' => [
            'dashboard.view',
            'accounting.view', 'accounting.create', 'accounting.edit', 'accounting.delete',
            'accounting.post_journal', 'accounting.void_journal',
            'invoicing.view', 'invoicing.create', 'invoicing.edit', 'invoicing.delete',
            'invoicing.send', 'invoicing.record_payment',
            'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete', 'expenses.approve',
            'banking.view', 'banking.create', 'banking.edit', 'banking.delete', 'banking.reconcile',
            'payroll.view', 'payroll.create', 'payroll.edit', 'payroll.process',
            'tax.view', 'tax.manage',
            'assets.view', 'assets.create', 'assets.edit',
            'vendors.view', 'vendors.create', 'vendors.edit', 'vendors.delete',
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
            'budget.view', 'budget.create', 'budget.edit', 'budget.delete',
            'reports.view', 'reports.export',
            'ai.use',
            'settings.view',
        ],

        // Day-to-day bookkeeping
        'accountant' => [
            'dashboard.view',
            'accounting.view', 'accounting.create', 'accounting.edit', 'accounting.post_journal',
            'invoicing.view', 'invoicing.create', 'invoicing.edit', 'invoicing.record_payment',
            'expenses.view', 'expenses.create', 'expenses.edit',
            'banking.view', 'banking.reconcile',
            'tax.view',
            'vendors.view',
            'customers.view',
            'budget.view',
            'reports.view', 'reports.export',
        ],

        // Read-only + export for compliance review
        'auditor' => [
            'dashboard.view',
            'accounting.view',
            'invoicing.view',
            'expenses.view',
            'banking.view',
            'payroll.view',
            'tax.view',
            'assets.view',
            'vendors.view',
            'customers.view',
            'budget.view',
            'reports.view', 'reports.export',
        ],

        // Payroll + employee expenses
        'hr-manager' => [
            'dashboard.view',
            'payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete', 'payroll.process',
            'expenses.view', 'expenses.approve',
            'reports.view',
            'settings.view', 'settings.manage_users',
        ],

        // Branch operations — create invoices, manage local expenses
        'branch-manager' => [
            'dashboard.view',
            'accounting.view',
            'invoicing.view', 'invoicing.create', 'invoicing.edit', 'invoicing.send',
            'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.approve',
            'banking.view',
            'vendors.view', 'vendors.create',
            'customers.view', 'customers.create', 'customers.edit',
            'budget.view',
            'reports.view',
        ],

        // GST/TDS filing consultant
        'tax-consultant' => [
            'dashboard.view',
            'accounting.view',
            'invoicing.view',
            'tax.view', 'tax.manage',
            'reports.view', 'reports.export',
        ],

        // Dashboard + own expense claims only
        'employee' => [
            'dashboard.view',
            'expenses.view', 'expenses.create', 'expenses.edit',
        ],

        // View own invoices and purchase orders only
        'vendor' => [
            'dashboard.view',
            'invoicing.view',
            'vendors.view',
        ],

        // View own invoices only
        'customer' => [
            'dashboard.view',
            'invoicing.view',
            'customers.view',
        ],

        // Analytics only — no writes, full reads + AI
        'read-only-analyst' => [
            'dashboard.view',
            'accounting.view',
            'invoicing.view',
            'expenses.view',
            'banking.view',
            'payroll.view',
            'tax.view',
            'assets.view',
            'vendors.view',
            'customers.view',
            'budget.view',
            'reports.view', 'reports.export',
            'ai.use',
        ],
    ];

    public function run(): void
    {
        // ── 1. Flush permission cache ─────────────────────────────────────────
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('  Flushing permission cache...');

        // ── 2. Collect all canonical permission names ─────────────────────────
        $allPermNames = collect(self::MODULES)->flatten()->values()->all();

        // ── 3. Remove stale legacy permissions (old action-module format) ─────
        //       Old format used hyphens: "view-dashboard", "create-accounting", etc.
        //       New format uses dots:     "dashboard.view", "accounting.create", etc.
        $staleDeleted = Permission::whereNotIn('name', $allPermNames)
            ->where('guard_name', 'web')
            ->delete();

        if ($staleDeleted) {
            $this->command->warn("  Removed {$staleDeleted} stale/legacy permissions.");
        }

        // ── 4. Create all canonical permissions (idempotent) ──────────────────
        $created = 0;
        foreach ($allPermNames as $name) {
            [$perm, $wasCreated] = [
                Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']),
                false,
            ];
            if ($perm->wasRecentlyCreated) {
                $created++;
            }
        }

        $total = count($allPermNames);
        $this->command->info("  Permissions: {$total} total, {$created} newly created.");

        // Re-fetch all permissions for assignment
        $allPerms = Permission::whereIn('name', $allPermNames)->get();

        // ── 5. Create roles and sync permissions ──────────────────────────────
        $this->command->info('  Syncing role permissions...');

        foreach (self::ROLE_PERMISSIONS as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($permissions === '*') {
                $role->syncPermissions($allPerms);
                $count = $allPerms->count();
            } else {
                $role->syncPermissions(
                    $allPerms->whereIn('name', $permissions)->values()
                );
                $count = count($permissions);
            }

            $label = str_pad($roleName, 22);
            $this->command->line("    {$label} → {$count} permissions");
        }

        // ── 6. Final cache flush ──────────────────────────────────────────────
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $roleCount = count(self::ROLE_PERMISSIONS);
        $this->command->info("\n  ✓ {$roleCount} roles configured with {$total} permissions.");
    }
}
