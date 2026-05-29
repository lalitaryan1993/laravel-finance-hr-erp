import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { ShieldCheck, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const BLANK = {
    name: '', category_id: '', max_amount: '',
    requires_receipt: true, requires_approval: true,
    approval_threshold: '', applicable_to: 'all', is_active: true,
}

export default function ExpensePolicies({ policies = [], categories = [] }) {
    const [open,       setOpen]       = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [delTarget,  setDelTarget]  = useState(null)
    const [form,       setForm]       = useState(BLANK)
    const [processing, setProcessing] = useState(false)

    function openCreate() {
        setForm(BLANK)
        setEditTarget(null)
        setOpen(true)
    }

    function openEdit(policy) {
        setForm({
            name:                policy.name,
            category_id:         policy.category_id ?? '',
            max_amount:          policy.max_amount ?? '',
            requires_receipt:    !!policy.requires_receipt,
            requires_approval:   !!policy.requires_approval,
            approval_threshold:  policy.approval_threshold ?? '',
            applicable_to:       policy.applicable_to ?? 'all',
            is_active:           !!policy.is_active,
        })
        setEditTarget(policy)
        setOpen(true)
    }

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function submit(e) {
        e.preventDefault()
        setProcessing(true)
        const payload = {
            ...form,
            max_amount:          form.max_amount === '' ? null : parseFloat(form.max_amount),
            requires_receipt:    form.requires_receipt  ? 1 : 0,
            requires_approval:   form.requires_approval ? 1 : 0,
            is_active:           form.is_active         ? 1 : 0,
        }

        if (editTarget) {
            router.put(`/expenses/policies/${editTarget.id}`, payload, {
                onFinish: () => { setProcessing(false); setOpen(false) },
            })
        } else {
            router.post('/expenses/policies', payload, {
                onFinish: () => { setProcessing(false); setOpen(false) },
            })
        }
    }

    function doDelete() {
        if (!delTarget) return
        setProcessing(true)
        router.delete(`/expenses/policies/${delTarget.id}`, {
            onFinish: () => { setProcessing(false); setDelTarget(null) },
        })
    }

    return (
        <AppLayout>
            <Head title="Expense Policies" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Expense Policies</h1>
                        <p className="text-muted-foreground text-sm mt-1">Rules and spending limits for expense reimbursement</p>
                    </div>
                    <Button className="gap-2" onClick={openCreate}>
                        <Plus className="w-4 h-4" /> New Policy
                    </Button>
                </div>

                {policies.length === 0 ? (
                    <Card>
                        <CardContent className="py-20 flex flex-col items-center text-muted-foreground">
                            <ShieldCheck className="w-12 h-12 mb-3 opacity-30" />
                            <p className="font-medium">No policies defined yet</p>
                            <p className="text-sm mt-1">Create your first expense policy to enforce spending limits</p>
                            <Button className="mt-4 gap-2" onClick={openCreate}>
                                <Plus className="w-4 h-4" /> Create Policy
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {policies.map(policy => (
                            <Card key={policy.id} className={cn(!policy.is_active && 'opacity-60')}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                                            <CardTitle className="text-base leading-tight">{policy.name}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEdit(policy)}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setDelTarget(policy)}
                                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {policy.category && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Category</span>
                                            <Badge variant="outline" className="text-xs">{policy.category.name}</Badge>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Spending Limit</span>
                                        <span className="font-medium">
                                            {policy.max_amount ? formatCurrency(policy.max_amount) : 'No limit'}
                                        </span>
                                    </div>
                                    {policy.approval_threshold && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Approval Above</span>
                                            <span className="font-medium">{policy.approval_threshold}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Receipt Required</span>
                                        {policy.requires_receipt
                                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            : <XCircle className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Requires Approval</span>
                                        {policy.requires_approval
                                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            : <XCircle className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Applies To</span>
                                        <span className="capitalize font-medium">{policy.applicable_to ?? 'All'}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={policy.is_active ? 'default' : 'secondary'} className="text-xs">
                                            {policy.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? 'Edit Policy' : 'New Expense Policy'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label>Policy Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                placeholder="e.g. Travel Expenses"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Category</Label>
                                <select
                                    value={form.category_id}
                                    onChange={e => set('category_id', e.target.value)}
                                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background h-9"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Max Amount (₹)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.max_amount}
                                    onChange={e => set('max_amount', e.target.value)}
                                    placeholder="Leave blank for no limit"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Approval Threshold</Label>
                                <Input
                                    value={form.approval_threshold}
                                    onChange={e => set('approval_threshold', e.target.value)}
                                    placeholder="e.g. ₹5,000"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Applies To</Label>
                                <select
                                    value={form.applicable_to}
                                    onChange={e => set('applicable_to', e.target.value)}
                                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background h-9"
                                >
                                    <option value="all">All Employees</option>
                                    <option value="role">By Role</option>
                                    <option value="department">By Department</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-1">
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer">Requires Receipt</Label>
                                <Switch
                                    checked={form.requires_receipt}
                                    onCheckedChange={v => set('requires_receipt', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer">Requires Approval</Label>
                                <Switch
                                    checked={form.requires_approval}
                                    onCheckedChange={v => set('requires_approval', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="cursor-pointer">Active</Label>
                                <Switch
                                    checked={form.is_active}
                                    onCheckedChange={v => set('is_active', v)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {editTarget ? 'Update Policy' : 'Create Policy'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!delTarget} onOpenChange={open => !open && setDelTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Policy</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <span className="font-medium text-foreground">"{delTarget?.name}"</span>? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setDelTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={doDelete} disabled={processing}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
