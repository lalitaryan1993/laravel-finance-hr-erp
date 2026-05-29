import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, CheckCircle, XCircle, Clock, CalendarDays, ChevronLeft, ChevronRight, UmbrellaOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   bg: 'bg-yellow-100 text-yellow-700',  icon: Clock,        ring: 'ring-yellow-200' },
    approved:  { label: 'Approved',  bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, ring: 'ring-emerald-200' },
    rejected:  { label: 'Rejected',  bg: 'bg-red-100 text-red-700',        icon: XCircle,      ring: 'ring-red-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100 text-gray-500',      icon: XCircle,      ring: 'ring-gray-200' },
};

function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}
function fmtShort(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
}

export default function LeaveIndex({ requests, stats, employees, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [empFilter, setEmpFilter]       = useState(filters?.employee_id ? String(filters.employee_id) : 'all');
    const [rejectTarget, setRejectTarget] = useState(null);

    const rejectForm = useForm({ rejection_reason: '' });

    function applyFilters() {
        router.get('/payroll/leave', {
            status:      statusFilter !== 'all' ? statusFilter : undefined,
            employee_id: empFilter    !== 'all' ? empFilter    : undefined,
        }, { preserveState: true });
    }

    function handleApprove(id) {
        if (!confirm('Approve this leave request?')) return;
        router.post(`/payroll/leave/${id}/approve`);
    }

    function handleCancel(id) {
        if (!confirm('Cancel this leave request?')) return;
        router.post(`/payroll/leave/${id}/cancel`);
    }

    function submitReject(e) {
        e.preventDefault();
        rejectForm.post(`/payroll/leave/${rejectTarget.id}/reject`, {
            onSuccess: () => { setRejectTarget(null); rejectForm.reset(); },
        });
    }

    // Laravel paginator: prev_page_url / next_page_url (not links.prev / links.next)
    const rows = requests?.data ?? [];
    const currentPage = requests?.current_page ?? 1;
    const lastPage    = requests?.last_page    ?? 1;
    const prevUrl     = requests?.prev_page_url ?? null;
    const nextUrl     = requests?.next_page_url ?? null;

    return (
        <AppLayout>
            <Head title="Leave Requests" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage and approve employee leave</p>
                    </div>
                    <Link href="/payroll/leave/apply">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Apply Leave
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Pending Review', value: stats.pending,  bg: 'bg-yellow-50 border-yellow-100',  color: 'text-yellow-600',  icon: Clock },
                        { label: 'Approved',       value: stats.approved, bg: 'bg-emerald-50 border-emerald-100',color: 'text-emerald-600', icon: CheckCircle },
                        { label: 'Rejected',       value: stats.rejected, bg: 'bg-red-50 border-red-100',        color: 'text-red-600',     icon: XCircle },
                    ].map(({ label, value, bg, color, icon: Icon }) => (
                        <Card key={label} className={cn(bg)}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={cn('h-10 w-10 rounded-xl bg-white/80 flex items-center justify-center', color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        <p className={cn('text-3xl font-bold tabular-nums', color)}>{value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pending callout */}
                {stats.pending > 0 && (
                    <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
                        <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                        <p className="text-sm text-yellow-800 font-medium">
                            {stats.pending} leave request{stats.pending > 1 ? 's' : ''} pending your approval.
                        </p>
                        <Button size="sm" variant="outline" className="ml-auto h-7 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                            onClick={() => {
                                setStatusFilter('pending');
                                router.get('/payroll/leave', { status: 'pending' }, { preserveState: true });
                            }}>
                            View Pending
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 h-8 text-xs">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={empFilter} onValueChange={setEmpFilter}>
                                <SelectTrigger className="w-52 h-8 text-xs">
                                    <SelectValue placeholder="All Employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.first_name} {e.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button size="sm" className="h-8 text-xs" onClick={applyFilters}>Apply</Button>
                            {(statusFilter !== 'all' || empFilter !== 'all') && (
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground"
                                    onClick={() => { setStatusFilter('all'); setEmpFilter('all'); router.get('/payroll/leave'); }}>
                                    Clear
                                </Button>
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
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Period</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-14">Days</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Reason</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground w-28">Status</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-44">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(req => {
                                    const cfg   = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                                    const Icon  = cfg.icon;
                                    const isPending = req.status === 'pending';
                                    return (
                                        <tr key={req.id} className={cn(
                                            'border-b transition-colors',
                                            isPending ? 'bg-yellow-50/30 hover:bg-yellow-50/50' : 'hover:bg-muted/20'
                                        )}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                                        {req.employee?.first_name?.[0]}{req.employee?.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground leading-tight">
                                                            {req.employee?.first_name} {req.employee?.last_name}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">{req.employee?.employee_code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-sm">{req.leave_type?.name}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground">{req.leave_type?.code}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-xs font-medium">
                                                    <CalendarDays className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span>{fmtShort(req.from_date)}</span>
                                                    {req.from_date !== req.to_date && <>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span>{fmtShort(req.to_date)}</span>
                                                    </>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums">
                                                    {req.days}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[160px]">
                                                <span className="line-clamp-2">{req.reason || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg)}>
                                                    <Icon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isPending && (
                                                        <>
                                                            <Button size="sm" variant="ghost"
                                                                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                onClick={() => handleApprove(req.id)}>
                                                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="ghost"
                                                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => setRejectTarget(req)}>
                                                                <XCircle className="h-3 w-3 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {['pending', 'approved'].includes(req.status) && (
                                                        <Button size="sm" variant="ghost"
                                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                            onClick={() => handleCancel(req.id)}>
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {rows.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground">
                                <UmbrellaOff className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-semibold text-foreground">No leave requests found</p>
                                <p className="text-sm mt-1">
                                    {statusFilter !== 'all' || empFilter !== 'all' ? 'Try adjusting the filters above' : 'Submit the first leave request'}
                                </p>
                                {statusFilter === 'all' && empFilter === 'all' && (
                                    <Link href="/payroll/leave/apply">
                                        <Button variant="outline" size="sm" className="mt-4">Apply Leave</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" size="sm" disabled={!prevUrl}
                            onClick={() => prevUrl && router.get(prevUrl)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page <span className="font-medium text-foreground">{currentPage}</span> of {lastPage}
                        </span>
                        <Button variant="outline" size="sm" disabled={!nextUrl}
                            onClick={() => nextUrl && router.get(nextUrl)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={v => !v && setRejectTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4 py-2">
                        <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
                            <div className="font-medium">{rejectTarget?.employee?.first_name} {rejectTarget?.employee?.last_name}</div>
                            <div className="text-muted-foreground text-xs mt-0.5">
                                {rejectTarget?.leave_type?.name} · {rejectTarget?.days} days · {fmtDate(rejectTarget?.from_date)} – {fmtDate(rejectTarget?.to_date)}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Reason for Rejection <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea rows={3} placeholder="Explain why this request is rejected..."
                                value={rejectForm.data.rejection_reason}
                                onChange={e => rejectForm.setData('rejection_reason', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
