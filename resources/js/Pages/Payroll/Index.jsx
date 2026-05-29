import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus, Play, Users, DollarSign, Calendar, CheckCircle,
    CalendarCheck, UmbrellaOff, Building2, Clock, ClipboardList,
    TrendingUp, ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const RUN_STATUS = {
    draft:      { label: 'Draft',      color: 'bg-gray-100 text-gray-600' },
    processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
    completed:  { label: 'Completed',  color: 'bg-emerald-100 text-emerald-700' },
    paid:       { label: 'Paid',       color: 'bg-blue-100 text-blue-700' },
    cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700' },
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', href, actionLabel }) {
    const inner = (
        <CardContent className="p-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-0.5 tabular-nums">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                    </div>
                </div>
                {href && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                )}
            </div>
        </CardContent>
    );

    if (href) {
        return (
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <Link href={href}>{inner}</Link>
            </Card>
        );
    }
    return <Card>{inner}</Card>;
}

export default function PayrollIndex({ payrollRuns = {}, stats = {} }) {
    const list = payrollRuns.data ?? [];
    const currency = 'INR';

    return (
        <AppLayout>
            <Head title="HR & Payroll" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">HR & Payroll Dashboard</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/payroll/attendance/mark">
                            <Button variant="outline">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Mark Attendance
                            </Button>
                        </Link>
                        <Link href="/payroll/process">
                            <Button>
                                <Play className="h-4 w-4 mr-2" />
                                Run Payroll
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users} label="Active Employees" value={stats.total_employees ?? 0}
                        color="text-blue-500" href="/payroll/employees"
                    />
                    <StatCard
                        icon={DollarSign} label="This Month Payroll"
                        value={formatCurrency(stats.current_month_total ?? 0, currency)}
                        sub={stats.last_run_date ? `Last run: ${formatDate(stats.last_run_date)}` : 'No runs yet'}
                        color="text-emerald-500"
                    />
                    <StatCard
                        icon={UmbrellaOff} label="Pending Leaves" value={stats.pending_leave ?? 0}
                        color="text-yellow-500" href="/payroll/leave"
                        sub="Awaiting your approval"
                    />
                    <StatCard
                        icon={CheckCircle} label="Payroll Runs" value={stats.runs_this_year ?? 0}
                        sub="This year" color="text-purple-500"
                    />
                </div>

                {/* Today's Attendance + Dept Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Attendance */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Today's Attendance</CardTitle>
                            <Link href="/payroll/attendance">
                                <Button variant="ghost" size="sm" className="text-xs h-7">View All <ArrowRight className="h-3 w-3 ml-1" /></Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Present', value: stats.today_present ?? 0, color: 'bg-emerald-100 text-emerald-700' },
                                    { label: 'Absent', value: stats.today_absent ?? 0, color: 'bg-red-100 text-red-700' },
                                    { label: 'Total', value: stats.total_employees ?? 0, color: 'bg-blue-100 text-blue-700' },
                                    { label: 'Not Marked', value: Math.max(0, (stats.total_employees ?? 0) - (stats.today_present ?? 0) - (stats.today_absent ?? 0)), color: 'bg-gray-100 text-gray-600' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className={`rounded-lg px-4 py-3 ${color}`}>
                                        <p className="text-xs font-medium opacity-70">{label}</p>
                                        <p className="text-3xl font-bold tabular-nums mt-0.5">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Link href="/payroll/attendance/mark">
                                    <Button variant="outline" className="w-full" size="sm">
                                        <ClipboardList className="h-4 w-4 mr-2" />
                                        Mark Today's Attendance
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Department Breakdown */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Headcount by Department</CardTitle>
                            <Link href="/payroll/departments">
                                <Button variant="ghost" size="sm" className="text-xs h-7">Manage <ArrowRight className="h-3 w-3 ml-1" /></Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {stats.dept_breakdown?.length ? (
                                <div className="space-y-2.5">
                                    {stats.dept_breakdown.map(dept => {
                                        const pct = stats.total_employees
                                            ? Math.round((dept.active_employees / stats.total_employees) * 100)
                                            : 0;
                                        return (
                                            <div key={dept.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-foreground">{dept.name}</span>
                                                    <span className="text-sm font-medium tabular-nums">{dept.active_employees}</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    No departments configured yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Departments', icon: Building2, href: '/payroll/departments' },
                        { label: 'Leave Types', icon: UmbrellaOff, href: '/payroll/leave/types' },
                        { label: 'Salary Structures', icon: TrendingUp, href: '/payroll/structures' },
                        { label: 'Attendance Report', icon: CalendarCheck, href: '/payroll/attendance' },
                    ].map(({ label, icon: Icon, href }) => (
                        <Link key={href} href={href}>
                            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{label}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Recent Payroll Runs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Payroll Runs</CardTitle>
                        <Link href="/payroll/process">
                            <Button size="sm">
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Run Payroll
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run #</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Pay Date</TableHead>
                                    <TableHead className="text-right">Employees</TableHead>
                                    <TableHead className="text-right">Gross Pay</TableHead>
                                    <TableHead className="text-right">Net Pay</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p>No payroll runs yet.</p>
                                            <Link href="/payroll/process">
                                                <Button variant="outline" size="sm" className="mt-3">Start First Payroll Run</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ) : list.map(run => {
                                    const cfg = RUN_STATUS[run.status] ?? RUN_STATUS.draft;
                                    return (
                                        <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/payroll/payslips?month=${run.month}`)}>
                                            <TableCell className="font-mono font-medium text-sm">{run.run_number}</TableCell>
                                            <TableCell className="font-mono text-sm">{run.month}</TableCell>
                                            <TableCell className="text-sm">{formatDate(run.payment_date)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{run.employee_count}</TableCell>
                                            <TableCell className="text-right tabular-nums font-medium">{formatCurrency(run.total_gross, currency)}</TableCell>
                                            <TableCell className="text-right tabular-nums font-medium">{formatCurrency(run.total_net, currency)}</TableCell>
                                            <TableCell>
                                                <Badge className={cfg.color}>{cfg.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {run.status === 'completed' && (
                                                    <Button size="sm" variant="outline" className="h-7 text-xs"
                                                        onClick={e => { e.stopPropagation(); router.visit(`/payroll/payslips?month=${run.month}`); }}>
                                                        Payslips
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
