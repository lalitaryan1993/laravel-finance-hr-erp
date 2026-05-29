import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Users, ChevronLeft, ChevronRight, Layers, CircleSlash } from 'lucide-react';
import { cn } from '@/lib/utils';

function BalanceBar({ used, total }) {
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all',
                    pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                )} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
        </div>
    );
}

export default function LeaveAllocations({ employees, types, allocations, year }) {
    const [selectedYear, setSelectedYear] = useState(String(year));
    const [showIndividual, setShowIndividual] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');

    const indForm = useForm({
        employee_id:    '',
        leave_type_id:  '',
        year:           String(year),
        allocated_days: '',
    });

    const bulkForm = useForm({
        leave_type_id:  '',
        year:           String(year),
        allocated_days: '',
    });

    function applyYear() {
        router.get('/payroll/leave/allocations', { year: selectedYear }, { preserveState: true });
    }

    function submitIndividual(e) {
        e.preventDefault();
        indForm.post('/payroll/leave/allocations', {
            onSuccess: () => { setShowIndividual(false); indForm.reset(); },
        });
    }

    function submitBulk(e) {
        e.preventDefault();
        bulkForm.post('/payroll/leave/allocations/bulk', {
            onSuccess: () => { setShowBulk(false); bulkForm.reset(); },
        });
    }

    const filtered = typeFilter !== 'all'
        ? allocations.filter(a => String(a.leave_type_id) === typeFilter)
        : allocations;

    const totalAllocated = filtered.reduce((s, a) => s + Number(a.allocated_days), 0);
    const totalUsed      = filtered.reduce((s, a) => s + Number(a.used_days), 0);
    const totalBalance   = filtered.reduce((s, a) => s + Number(a.balance_days), 0);

    return (
        <AppLayout>
            <Head title="Leave Allocations" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Leave Allocations</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage employee leave balances for {year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setShowBulk(true)}>
                            <Users className="h-4 w-4 mr-2" />
                            Bulk Allocate
                        </Button>
                        <Button onClick={() => setShowIndividual(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Allocate
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Allocated', value: totalAllocated, color: 'text-primary' },
                        { label: 'Total Used',      value: totalUsed,      color: 'text-amber-600' },
                        { label: 'Total Balance',   value: totalBalance,   color: 'text-emerald-600' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className={cn('text-3xl font-bold tabular-nums mt-0.5', color)}>{value}</p>
                                <p className="text-xs text-muted-foreground">days</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="outline" size="icon" onClick={() => {
                                const y = String(Number(selectedYear) - 1);
                                setSelectedYear(y);
                                router.get('/payroll/leave/allocations', { year: y });
                            }}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Input type="number" value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                onBlur={applyYear}
                                className="w-24 h-9 text-sm text-center"
                                min="2020" max="2099" />
                            <Button variant="outline" size="icon" onClick={() => {
                                const y = String(Number(selectedYear) + 1);
                                setSelectedYear(y);
                                router.get('/payroll/leave/allocations', { year: y });
                            }}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <div className="h-5 w-px bg-border" />

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-48 h-9 text-sm">
                                    <SelectValue placeholder="All Leave Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Leave Types</SelectItem>
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {typeFilter !== 'all' && (
                                <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground"
                                    onClick={() => setTypeFilter('all')}>Clear</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 border-b">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Leave Type</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Allocated</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Used</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Balance</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground w-40 hidden lg:table-cell">Usage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(alloc => (
                                    <tr key={alloc.id} className="border-b hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                                    {alloc.employee?.first_name?.[0]}{alloc.employee?.last_name?.[0]}
                                                </div>
                                                <div className="font-medium text-foreground leading-tight">
                                                    {alloc.employee?.first_name} {alloc.employee?.last_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{alloc.leave_type?.name}</div>
                                            <div className="text-[10px] font-mono text-muted-foreground">{alloc.leave_type?.code}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{alloc.allocated_days}</td>
                                        <td className="px-4 py-3 text-right tabular-nums text-amber-600 font-medium">{alloc.used_days}</td>
                                        <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-600">{alloc.balance_days}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <BalanceBar used={alloc.used_days} total={alloc.allocated_days} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filtered.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground">
                                <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-semibold text-foreground">No allocations found</p>
                                <p className="text-sm mt-1">
                                    {typeFilter !== 'all' ? 'Try clearing the filter' : `No leave allocated for ${year} yet`}
                                </p>
                                {typeFilter === 'all' && (
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <Button variant="outline" size="sm" onClick={() => setShowBulk(true)}>
                                            <Users className="h-4 w-4 mr-1.5" /> Bulk Allocate
                                        </Button>
                                        <Button size="sm" onClick={() => setShowIndividual(true)}>
                                            <Plus className="h-4 w-4 mr-1.5" /> Allocate
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Individual Allocation Dialog */}
            <Dialog open={showIndividual} onOpenChange={v => { if (!v) { setShowIndividual(false); indForm.clearErrors(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Allocate Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitIndividual} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Employee <span className="text-destructive">*</span></Label>
                            <Select value={indForm.data.employee_id} onValueChange={v => indForm.setData('employee_id', v)}>
                                <SelectTrigger className={cn(indForm.errors.employee_id && 'border-destructive')}>
                                    <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.first_name} {e.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {indForm.errors.employee_id && <p className="text-xs text-destructive">{indForm.errors.employee_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Leave Type <span className="text-destructive">*</span></Label>
                            <Select value={indForm.data.leave_type_id} onValueChange={v => indForm.setData('leave_type_id', v)}>
                                <SelectTrigger className={cn(indForm.errors.leave_type_id && 'border-destructive')}>
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {indForm.errors.leave_type_id && <p className="text-xs text-destructive">{indForm.errors.leave_type_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Year <span className="text-destructive">*</span></Label>
                                <Input type="number" value={indForm.data.year}
                                    onChange={e => indForm.setData('year', e.target.value)}
                                    min="2020" max="2099" />
                                {indForm.errors.year && <p className="text-xs text-destructive">{indForm.errors.year}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Days <span className="text-destructive">*</span></Label>
                                <Input type="number" value={indForm.data.allocated_days}
                                    onChange={e => indForm.setData('allocated_days', e.target.value)}
                                    min="0" max="365" step="0.5" placeholder="e.g. 12" />
                                {indForm.errors.allocated_days && <p className="text-xs text-destructive">{indForm.errors.allocated_days}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowIndividual(false)}>Cancel</Button>
                            <Button type="submit" disabled={indForm.processing}>Allocate</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Allocation Dialog */}
            <Dialog open={showBulk} onOpenChange={v => { if (!v) { setShowBulk(false); bulkForm.clearErrors(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bulk Allocate Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitBulk} className="space-y-4 py-2">
                        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                            <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>This will allocate leave to <strong>all active employees</strong>. Existing allocations for the same year and type will be reset.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Leave Type <span className="text-destructive">*</span></Label>
                            <Select value={bulkForm.data.leave_type_id} onValueChange={v => bulkForm.setData('leave_type_id', v)}>
                                <SelectTrigger className={cn(bulkForm.errors.leave_type_id && 'border-destructive')}>
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name} <span className="text-muted-foreground text-xs ml-1">({t.days_per_year} days/yr)</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {bulkForm.errors.leave_type_id && <p className="text-xs text-destructive">{bulkForm.errors.leave_type_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Year <span className="text-destructive">*</span></Label>
                                <Input type="number" value={bulkForm.data.year}
                                    onChange={e => bulkForm.setData('year', e.target.value)}
                                    min="2020" max="2099" />
                                {bulkForm.errors.year && <p className="text-xs text-destructive">{bulkForm.errors.year}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Days Each <span className="text-destructive">*</span></Label>
                                <Input type="number" value={bulkForm.data.allocated_days}
                                    onChange={e => bulkForm.setData('allocated_days', e.target.value)}
                                    min="0" max="365" step="0.5" placeholder="e.g. 12" />
                                {bulkForm.errors.allocated_days && <p className="text-xs text-destructive">{bulkForm.errors.allocated_days}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowBulk(false)}>Cancel</Button>
                            <Button type="submit" disabled={bulkForm.processing}>
                                {bulkForm.processing ? 'Allocating...' : `Allocate to All (${employees.length})`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
