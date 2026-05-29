import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle, XCircle, Clock, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAY_BADGE = {
    paid:      'bg-emerald-100 text-emerald-700',
    unpaid:    'bg-red-100 text-red-700',
    half_paid: 'bg-yellow-100 text-yellow-700',
};

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   bg: 'bg-yellow-100 text-yellow-700',  icon: Clock },
    approved:  { label: 'Approved',  bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected:  { label: 'Rejected',  bg: 'bg-red-100 text-red-700',        icon: XCircle },
    cancelled: { label: 'Cancelled', bg: 'bg-gray-100 text-gray-500',      icon: XCircle },
};

function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

function BalanceRing({ used, total, label }) {
    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    const r = 28, circ = 2 * Math.PI * r;
    const stroke = circ * (1 - pct / 100);
    const color = pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#10b981';
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="72" height="72" className="-rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={circ} strokeDashoffset={stroke} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

export default function LeaveBalance({ employee, balances, requests, year, employees }) {
    const [selectedYear, setSelectedYear] = useState(String(year));
    const [selectedEmp, setSelectedEmp]   = useState(String(employee?.id ?? ''));

    function navigate(empId, yr) {
        router.get('/payroll/leave/balance', { employee_id: empId, year: yr });
    }

    function handleYearShift(offset) {
        const y = String(Number(selectedYear) + offset);
        setSelectedYear(y);
        navigate(selectedEmp, y);
    }

    return (
        <AppLayout>
            <Head title="Leave Balance" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Leave Balance</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Employee leave quota and usage</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {employees && (
                                <Select value={selectedEmp} onValueChange={v => { setSelectedEmp(v); navigate(v, selectedYear); }}>
                                    <SelectTrigger className="w-56 h-9 text-sm">
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
                            )}

                            <div className="h-5 w-px bg-border" />

                            <Button variant="outline" size="icon" onClick={() => handleYearShift(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Input type="number" value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                onBlur={() => navigate(selectedEmp, selectedYear)}
                                className="w-24 h-9 text-sm text-center"
                                min="2020" max="2099" />
                            <Button variant="outline" size="icon" onClick={() => handleYearShift(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {employee && (
                    <>
                        {/* Employee Card */}
                        <Card>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">
                                            {employee.first_name} {employee.last_name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                                            <span className="font-mono">{employee.employee_code}</span>
                                            {employee.designation && <span>· {employee.designation}</span>}
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs text-muted-foreground">Year</p>
                                        <p className="text-2xl font-bold text-foreground tabular-nums">{selectedYear}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Balance Grid */}
                        {balances.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {balances.map(bal => (
                                    <Card key={bal.id} className="overflow-hidden">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="font-semibold text-foreground">{bal.leave_type?.name}</div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Badge variant="outline" className="text-[10px] font-mono px-1.5">{bal.leave_type?.code}</Badge>
                                                        {bal.leave_type?.pay_status && (
                                                            <Badge className={cn('text-[10px] px-1.5', PAY_BADGE[bal.leave_type.pay_status])}>
                                                                {bal.leave_type.pay_status.replace('_', ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <BalanceRing used={bal.used_days} total={bal.allocated_days} label="used" />
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-lg bg-muted/40 p-2">
                                                    <p className="text-[10px] text-muted-foreground">Allocated</p>
                                                    <p className="text-lg font-bold tabular-nums">{bal.allocated_days}</p>
                                                </div>
                                                <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                                                    <p className="text-[10px] text-amber-700">Used</p>
                                                    <p className="text-lg font-bold tabular-nums text-amber-700">{bal.used_days}</p>
                                                </div>
                                                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2">
                                                    <p className="text-[10px] text-emerald-700">Balance</p>
                                                    <p className={cn('text-lg font-bold tabular-nums',
                                                        bal.balance_days <= 0 ? 'text-red-600' : 'text-emerald-700'
                                                    )}>{bal.balance_days}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={cn('h-full rounded-full transition-all',
                                                    bal.used_days / bal.allocated_days >= 0.9 ? 'bg-red-500' :
                                                    bal.used_days / bal.allocated_days >= 0.6 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                )} style={{
                                                    width: bal.allocated_days > 0
                                                        ? `${Math.min(100, (bal.used_days / bal.allocated_days) * 100)}%`
                                                        : '0%'
                                                }} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-semibold text-foreground">No allocations for {selectedYear}</p>
                                    <p className="text-sm mt-1">Contact HR to allocate leave for this employee</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Leave History */}
                        {requests.length > 0 && (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="px-4 py-3 border-b">
                                        <h3 className="font-semibold text-sm">Leave History — {selectedYear}</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-muted/30 border-b text-xs">
                                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Leave Type</th>
                                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Period</th>
                                                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-16">Days</th>
                                                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-28">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map(req => {
                                                const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                                                const Icon = cfg.icon;
                                                return (
                                                    <tr key={req.id} className="border-b hover:bg-muted/10 transition-colors">
                                                        <td className="px-4 py-2.5 font-medium">{req.leave_type?.name}</td>
                                                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <CalendarDays className="h-3 w-3 shrink-0" />
                                                                {fmtDate(req.from_date)}
                                                                {req.from_date !== req.to_date && (
                                                                    <> → {fmtDate(req.to_date)}</>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-center font-bold tabular-nums">{req.days}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg.bg)}>
                                                                <Icon className="h-3 w-3" />
                                                                {cfg.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {!employee && (
                    <Card>
                        <CardContent className="py-20 text-center text-muted-foreground">
                            <UserCircle className="h-14 w-14 mx-auto mb-4 opacity-20" />
                            <p className="font-semibold text-foreground">Select an employee</p>
                            <p className="text-sm mt-1">Choose an employee above to view their leave balance</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
