import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CalendarCheck, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS = {
    present:  { label: 'Present',  bg: 'bg-emerald-100 text-emerald-700' },
    absent:   { label: 'Absent',   bg: 'bg-red-100 text-red-700' },
    half_day: { label: 'Half Day', bg: 'bg-yellow-100 text-yellow-700' },
    leave:    { label: 'Leave',    bg: 'bg-purple-100 text-purple-700' },
    late:     { label: 'Late',     bg: 'bg-orange-100 text-orange-700' },
    wfh:      { label: 'WFH',      bg: 'bg-blue-100 text-blue-700' },
    holiday:  { label: 'Holiday',  bg: 'bg-gray-100 text-gray-500' },
    on_duty:  { label: 'On Duty',  bg: 'bg-cyan-100 text-cyan-700' },
};

function fmt(val) {
    if (!val) return '—';
    return String(val).slice(0, 5);
}

export default function AttendanceReport({ employees, employee, records, month }) {
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedEmp, setSelectedEmp] = useState(String(employee?.id ?? ''));

    function navigate(empId, ym) {
        router.get('/payroll/attendance/report', {
            employee_id: empId || undefined,
            month: ym,
        });
    }

    function shiftMonth(offset) {
        const d = new Date(month + '-01');
        d.setMonth(d.getMonth() + offset);
        const ym = d.toISOString().slice(0, 7);
        setSelectedMonth(ym);
        navigate(selectedEmp, ym);
    }

    const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', {
        month: 'long', year: 'numeric',
    });

    const present  = records.filter(r => ['present', 'wfh', 'on_duty'].includes(r.status)).length;
    const absent   = records.filter(r => r.status === 'absent').length;
    const leave    = records.filter(r => r.status === 'leave').length;
    const late     = records.filter(r => r.status === 'late').length;
    const halfDay  = records.filter(r => r.status === 'half_day').length;
    const wfh      = records.filter(r => r.status === 'wfh').length;
    const totalHrs = records.reduce((s, r) => s + (Number(r.working_hours) || 0), 0);
    const trackedDays = records.filter(r => r.working_hours).length;
    const avgHrs   = trackedDays > 0 ? totalHrs / trackedDays : 0;

    return (
        <AppLayout>
            <Head title="Attendance Report" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Attendance Report</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={e => {
                                setSelectedMonth(e.target.value);
                                navigate(selectedEmp, e.target.value);
                            }}
                            className="h-9 rounded-md border border-input px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Employee selector */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Select value={selectedEmp} onValueChange={v => { setSelectedEmp(v); navigate(v, selectedMonth); }}>
                                <SelectTrigger className="w-72 h-9 text-sm">
                                    <SelectValue placeholder="Select an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.first_name} {e.last_name}
                                            <span className="text-muted-foreground ml-2 text-xs font-mono">({e.employee_code})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedEmp && (
                                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs"
                                    onClick={() => { setSelectedEmp(''); navigate('', selectedMonth); }}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {employee ? (
                    <>
                        {/* Employee Card */}
                        <Card>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-foreground text-lg leading-tight">
                                            {employee.first_name} {employee.last_name}
                                        </h2>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                            <span className="font-mono">{employee.employee_code}</span>
                                            {employee.designation && <span>· {employee.designation}</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Present Days', value: present,            color: 'text-emerald-600', sub: `incl. ${wfh} WFH` },
                                { label: 'Absent Days',  value: absent,             color: 'text-red-600',     sub: `${leave} on leave` },
                                { label: 'Late / Half',  value: `${late}/${halfDay}`,color: 'text-amber-600', sub: 'late / half-day' },
                                { label: 'Avg Hours',    value: avgHrs.toFixed(1),  color: 'text-primary',     sub: `${totalHrs.toFixed(1)} total hrs` },
                            ].map(({ label, value, color, sub }) => (
                                <Card key={label}>
                                    <CardContent className="p-4">
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        <p className={cn('text-2xl font-bold tabular-nums mt-0.5', color)}>{value}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Day-by-day Table */}
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/40 border-b text-xs">
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Day</th>
                                            <th className="text-center px-4 py-3 font-medium text-muted-foreground w-28">Status</th>
                                            <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24 hidden md:table-cell">Check In</th>
                                            <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24 hidden md:table-cell">Check Out</th>
                                            <th className="text-right px-4 py-3 font-medium text-muted-foreground w-20 hidden lg:table-cell">Hours</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map(rec => {
                                            const dateObj = new Date(rec.date + 'T00:00:00');
                                            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                                            const st = STATUS[rec.status] ?? STATUS.absent;
                                            return (
                                                <tr key={rec.id} className={cn(
                                                    'border-b transition-colors',
                                                    isWeekend ? 'bg-muted/20' : 'hover:bg-muted/10',
                                                    rec.status === 'absent' && 'bg-red-50/30 hover:bg-red-50/50'
                                                )}>
                                                    <td className="px-4 py-2.5 font-medium tabular-nums">
                                                        {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </td>
                                                    <td className={cn('px-4 py-2.5 text-xs', isWeekend ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
                                                        {dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', st.bg)}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center text-xs tabular-nums hidden md:table-cell">
                                                        {fmt(rec.check_in)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center text-xs tabular-nums hidden md:table-cell">
                                                        {fmt(rec.check_out)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-xs tabular-nums hidden lg:table-cell">
                                                        {rec.working_hours ? `${Number(rec.working_hours).toFixed(1)}h` : '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-xs text-muted-foreground hidden xl:table-cell max-w-[160px]">
                                                        <span className="truncate block">{rec.notes || '—'}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {records.length === 0 && (
                                    <div className="py-16 text-center text-muted-foreground">
                                        <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No records for {monthLabel}</p>
                                        <p className="text-sm mt-1">Mark attendance to see data here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-20 text-center text-muted-foreground">
                            <UserCircle className="h-14 w-14 mx-auto mb-4 opacity-20" />
                            <p className="font-semibold text-foreground">Select an employee</p>
                            <p className="text-sm mt-1">Choose an employee above to view their attendance report</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
