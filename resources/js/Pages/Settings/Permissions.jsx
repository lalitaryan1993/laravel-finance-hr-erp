import { useState, useMemo } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
    Shield, Plus, Edit2, Trash2, Users, Key, CheckSquare, Square,
    Save, RotateCcw, ChevronDown, ChevronUp, Lock, Eye, PenLine,
    FilePlus, Trash, Send, DollarSign, Settings, UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
    'super-admin':     'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
    'company-owner':   'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
    'admin':           'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    'finance-manager': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    'accountant':      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    'auditor':         'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
    'hr-manager':      'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
    'employee':        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
    'branch-manager':  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
    'tax-consultant':  'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
    'read-only-analyst':'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300',
    'vendor':          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    'customer':        'bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
}

const ACTION_COLORS = {
    'view':            'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    'create':          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'edit':            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'delete':          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'approve':         'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'process':         'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'export':          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'manage':          'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    'use':             'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'send':            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'reconcile':       'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'post_journal':    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'void_journal':    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'record_payment':  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'manage_users':    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    'manage_roles':    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'manage_company':  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

function actionColor(permName) {
    const action = permName.split('.')[1] ?? ''
    return ACTION_COLORS[action] ?? 'bg-muted text-muted-foreground'
}

function roleColor(roleName) {
    return ROLE_COLORS[roleName] ?? 'bg-muted text-muted-foreground'
}

function RoleChip({ name }) {
    return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', roleColor(name))}>
            {ucRole(name)}
        </span>
    )
}

function ucRole(name) {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ────────────────────────────────────────────────────────────────────────────
// TAB: Roles
// ────────────────────────────────────────────────────────────────────────────

function RolesTab({ roles, onEdit, onDelete, onManagePerms }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roles.map((role) => (
                    <RoleCard key={role.id} role={role}
                        onEdit={() => onEdit(role)}
                        onDelete={() => onDelete(role)}
                        onManagePerms={() => onManagePerms(role)} />
                ))}
            </div>
        </div>
    )
}

function RoleCard({ role, onEdit, onDelete, onManagePerms }) {
    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md">
            {/* Top color band */}
            <div className={cn('h-1.5 w-full rounded-t-xl', roleCardBand(role.name))} />

            <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        roleColor(role.name).replace('text-', 'text-').replace('border-', '')
                    )}>
                        <Shield className="w-5 h-5" />
                    </div>
                    {role.is_system && (
                        <Badge variant="outline" className="text-xs gap-1">
                            <Lock className="w-3 h-3" /> System
                        </Badge>
                    )}
                </div>

                <p className="font-semibold text-sm">{ucRole(role.name)}</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {role.users_count} users
                    </span>
                    <span className="flex items-center gap-1">
                        <Key className="w-3 h-3" /> {role.permissions_count} perms
                    </span>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-7"
                        onClick={onManagePerms}>
                        Permissions
                    </Button>
                    {!role.is_system && (
                        <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}>
                                <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onDelete}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function roleCardBand(name) {
    const map = {
        'super-admin': 'bg-rose-500', 'company-owner': 'bg-orange-500', 'admin': 'bg-red-500',
        'finance-manager': 'bg-blue-500', 'accountant': 'bg-indigo-500', 'auditor': 'bg-purple-500',
        'hr-manager': 'bg-teal-500', 'employee': 'bg-green-500', 'branch-manager': 'bg-cyan-500',
        'tax-consultant': 'bg-yellow-500', 'read-only-analyst': 'bg-slate-500',
        'vendor': 'bg-amber-500', 'customer': 'bg-lime-500',
    }
    return map[name] ?? 'bg-primary'
}

// ────────────────────────────────────────────────────────────────────────────
// TAB: Permission Matrix
// ────────────────────────────────────────────────────────────────────────────

function MatrixTab({ roles, modules, initialMatrix, onSave }) {
    // matrix[roleId][permName] = boolean
    const [matrix, setMatrix] = useState(() => {
        const m = {}
        roles.forEach(r => {
            m[r.id] = {}
            Object.values(modules).flat().forEach(p => {
                m[r.id][p.name] = r.permissions.includes(p.name)
            })
        })
        return m
    })
    const [dirty, setDirty] = useState(false)
    const [saving, setSaving] = useState(false)
    const [collapsed, setCollapsed] = useState({})

    function toggle(roleId, permName) {
        setMatrix(prev => ({
            ...prev,
            [roleId]: { ...prev[roleId], [permName]: !prev[roleId][permName] }
        }))
        setDirty(true)
    }

    function toggleColumn(roleId) {
        const allPerms = Object.values(modules).flat().map(p => p.name)
        const allChecked = allPerms.every(p => matrix[roleId][p])
        setMatrix(prev => {
            const next = { ...prev[roleId] }
            allPerms.forEach(p => { next[p] = !allChecked })
            return { ...prev, [roleId]: next }
        })
        setDirty(true)
    }

    function toggleRow(permName) {
        const allChecked = roles.every(r => matrix[r.id][permName])
        setMatrix(prev => {
            const next = { ...prev }
            roles.forEach(r => {
                next[r.id] = { ...next[r.id], [permName]: !allChecked }
            })
            return next
        })
        setDirty(true)
    }

    function toggleModuleForRole(roleId, modulePerms) {
        const names = modulePerms.map(p => p.name)
        const allChecked = names.every(p => matrix[roleId][p])
        setMatrix(prev => {
            const next = { ...prev[roleId] }
            names.forEach(p => { next[p] = !allChecked })
            return { ...prev, [roleId]: next }
        })
        setDirty(true)
    }

    function reset() {
        setMatrix(() => {
            const m = {}
            roles.forEach(r => {
                m[r.id] = {}
                Object.values(modules).flat().forEach(p => {
                    m[r.id][p.name] = r.permissions.includes(p.name)
                })
            })
            return m
        })
        setDirty(false)
    }

    function save() {
        setSaving(true)
        const payload = {}
        roles.forEach(r => {
            payload[r.id] = Object.entries(matrix[r.id])
                .filter(([, v]) => v).map(([k]) => k)
        })
        router.put('/settings/permissions/matrix', { matrix: payload }, {
            onSuccess: () => { setDirty(false); setSaving(false) },
            onError:   () => setSaving(false),
        })
    }

    const columnCount = roles.length + 2 // label col + row-toggle col

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Toggle checkboxes to grant or revoke permissions per role. Click a module header or column header to bulk-toggle.
                </p>
                <div className="flex items-center gap-2">
                    {dirty && (
                        <Button variant="outline" size="sm" onClick={reset}>
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                        </Button>
                    )}
                    <Button size="sm" onClick={save} disabled={!dirty || saving}>
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        {saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}
                    </Button>
                </div>
            </div>

            {dirty && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm">
                    <Save className="w-4 h-4 shrink-0" />
                    You have unsaved changes. Click <strong className="mx-1">Save Changes</strong> to apply.
                </div>
            )}

            {/* Matrix table — horizontally scrollable */}
            <div className="rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-muted/60 border-b">
                                {/* Module/Permission label */}
                                <th className="text-left px-4 py-3 font-semibold text-sm sticky left-0 bg-muted/60 z-10 min-w-[200px] border-r">
                                    Module / Permission
                                </th>
                                {/* Row-toggle */}
                                <th className="px-2 py-3 text-center font-medium text-muted-foreground border-r min-w-[52px]" title="Grant to all roles">
                                    <span className="text-[10px]">All</span>
                                </th>
                                {/* Role columns */}
                                {roles.map(role => (
                                    <th key={role.id} className="px-3 py-2 text-center min-w-[110px] border-r last:border-r-0">
                                        <div className="flex flex-col items-center gap-1">
                                            <RoleChip name={role.name} />
                                            <button
                                                onClick={() => toggleColumn(role.id)}
                                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 mt-0.5"
                                                title="Toggle all permissions for this role">
                                                {Object.values(modules).flat().every(p => matrix[role.id][p.name])
                                                    ? <><CheckSquare className="w-3 h-3" /> All On</>
                                                    : <><Square className="w-3 h-3" /> Select All</>}
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(modules).map(([moduleName, perms]) => {
                                const isCollapsed = collapsed[moduleName]
                                const allRolesAllPerms = roles.every(r =>
                                    perms.every(p => matrix[r.id][p.name])
                                )

                                return [
                                    // Module section header
                                    <tr key={`hdr-${moduleName}`} className="bg-muted/30 border-b border-t">
                                        {/* Module name — sticky */}
                                        <td className="px-4 py-2 sticky left-0 bg-muted/30 z-10 border-r">
                                            <button
                                                className="flex items-center gap-2 font-semibold text-sm w-full text-left hover:text-primary"
                                                onClick={() => setCollapsed(c => ({ ...c, [moduleName]: !c[moduleName] }))}>
                                                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                                {moduleName}
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                                    {perms.length}
                                                </Badge>
                                            </button>
                                        </td>
                                        {/* Row all-toggle (module scope) */}
                                        <td className="px-2 py-2 text-center border-r" />
                                        {/* Per-role module toggles */}
                                        {roles.map(role => {
                                            const moduleAllChecked = perms.every(p => matrix[role.id][p.name])
                                            return (
                                                <td key={role.id} className="px-3 py-2 text-center border-r last:border-r-0">
                                                    <button
                                                        onClick={() => toggleModuleForRole(role.id, perms)}
                                                        className={cn(
                                                            'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                                                            moduleAllChecked
                                                                ? 'bg-primary/10 border-primary text-primary'
                                                                : perms.some(p => matrix[role.id][p.name])
                                                                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                                                                    : 'bg-muted border-border text-muted-foreground'
                                                        )}>
                                                        {moduleAllChecked ? 'Full' : perms.some(p => matrix[role.id][p.name]) ? 'Partial' : 'None'}
                                                    </button>
                                                </td>
                                            )
                                        })}
                                    </tr>,

                                    // Permission rows (hidden when collapsed)
                                    ...(!isCollapsed ? perms.map(perm => {
                                        const allChecked = roles.every(r => matrix[r.id][perm.name])
                                        return (
                                            <tr key={perm.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                                                {/* Permission label */}
                                                <td className="pl-8 pr-4 py-2.5 sticky left-0 bg-card z-10 border-r">
                                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium', actionColor(perm.name))}>
                                                        {perm.label}
                                                    </span>
                                                    <span className="ml-2 text-[10px] text-muted-foreground/60 font-mono">{perm.name}</span>
                                                </td>
                                                {/* Row toggle (all roles) */}
                                                <td className="px-2 py-2.5 text-center border-r">
                                                    <button onClick={() => toggleRow(perm.name)}
                                                        title="Grant to all roles"
                                                        className={cn(
                                                            'w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors',
                                                            allChecked
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground/40 hover:text-muted-foreground'
                                                        )}>
                                                        {allChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                {/* Per-role checkboxes */}
                                                {roles.map(role => {
                                                    const checked = matrix[role.id][perm.name]
                                                    return (
                                                        <td key={role.id} className="px-3 py-2.5 text-center border-r last:border-r-0">
                                                            <button
                                                                onClick={() => toggle(role.id, perm.name)}
                                                                className={cn(
                                                                    'w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all',
                                                                    checked
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-border hover:border-primary/50'
                                                                )}>
                                                                {checked && <span className="text-[10px] font-bold">✓</span>}
                                                            </button>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    }) : [])
                                ]
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                <span className="font-medium">Action colors:</span>
                {[['view','View'], ['create','Create'], ['edit','Edit'], ['delete','Delete'], ['approve','Approve'], ['process','Process'], ['manage','Manage']].map(([k, label]) => (
                    <span key={k} className={cn('px-2 py-0.5 rounded font-medium', ACTION_COLORS[k] ?? 'bg-muted')}>{label}</span>
                ))}
            </div>
        </div>
    )
}

// ────────────────────────────────────────────────────────────────────────────
// TAB: User Access
// ────────────────────────────────────────────────────────────────────────────

function UserAccessTab({ users, roles }) {
    const [editingUser, setEditingUser] = useState(null)
    const [selectedRoles, setSelectedRoles] = useState([])
    const [saving, setSaving] = useState(false)

    function openEdit(user) {
        setEditingUser(user)
        setSelectedRoles([...user.roles])
    }

    function toggleRole(roleName) {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        )
    }

    function saveUserRoles() {
        if (!editingUser) return
        setSaving(true)
        router.put(`/settings/users/${editingUser.id}/roles`, { roles: selectedRoles }, {
            onSuccess: () => { setEditingUser(null); setSaving(false) },
            onError:   () => setSaving(false),
        })
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Click on any user to manage their role assignments. Users inherit all permissions granted to their assigned roles.
            </p>

            <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned Roles</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Permissions via Roles</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const permCount = roles
                                .filter(r => user.roles.includes(r.name))
                                .reduce((s, r) => s + r.permissions_count, 0)

                            return (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.roles.length > 0
                                                ? user.roles.map(r => <RoleChip key={r} name={r} />)
                                                : <span className="text-muted-foreground text-xs italic">No roles assigned</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                            <Key className="w-3.5 h-3.5" />
                                            <span>{permCount} effective permissions</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button size="sm" variant="outline" className="h-7 text-xs"
                                            onClick={() => openEdit(user)}>
                                            <Edit2 className="w-3 h-3 mr-1.5" /> Edit Roles
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                        {users.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit user roles dialog */}
            <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Roles — {editingUser?.name}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground -mt-1">{editingUser?.email}</p>

                    <div className="mt-2 space-y-2">
                        {roles.map(role => {
                            const checked = selectedRoles.includes(role.name)
                            return (
                                <button key={role.id}
                                    onClick={() => toggleRole(role.name)}
                                    className={cn(
                                        'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all',
                                        checked
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-muted-foreground/30'
                                    )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', roleColor(role.name))}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{ucRole(role.name)}</p>
                                            <p className="text-xs text-muted-foreground">{role.permissions_count} permissions</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                                        checked ? 'bg-primary border-primary' : 'border-border'
                                    )}>
                                        {checked && <span className="text-[10px] text-primary-foreground font-bold">✓</span>}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={saveUserRoles} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Roles'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'roles',  label: 'Roles',             icon: Shield },
    { id: 'matrix', label: 'Permission Matrix', icon: Key },
    { id: 'users',  label: 'User Access',       icon: UserCheck },
]

export default function Permissions({ roles, modules, users }) {
    const [tab, setTab] = useState('roles')

    // Role dialogs
    const [createOpen, setCreateOpen] = useState(false)
    const [editRole, setEditRole] = useState(null)
    const [deleteRole, setDeleteRole] = useState(null)

    const createForm = useForm({ name: '' })
    const editForm   = useForm({ name: '' })

    function submitCreate(e) {
        e.preventDefault()
        createForm.post('/settings/roles', { onSuccess: () => { setCreateOpen(false); createForm.reset() } })
    }

    function submitEdit(e) {
        e.preventDefault()
        editForm.put(`/settings/roles/${editRole.id}`, { onSuccess: () => setEditRole(null) })
    }

    function confirmDelete() {
        router.delete(`/settings/roles/${deleteRole.id}`, { onSuccess: () => setDeleteRole(null) })
    }

    function openEdit(role) {
        editForm.setData('name', ucRole(role.name))
        setEditRole(role)
    }

    function handleManagePerms(role) {
        setTab('matrix')
    }

    // Stats summary
    const totalRoles = roles.length
    const totalPerms = Object.values(modules).flat().length
    const usersWithRoles = users.filter(u => u.roles.length > 0).length

    return (
        <AppLayout>
            <Head title="Roles & Permissions" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Control what each role can access across all modules
                        </p>
                    </div>
                    {tab === 'roles' && (
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Create Role
                        </Button>
                    )}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Roles', value: totalRoles, icon: Shield, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Defined Permissions', value: totalPerms, icon: Key, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
                        { label: 'Users with Roles', value: `${usersWithRoles} / ${users.length}`, icon: Users, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-4 pt-4 pb-4">
                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.color)}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border w-fit">
                    {TABS.map(t => (
                        <button key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                tab === t.id
                                    ? 'bg-background shadow text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}>
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {tab === 'roles' && (
                    <RolesTab roles={roles}
                        onEdit={openEdit}
                        onDelete={setDeleteRole}
                        onManagePerms={handleManagePerms} />
                )}
                {tab === 'matrix' && (
                    <MatrixTab roles={roles} modules={modules} />
                )}
                {tab === 'users' && (
                    <UserAccessTab users={users} roles={roles} />
                )}
            </div>

            {/* Create role dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Finance Analyst" />
                            <p className="text-xs text-muted-foreground">Spaces will be converted to hyphens.</p>
                            {createForm.errors.name && <p className="text-xs text-destructive">{createForm.errors.name}</p>}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={createForm.processing}>Create Role</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit role dialog */}
            <Dialog open={!!editRole} onOpenChange={o => !o && setEditRole(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Rename Role</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)} />
                            {editForm.errors.name && <p className="text-xs text-destructive">{editForm.errors.name}</p>}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
                            <Button type="submit" loading={editForm.processing}>Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteRole}
                onOpenChange={o => !o && setDeleteRole(null)}
                title="Delete Role"
                description={`Delete the "${deleteRole ? ucRole(deleteRole.name) : ''}" role? Users with this role will lose its permissions.`}
                onConfirm={confirmDelete}
                confirmLabel="Delete Role"
                variant="destructive"
            />
        </AppLayout>
    )
}
