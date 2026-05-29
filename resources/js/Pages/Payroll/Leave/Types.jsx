import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAY_CONFIG = {
    paid:      { label: 'Paid',      bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    unpaid:    { label: 'Unpaid',    bg: 'bg-red-100 text-red-700 border-red-200' },
    half_paid: { label: 'Half Paid', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const TYPE_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
];

function TypeForm({ values, onChange, errors }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={values.name} onChange={e => onChange('name', e.target.value)}
                    placeholder="e.g. Annual Leave"
                    className={errors.name && 'border-destructive'} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={values.code} onChange={e => onChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g. AL" maxLength={20}
                    className={cn('font-mono uppercase', errors.code && 'border-destructive')} />
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="space-y-1.5">
                <Label>Days Per Year <span className="text-destructive">*</span></Label>
                <Input type="number" min="0" max="365" step="0.5" value={values.days_per_year}
                    onChange={e => onChange('days_per_year', e.target.value)}
                    className={errors.days_per_year && 'border-destructive'} />
                {errors.days_per_year && <p className="text-xs text-destructive">{errors.days_per_year}</p>}
            </div>
            <div className="space-y-1.5">
                <Label>Pay Status <span className="text-destructive">*</span></Label>
                <Select value={values.pay_status} onValueChange={v => onChange('pay_status', v)}>
                    <SelectTrigger className={errors.pay_status && 'border-destructive'}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="half_paid">Half Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea value={values.description} onChange={e => onChange('description', e.target.value)}
                    placeholder="Optional description..." rows={2} />
            </div>
            <div className="col-span-2 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                    <Switch checked={values.carry_forward} onCheckedChange={v => onChange('carry_forward', v)} id="cf" />
                    <Label htmlFor="cf" className="cursor-pointer">Carry Forward</Label>
                </div>
                {values.carry_forward && (
                    <div className="flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap text-muted-foreground">Max Days</Label>
                        <Input type="number" min="0" className="w-20 h-8 text-xs" value={values.carry_forward_max}
                            onChange={e => onChange('carry_forward_max', e.target.value)}
                            placeholder="∞" />
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Switch checked={values.requires_approval} onCheckedChange={v => onChange('requires_approval', v)} id="ra" />
                    <Label htmlFor="ra" className="cursor-pointer">Requires Approval</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={values.is_active} onCheckedChange={v => onChange('is_active', v)} id="ia" />
                    <Label htmlFor="ia" className="cursor-pointer">Active</Label>
                </div>
            </div>
        </div>
    );
}

export default function LeaveTypes({ types }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const empty = {
        name: '', code: '', days_per_year: 12, carry_forward: false,
        carry_forward_max: '', pay_status: 'paid', requires_approval: true,
        description: '', is_active: true,
    };

    const createForm = useForm(empty);
    const editForm   = useForm(empty);

    function openEdit(type) {
        setEditTarget(type);
        editForm.setData({
            name:              type.name,
            code:              type.code,
            days_per_year:     type.days_per_year,
            carry_forward:     type.carry_forward,
            carry_forward_max: type.carry_forward_max ?? '',
            pay_status:        type.pay_status,
            requires_approval: type.requires_approval,
            description:       type.description ?? '',
            is_active:         type.is_active,
        });
    }

    function submitCreate(e) {
        e.preventDefault();
        createForm.post('/payroll/leave/types', {
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/payroll/leave/types/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        router.delete(`/payroll/leave/types/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const activeCount = types.filter(t => t.is_active).length;
    const totalDays   = types.reduce((s, t) => s + Number(t.days_per_year), 0);

    return (
        <AppLayout>
            <Head title="Leave Types" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Leave Types</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Configure leave categories and policies</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Leave Type
                    </Button>
                </div>

                {/* Summary bar */}
                {types.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Types', value: types.length, color: 'text-foreground' },
                            { label: 'Active',      value: activeCount,  color: 'text-emerald-600' },
                            { label: 'Total Days/Year', value: totalDays, color: 'text-primary' },
                        ].map(({ label, value, color }) => (
                            <Card key={label}>
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className={cn('text-2xl font-bold tabular-nums mt-0.5', color)}>{value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Cards */}
                <div className="grid gap-3">
                    {types.map((type, i) => {
                        const pay = PAY_CONFIG[type.pay_status] ?? PAY_CONFIG.paid;
                        const colorBg = TYPE_COLORS[i % TYPE_COLORS.length];
                        return (
                            <Card key={type.id} className={cn('transition-shadow hover:shadow-sm', !type.is_active && 'opacity-60')}>
                                <CardContent className="p-0">
                                    <div className="flex items-stretch">
                                        {/* Color bar */}
                                        <div className={cn('w-1.5 rounded-l-lg shrink-0', colorBg)} />

                                        <div className="flex-1 px-5 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    {/* Title row */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-foreground text-sm">{type.name}</h3>
                                                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 h-4">{type.code}</Badge>
                                                        <Badge className={cn('text-[10px] px-1.5 h-4 border', pay.bg)}>{pay.label}</Badge>
                                                        {!type.is_active && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 text-muted-foreground">Inactive</Badge>
                                                        )}
                                                    </div>

                                                    {type.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{type.description}</p>
                                                    )}

                                                    {/* Attributes */}
                                                    <div className="flex flex-wrap items-center gap-4 mt-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                                            <span><span className="font-semibold text-foreground">{type.days_per_year}</span> days/year</span>
                                                        </div>
                                                        {type.carry_forward && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                                                                <span>Carry forward: <span className="font-semibold text-foreground">{type.carry_forward_max ?? 'unlimited'} days</span></span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            {type.requires_approval ? (
                                                                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                                                            ) : (
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                            )}
                                                            <span>{type.requires_approval ? 'Requires approval' : 'Auto-approved'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(type)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                                        onClick={() => setDeleteTarget(type)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {types.length === 0 && (
                        <Card>
                            <CardContent className="py-20 text-center text-muted-foreground">
                                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-semibold text-foreground">No leave types configured</p>
                                <p className="text-sm mt-1">Add your first leave type to get started</p>
                                <Button className="mt-4" onClick={() => setShowCreate(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Leave Type
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={v => { if (!v) { setShowCreate(false); createForm.clearErrors(); } }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Leave Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate}>
                        <div className="py-4">
                            <TypeForm values={createForm.data} onChange={(k, v) => createForm.setData(k, v)} errors={createForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Create Leave Type</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit — {editTarget?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="py-4">
                            <TypeForm values={editForm.data} onChange={(k, v) => editForm.setData(k, v)} errors={editForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Leave Type?</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
                            This will also remove all allocations and may affect pending leave requests.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
