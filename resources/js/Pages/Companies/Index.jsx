import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2, Building2, Users, DollarSign, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const planColors = {
    free: 'secondary', starter: 'warning', professional: 'success', enterprise: 'default',
}

const emptyForm = {
    name: '', legal_name: '', email: '', phone: '', industry: '', company_type: 'private_limited',
    address_line1: '', city: '', state: '', country: 'India', pincode: '',
    currency: 'INR', currency_symbol: '₹', subscription_plan: 'professional',
    is_active: true, gst_registered: true, tds_applicable: true,
}

export default function CompaniesIndex({ companies = [] }) {
    const [createOpen, setCreateOpen] = useState(false)
    const [editCompany, setEditCompany] = useState(null)
    const [deleteCompany, setDeleteCompany] = useState(null)

    const createForm = useForm({ ...emptyForm })
    const editForm   = useForm({ ...emptyForm })

    const openEdit = (c) => {
        setEditCompany(c)
        editForm.setData({
            name: c.name ?? '', legal_name: c.legal_name ?? '', email: c.email ?? '',
            phone: c.phone ?? '', industry: c.industry ?? '', company_type: c.company_type ?? 'private_limited',
            address_line1: c.address_line1 ?? '', city: c.city ?? '', state: c.state ?? '',
            country: c.country ?? 'India', pincode: c.pincode ?? '',
            currency: c.currency ?? 'INR', currency_symbol: c.currency_symbol ?? '₹',
            subscription_plan: c.subscription_plan ?? 'professional',
            is_active: !!c.is_active, gst_registered: !!c.gst_registered, tds_applicable: !!c.tds_applicable,
        })
    }

    const submitCreate = (e) => {
        e.preventDefault()
        createForm.post('/companies', {
            onSuccess: () => { setCreateOpen(false); createForm.reset() },
        })
    }

    const submitEdit = (e) => {
        e.preventDefault()
        editForm.put(`/companies/${editCompany.id}`, {
            onSuccess: () => setEditCompany(null),
        })
    }

    const confirmDelete = () => {
        router.delete(`/companies/${deleteCompany.id}`, {
            onSuccess: () => setDeleteCompany(null),
        })
    }

    const stats = {
        total:    companies.length,
        active:   companies.filter((c) => c.is_active).length,
        users:    companies.reduce((s, c) => s + (c.users_count ?? 0), 0),
        pro:      companies.filter((c) => c.subscription_plan === 'professional' || c.subscription_plan === 'enterprise').length,
    }

    return (
        <AppLayout>
            <Head title="Companies" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Companies</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage all registered companies</p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Company
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total Companies', value: stats.total,  icon: Building2, color: 'text-blue-500' },
                        { label: 'Active',           value: stats.active, icon: CheckCircle, color: 'text-green-500' },
                        { label: 'Total Users',      value: stats.users,  icon: Users,    color: 'text-purple-500' },
                        { label: 'Pro / Enterprise', value: stats.pro,    icon: DollarSign, color: 'text-orange-500' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">{s.label}</div>
                                    <div className="text-xl font-bold">{s.value}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">Users</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No companies found.
                                        </TableCell>
                                    </TableRow>
                                ) : companies.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="font-medium">{c.name}</div>
                                            {c.legal_name && c.legal_name !== c.name && (
                                                <div className="text-xs text-muted-foreground">{c.legal_name}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{c.email ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{c.phone ?? ''}</div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {[c.city, c.state, c.country].filter(Boolean).join(', ') || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={planColors[c.subscription_plan] ?? 'secondary'} className="capitalize">
                                                {c.subscription_plan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{c.users_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.is_active ? 'success' : 'secondary'}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(c)}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon-sm" variant="ghost" onClick={() => setDeleteCompany(c)}
                                                    className="text-destructive hover:text-destructive">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Add New Company</DialogTitle></DialogHeader>
                    <CompanyForm form={createForm} onSubmit={submitCreate} onCancel={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editCompany} onOpenChange={(v) => !v && setEditCompany(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit — {editCompany?.name}</DialogTitle></DialogHeader>
                    <CompanyForm form={editForm} onSubmit={submitEdit} onCancel={() => setEditCompany(null)} isEdit />
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <ConfirmDialog
                open={!!deleteCompany}
                onOpenChange={(v) => !v && setDeleteCompany(null)}
                title={`Delete ${deleteCompany?.name}?`}
                description="This will permanently delete the company and all associated data. This action cannot be undone."
                confirmLabel="Delete Company"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    )
}

function CompanyForm({ form, onSubmit, onCancel, isEdit = false }) {
    const { data, setData, processing, errors } = form

    const field = (name, label, props = {}) => (
        <div className="space-y-1">
            <label className="text-sm font-medium">{label}</label>
            <Input value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} {...props} />
            {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
        </div>
    )

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
                {field('name', 'Company Name *')}
                {field('legal_name', 'Legal Name')}
                {field('email', 'Email', { type: 'email' })}
                {field('phone', 'Phone')}
                {field('industry', 'Industry')}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Company Type</label>
                    <select value={data.company_type} onChange={(e) => setData('company_type', e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        {[['private_limited','Private Limited'],['public_limited','Public Limited'],['llp','LLP'],
                          ['partnership','Partnership'],['sole_proprietorship','Sole Proprietorship'],['ngo','NGO']].map(([v, l]) =>
                            <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {field('address_line1', 'Address')}
                {field('city', 'City')}
                {field('state', 'State')}
                {field('country', 'Country')}
                {field('pincode', 'PIN Code')}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Subscription Plan</label>
                    <select value={data.subscription_plan} onChange={(e) => setData('subscription_plan', e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        {['free','starter','professional','enterprise'].map((p) =>
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} />
                    <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={data.gst_registered} onCheckedChange={(v) => setData('gst_registered', v)} />
                    <span className="text-sm font-medium">GST Registered</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={data.tds_applicable} onCheckedChange={(v) => setData('tds_applicable', v)} />
                    <span className="text-sm font-medium">TDS Applicable</span>
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" loading={processing}>{isEdit ? 'Save Changes' : 'Create Company'}</Button>
            </div>
        </form>
    )
}
