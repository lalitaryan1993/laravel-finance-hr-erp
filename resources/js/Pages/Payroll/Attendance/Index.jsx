import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, ClipboardList, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS = {
    present:  { short: 'P',  bg: 'bg-emerald-500 text-white',       dot: 'bg-emerald-500' },
    absent:   { short: 'A',  bg: 'bg-red-500 text-white',           dot: 'bg-red-500' },
    half_day: { short: 'H',  bg: 'bg-yellow-400 text-yellow-900',   dot: 'bg-yellow-400' },
    leave:    { short: 'L',  bg: 'bg-purple-500 text-white',        dot: 'bg-purple-500' },
    late:     { short: 'LT', bg: 'bg-orange-400 text-white',        dot: 'bg-orange-400' },
    wfh:      { short: 'W',  bg: 'bg-blue-500 text-white',          dot: 'bg-blue-500' },
    holiday:  { short: 'HO', bg: 'bg-gray-300 text-gray-600',       dot: 'bg-gray-300' },
    on_duty:  { short: 'OD', bg: 'bg-cyan-500 text-white',          dot: 'bg-cyan-500' },
};

const LEGEND = [
    ['present', 'Present'],
    ['absent',  'Absent'],
    ['half_day','Half Day'],
    ['leave',   'Leave'],
    ['late',    'Late'],
    ['wfh',     'WFH'],
    ['holiday', 'Holiday'],
    ['on_duty', 'On Duty'],
];

export default function AttendanceIndex({ summary, month, daysInMonth, workingDays, departments, filters }) {
    const [deptId, setDeptId]         = useState(filters?.department_id ? String(filters.department_id) : 'all');
    const [selectedMonth, setSelectedMonth] = useState(month);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    function apply() {
        router.get('/payroll/attendance', {
            month: selectedMonth,
            department_id: deptId !== 'all' ? deptId : undefined,
        }, { preserveState: true });
    }

    function shiftMonth(offset) {
        const d = new Date(month + '-01');
        d.setMonth(d.getMonth() + offset);
        router.get('/payroll/attendance', {
            month: d.toISOString().slice(0, 7),
            department_id: deptId !== 'all' ? deptId : undefined,
        });
    }

    const totalPresent  = summary.reduce((s, e) => s + e.present, 0);
    const totalAbsent   = summary.reduce((s, e) => s + e.absent, 0);
    const totalLeave    = summary.reduce((s, e) => s + e.leave, 0);
    const overallPct    = summary.length && workingDays
        ? Math.round((totalPresent / (summary.length * workingDays)) * 100)
        : 0;

    const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return (
        <AppLayout>
            <Head title="Attendance Register" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Attendance Register</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
                    </div>
                    <Link href="/payroll/attendance/mark">
                        <Button>
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Mark Today
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Employees</p>
                            <p className="text-3xl font-bold tabular-nums mt-0.5">{summary.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Working Days</p>
                            <p className="text-3xl font-bold tabular-nums mt-0.5 text-primary">{workingDays}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Total Present</p>
                            <p className="text-3xl font-bold tabular-nums mt-0.5 text-emerald-600">{totalPresent}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Avg Attendance</p>
                            <div className="flex items-end gap-2 mt-0.5">
                                <p className={cn('text-3xl font-bold tabular-nums',
                                    overallPct >= 90 ? 'text-emerald-600' : overallPct >= 70 ? 'text-yellow-600' : 'text-red-600'
                                )}>{overallPct}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <input
                                type="month" value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="h-9 rounded-md border border-input px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <Select value={deptId} onValueChange={setDeptId}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button onClick={apply}>Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                    {LEGEND.map(([key, label]) => {
                        const s = STATUS[key];
                        return (
                            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className={cn('h-4 w-4 rounded text-[9px] font-bold flex items-center justify-center', s.bg)}>
                                    {s.short}
                                </span>
                                {label}
                            </div>
                        );
                    })}
                </div>

                {/* Grid */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="text-xs border-collapse" style={{ minWidth: '100%' }}>
                            <thead>
                                <tr className="bg-muted/50 border-b sticky top-0">
                                    <th className="sticky left-0 z-10 bg-muted/80 backdrop-blur text-left px-4 py-3 font-semibold text-muted-foreground min-w-[180px] border-r whitespace-nowrap">
                                        Employee
                                    </th>
                                    {days.map(d => {
                                        const dateObj = new Date(`${month}-${String(d).padStart(2, '0')}T00:00:00`);
                                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                                        return (
                                            <th key={d} className={cn(
                                                'px-0.5 py-2 font-medium text-center',
                                                isWeekend ? 'text-muted-foreground/40 bg-muted/30' : 'text-muted-foreground'
                                            )} style={{ minWidth: 28 }}>
                                                <div className="leading-tight">{d}</div>
                                                <div className="text-[8px] opacity-60 font-normal">
                                                    {dateObj.toLocaleDateString('en', { weekday: 'narrow' })}
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="px-3 py-3 font-medium text-right border-l text-emerald-600 bg-emerald-50/50">P</th>
                                    <th className="px-3 py-3 font-medium text-right text-red-500 bg-red-50/50">A</th>
                                    <th className="px-3 py-3 font-medium text-right text-purple-600 bg-purple-50/50">L</th>
                                    <th className="px-3 py-3 font-medium text-right text-yellow-600 bg-yellow-50/50">H</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.map(({ employee, records, present, absent, leave, half_day }, rowIdx) => (
                                    <tr key={employee.id} className={cn(
                                        'border-b hover:bg-muted/10 transition-colors',
                                        rowIdx % 2 === 0 ? '' : 'bg-muted/5'
                                    )}>
                                        <td className="sticky left-0 bg-background px-4 py-2 border-r">
                                            <div className="font-medium text-foreground leading-tight">
                                                {employee.first_name} {employee.last_name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">{employee.employee_code}</div>
                                        </td>
                                        {days.map(d => {
                                            const key = `${month}-${String(d).padStart(2, '0')}`;
                                            const rec = records?.[key];
                                            const dateObj = new Date(key + 'T00:00:00');
                                            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                                            const st = rec ? STATUS[rec.status] : null;
                                            return (
                                                <td key={d} className={cn(
                                                    'text-center px-0 py-1.5',
                                                    isWeekend && 'bg-muted/20'
                                                )}>
                                                    {st ? (
                                                        <span className={cn(
                                                            'inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold mx-auto',
                                                            st.bg
                                                        )}>
                                                            {st.short}
                                                        </span>
                                                    ) : isWeekend ? (
                                                        <span className="text-muted-foreground/25 text-base leading-none">—</span>
                                                    ) : (
                                                        <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/20 mx-auto" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-3 py-2 text-right font-bold tabular-nums text-emerald-600 border-l bg-emerald-50/20">{present}</td>
                                        <td className="px-3 py-2 text-right font-bold tabular-nums text-red-500 bg-red-50/20">{absent}</td>
                                        <td className="px-3 py-2 text-right font-bold tabular-nums text-purple-600 bg-purple-50/20">{leave}</td>
                                        <td className="px-3 py-2 text-right font-bold tabular-nums text-yellow-600 bg-yellow-50/20">{half_day}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {summary.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground">
                                <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-semibold text-foreground">No employees found</p>
                                <p className="text-sm mt-1">Adjust filters or mark attendance first</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
