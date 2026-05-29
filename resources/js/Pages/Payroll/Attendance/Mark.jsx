import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, ChevronLeft, ChevronRight, Users, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUSES = [
    { value: 'present',  label: 'Present',        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'absent',   label: 'Absent',          badge: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'half_day', label: 'Half Day',        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'late',     label: 'Late',            badge: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'wfh',      label: 'WFH',             badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'leave',    label: 'On Leave',        badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'holiday',  label: 'Holiday',         badge: 'bg-gray-100 text-gray-500 border-gray-200' },
    { value: 'on_duty',  label: 'On Duty',         badge: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.value, s]));

// DB returns "HH:MM:SS" — input[type=time] needs "HH:MM"
function toTimeInput(val) {
    if (!val) return '';
    return String(val).slice(0, 5);
}

export default function AttendanceMark({ employees, existing, date, departments }) {
    const [selectedDate, setSelectedDate] = useState(date);
    const [deptFilter, setDeptFilter]     = useState('all');
    const [bulkStatus, setBulkStatus]     = useState('present');
    const [submitting, setSubmitting]     = useState(false);

    // Build initial records — fix check_in/check_out to HH:MM format
    const [records, setRecords] = useState(() =>
        employees.map(emp => {
            const ex = existing?.[emp.id] ?? existing?.[String(emp.id)];
            return {
                employee_id: emp.id,
                status:    ex?.status    ?? 'present',
                check_in:  toTimeInput(ex?.check_in),
                check_out: toTimeInput(ex?.check_out),
                notes:     ex?.notes     ?? '',
            };
        })
    );

    function updateRecord(idx, field, value) {
        setRecords(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    }

    function applyBulkStatus() {
        const indices = filteredIndices.map(({ idx }) => idx);
        setRecords(prev => {
            const next = [...prev];
            indices.forEach(i => { next[i] = { ...next[i], status: bulkStatus }; });
            return next;
        });
    }

    function markAllPresent() {
        const indices = filteredIndices.map(({ idx }) => idx);
        setRecords(prev => {
            const next = [...prev];
            indices.forEach(i => { next[i] = { ...next[i], status: 'present' }; });
            return next;
        });
    }

    function goToDate(offset) {
        const d = new Date(selectedDate + 'T00:00:00');
        d.setDate(d.getDate() + offset);
        router.get('/payroll/attendance/mark', { date: d.toISOString().slice(0, 10) });
    }

    function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        // Convert empty strings to null so backend nullable|date_format:H:i passes
        const cleaned = records.map(r => ({
            ...r,
            check_in:  r.check_in  || null,
            check_out: r.check_out || null,
            notes:     r.notes     || null,
        }));
        router.post('/payroll/attendance/bulk', { date: selectedDate, records: cleaned }, {
            onFinish: () => setSubmitting(false),
        });
    }

    const filteredIndices = useMemo(() =>
        employees.map((emp, idx) => ({ emp, idx }))
            .filter(({ emp }) => deptFilter === 'all' || String(emp.department_id) === deptFilter),
        [employees, deptFilter]
    );

    // Live stats from current records
    const stats = useMemo(() => {
        const r = filteredIndices.map(({ idx }) => records[idx]);
        return {
            present:  r.filter(x => ['present', 'wfh', 'on_duty'].includes(x.status)).length,
            absent:   r.filter(x => x.status === 'absent').length,
            leave:    r.filter(x => x.status === 'leave').length,
            other:    r.filter(x => ['half_day', 'late', 'holiday'].includes(x.status)).length,
            total:    r.length,
        };
    }, [records, filteredIndices]);

    const attendancePct = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

    const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <AppLayout>
            <Head title="Mark Attendance" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{displayDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => goToDate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => router.get('/payroll/attendance/mark', { date: e.target.value })}
                            className="h-9 rounded-md border border-input px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Button variant="outline" size="icon" onClick={() => goToDate(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Attendance Rate + Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="col-span-2 lg:col-span-1">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
                            <p className={cn('text-3xl font-bold tabular-nums',
                                attendancePct >= 90 ? 'text-emerald-600' : attendancePct >= 70 ? 'text-yellow-600' : 'text-red-600'
                            )}>{attendancePct}%</p>
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all duration-500',
                                    attendancePct >= 90 ? 'bg-emerald-500' : attendancePct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                )} style={{ width: `${attendancePct}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                    {[
                        { label: 'Present', value: stats.present, color: 'text-emerald-600', icon: CheckCircle },
                        { label: 'Absent',  value: stats.absent,  color: 'text-red-600',     icon: XCircle },
                        { label: 'Other',   value: stats.other + stats.leave, color: 'text-yellow-600', icon: Clock },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <Card key={label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className={cn('h-5 w-5', color)} />
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Toolbar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium text-muted-foreground shrink-0">Bulk:</span>
                            </div>

                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger className="w-44 h-8 text-xs">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={bulkStatus} onValueChange={setBulkStatus}>
                                <SelectTrigger className={cn('w-36 h-8 text-xs border', STATUS_MAP[bulkStatus]?.badge)}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={applyBulkStatus}>
                                Apply to Visible
                            </Button>

                            <div className="h-4 w-px bg-border" />

                            <Button size="sm" variant="outline"
                                className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={markAllPresent}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                All Present
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/40 border-b">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground w-40">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28 hidden lg:table-cell">Check In</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28 hidden lg:table-cell">Check Out</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIndices.map(({ emp, idx }) => {
                                        const rec = records[idx];
                                        const statusInfo = STATUS_MAP[rec.status];
                                        return (
                                            <tr key={emp.id} className={cn(
                                                'border-b transition-colors',
                                                rec.status === 'absent'  ? 'bg-red-50/30 hover:bg-red-50/50' :
                                                rec.status === 'present' ? 'hover:bg-emerald-50/20' :
                                                'hover:bg-muted/20'
                                            )}>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-foreground text-sm">{emp.first_name} {emp.last_name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{emp.employee_code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">
                                                    {emp.department?.name ?? '—'}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <Select value={rec.status} onValueChange={v => updateRecord(idx, 'status', v)}>
                                                        <SelectTrigger className={cn('h-7 text-xs border font-medium', statusInfo?.badge)}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STATUSES.map(s => (
                                                                <SelectItem key={s.value} value={s.value}>
                                                                    <span className={cn('text-xs font-medium', s.badge.split(' ')[1])}>{s.label}</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-2.5 hidden lg:table-cell">
                                                    <Input type="time" value={rec.check_in}
                                                        onChange={e => updateRecord(idx, 'check_in', e.target.value)}
                                                        className="h-7 text-xs w-28 tabular-nums" />
                                                </td>
                                                <td className="px-4 py-2.5 hidden lg:table-cell">
                                                    <Input type="time" value={rec.check_out}
                                                        onChange={e => updateRecord(idx, 'check_out', e.target.value)}
                                                        className="h-7 text-xs w-28 tabular-nums" />
                                                </td>
                                                <td className="px-4 py-2.5 hidden xl:table-cell">
                                                    <Input placeholder="Note..." value={rec.notes}
                                                        onChange={e => updateRecord(idx, 'notes', e.target.value)}
                                                        className="h-7 text-xs" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredIndices.length === 0 && (
                                <div className="py-16 text-center text-muted-foreground">
                                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No employees found</p>
                                    <p className="text-sm mt-1">Try changing the department filter</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Bar */}
                    <div className="sticky bottom-4 mt-4">
                        <div className="flex items-center justify-between bg-background border rounded-xl shadow-lg px-5 py-3">
                            <div className="text-sm text-muted-foreground">
                                Marking <span className="font-semibold text-foreground">{filteredIndices.length}</span> employees for{' '}
                                <span className="font-semibold text-foreground">{selectedDate}</span>
                            </div>
                            <Button type="submit" disabled={submitting} size="default">
                                <Save className="h-4 w-4 mr-2" />
                                {submitting ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
