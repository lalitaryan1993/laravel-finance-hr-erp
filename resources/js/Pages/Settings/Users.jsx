import { useState } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UserPlus, Search, Clock, Edit2, Trash2, X, ShieldCheck, Briefcase, ExternalLink } from 'lucide-react'

const selCls = 'w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'

function roleColor(role) {
    const map = {
        'super-admin': 'destructive',
        'admin': 'destructive',
        'hr-manager': 'warning',
        'accountant': 'info',
        'manager': 'secondary',
        'employee': 'outline',
    }
    return map[role] ?? 'secondary'
}

function UserForm({ onSubmit, processing, errors, data, setData, isEdit = false, onClose, roles }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="John Doe" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="john@company.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Designation</Label>
                    <Input value={data.designation} onChange={(e) => setData('designation', e.target.value)} placeholder="e.g. Accountant" />
                </div>
                <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+91 9876543210" />
                </div>
                <div className="space-y-1">
                    <Label>Role</Label>
                    <select value={data.role} onChange={(e) => setData('role', e.target.value)} className={selCls}>
                        <option value="">— Select role —</option>
                        {roles.map(r => (
                            <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                        ))}
                    </select>
                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                </div>
                <div className="space-y-1">
                    <Label>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                        placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="col-span-2 flex items-center gap-3">
                    <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} id="is_active" />
                    <Label htmlFor="is_active">Active (can log in)</Label>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={processing}>{isEdit ? 'Save Changes' : 'Create User'}</Button>
            </div>
        </form>
    )
}

export default function UsersIndex({ users, roles = [], filters }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const [createOpen, setCreateOpen] = useState(false)
    const [editUser, setEditUser]     = useState(null)
    const [deleteUser, setDeleteUser] = useState(null)

    const emptyForm = { name: '', email: '', designation: '', phone: '', password: '', is_active: true, role: '' }
    const createForm = useForm(emptyForm)
    const editForm   = useForm(emptyForm)

    function handleSearch(e) {
        e.preventDefault()
        router.get('/settings/users', { search }, { preserveState: true, replace: true })
    }

    function openCreate() {
        createForm.reset()
        setCreateOpen(true)
    }

    function openEdit(user) {
        editForm.setData({
            name: user.name,
            email: user.email,
            designation: user.designation ?? '',
            phone: user.phone ?? '',
            password: '',
            is_active: user.is_active,
            role: user.roles[0] ?? '',
        })
        setEditUser(user)
    }

    function submitCreate(e) {
        e.preventDefault()
        createForm.post('/settings/users', { onSuccess: () => setCreateOpen(false) })
    }

    function submitEdit(e) {
        e.preventDefault()
        editForm.put(`/settings/users/${editUser.id}`, { onSuccess: () => setEditUser(null) })
    }

    function confirmDelete() {
        router.delete(`/settings/users/${deleteUser.id}`, { onSuccess: () => setDeleteUser(null) })
    }

    return (
        <AppLayout>
            <Head title="Users & Roles" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Users & Roles</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Manage system login accounts and their roles. Employee HR profiles are managed in{' '}
                            <Link href="/payroll/employees" className="text-primary underline underline-offset-2">Payroll → Employees</Link>.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add User
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search by name or email…"
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" variant="secondary">Search</Button>
                    {filters.search && (
                        <Button type="button" variant="ghost" size="icon"
                            onClick={() => router.get('/settings/users', {}, { replace: true })}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </form>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Linked Employee</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        {user.designation && (
                                                            <p className="text-xs text-muted-foreground">{user.designation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.roles.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map(r => (
                                                            <Badge key={r} variant={roleColor(r)} className="capitalize text-xs">
                                                                <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                                                                {r.replace(/-/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No role</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.employee ? (
                                                    <Link href={`/payroll/employees/${user.employee.id}`}
                                                        className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        <span>{user.employee.name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">({user.employee.code})</span>
                                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={user.is_active ? 'success' : 'secondary'}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {user.last_login_at ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{user.last_login_at}</span>
                                                    </div>
                                                ) : <span className="text-xs">Never</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                                        onClick={() => openEdit(user)}>
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteUser(user)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {users.from}–{users.to} of {users.total}
                                </p>
                                <div className="flex gap-2">
                                    {users.prev_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(users.prev_page_url)}>Previous</Button>
                                    )}
                                    {users.next_page_url && (
                                        <Button variant="outline" size="sm" onClick={() => router.visit(users.next_page_url)}>Next</Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <UserForm
                        onSubmit={submitCreate}
                        processing={createForm.processing}
                        errors={createForm.errors}
                        data={createForm.data}
                        setData={createForm.setData}
                        onClose={() => setCreateOpen(false)}
                        roles={roles}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit User — {editUser?.name}</DialogTitle>
                    </DialogHeader>
                    <UserForm
                        isEdit
                        onSubmit={submitEdit}
                        processing={editForm.processing}
                        errors={editForm.errors}
                        data={editForm.data}
                        setData={editForm.setData}
                        onClose={() => setEditUser(null)}
                        roles={roles}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteUser}
                onOpenChange={(o) => !o && setDeleteUser(null)}
                title="Remove User"
                description={`Remove "${deleteUser?.name}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                confirmLabel="Remove"
                variant="destructive"
            />
        </AppLayout>
    )
}
