<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class PermissionController extends Controller
{
    // ─── Canonical permission definitions ────────────────────────────────────
    public const MODULES = [
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

    // Roles that cannot be deleted
    private const SYSTEM_ROLES = ['super-admin', 'company-owner'];

    // ─── Permission label formatting ─────────────────────────────────────────
    public static function formatPermission(string $perm): string
    {
        [, $action] = explode('.', $perm, 2) + [1 => $perm];
        return ucwords(str_replace('_', ' ', $action));
    }

    // ─── Seed all defined permissions ─────────────────────────────────────────
    public static function seedPermissions(): void
    {
        foreach (self::MODULES as $permissions) {
            foreach ($permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }
        }
    }

    // ─── Main permissions page ────────────────────────────────────────────────
    public function index(Request $request)
    {
        self::seedPermissions();
        $companyId = $request->user()->company_id;

        $roles = Role::with('permissions')->withCount('permissions', 'users')->get()->map(fn ($r) => [
            'id'               => $r->id,
            'name'             => $r->name,
            'label'            => ucwords(str_replace(['-', '_'], ' ', $r->name)),
            'is_system'        => in_array($r->name, self::SYSTEM_ROLES),
            'permissions_count'=> $r->permissions_count,
            'users_count'      => $r->users_count,
            'permissions'      => $r->permissions->pluck('name')->values(),
        ]);

        $users = User::where('company_id', $companyId)
            ->with('roles:id,name')
            ->get()
            ->map(fn ($u) => [
                'id'    => $u->id,
                'name'  => $u->name,
                'email' => $u->email,
                'roles' => $u->roles->pluck('name')->values(),
            ]);

        $modules = collect(self::MODULES)->map(fn ($perms) =>
            collect($perms)->map(fn ($p) => [
                'name'  => $p,
                'label' => self::formatPermission($p),
            ])->values()
        );

        return Inertia::render('Settings/Permissions', [
            'roles'   => $roles,
            'modules' => $modules,
            'users'   => $users,
        ]);
    }

    // ─── Role CRUD ────────────────────────────────────────────────────────────
    public function storeRole(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:60|unique:roles,name',
            'description' => 'nullable|string|max:255',
        ]);

        $slug = strtolower(str_replace(' ', '-', trim($data['name'])));
        Role::create(['name' => $slug, 'guard_name' => 'web']);

        return back()->with('success', "Role \"{$slug}\" created.");
    }

    public function updateRole(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => 'required|string|max:60|unique:roles,name,' . $role->id,
        ]);

        if (in_array($role->name, self::SYSTEM_ROLES)) {
            return back()->with('error', 'System roles cannot be renamed.');
        }

        $slug = strtolower(str_replace(' ', '-', trim($data['name'])));
        $role->update(['name' => $slug]);

        return back()->with('success', 'Role renamed.');
    }

    public function destroyRole(Role $role)
    {
        if (in_array($role->name, self::SYSTEM_ROLES)) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    // ─── Sync permissions to a role ───────────────────────────────────────────
    public function syncPermissions(Request $request, Role $role)
    {
        $data = $request->validate([
            'permissions'   => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($data['permissions'] ?? []);

        return back()->with('success', "Permissions updated for \"{$role->name}\".");
    }

    // ─── Sync all roles at once (matrix save) ─────────────────────────────────
    public function syncMatrix(Request $request)
    {
        $data = $request->validate([
            'matrix'            => 'required|array',
            'matrix.*'          => 'array',
            'matrix.*.*'        => 'string|exists:permissions,name',
        ]);

        foreach ($data['matrix'] as $roleId => $permissions) {
            $role = Role::find($roleId);
            if ($role) {
                $role->syncPermissions($permissions);
            }
        }

        return back()->with('success', 'Permission matrix saved.');
    }

    // ─── Sync roles to a user ─────────────────────────────────────────────────
    public function syncUserRoles(Request $request, User $user)
    {
        $data = $request->validate([
            'roles'   => 'array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user->syncRoles($data['roles'] ?? []);

        return back()->with('success', "Roles updated for \"{$user->name}\".");
    }
}
