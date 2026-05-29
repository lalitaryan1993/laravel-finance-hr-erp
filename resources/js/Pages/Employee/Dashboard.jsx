import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    CalendarCheck, CalendarDays, CreditCard, FileText, CheckCircle2,
    Clock, TrendingUp, User, Wallet, UmbrellaOff, AlertCircle,
    ArrowRight, Building2, Briefcase,
} from 'lucide-react'

const attColor = {
    present:  'bg-green-500',
    absent:   'bg-red-400',
    late:     'bg-amber-400',
    half_day: 'bg-blue-400',
    on_leave: 'bg-purple-400',
    holiday:  'bg-slate-300 dark:bg-slate-600',
}

const attLabel = {
    present: 'Present', absent: 'Absent', late: 'Late',
    half_day: 'Half Day', on_leave: 'On Leave', holiday: 'Holiday',
}

const leaveStatusVariant = {
    pending: 'warning', approved: 'success', rejected: 'destructive',
}

const expenseStatusVariant = {
    draft: 'secondary', submitted: 'warning', approved: 'success',
    rejected: 'destructive', paid: 'success',
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) {
    return (
        <Card>
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold leading-tight">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

export default function EmployeeDashboard({
    employee, attStats = {}, recentAttendance = [],
    leaveBalance = [], recentPayslips = [],
    recentLeave = [], recentExpenses = [], pendingTasks = [],
}) {
    const now    = new Date()
    const month  = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    const today  = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

    if (!employee) {
        return (
            <AppLayout>
                <Head title="My Dashboard" />
                <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Employee record not linked</h2>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                            Your user account is not yet linked to an employee record.
                            Please contact your HR administrator.
                        </p>
                    </div>
                </div>
            </AppLayout>
        )
    }

    const latestPayslip = recentPayslips[0]

    return (
        <AppLayout>
            <Head title="My Dashboard" />
            <div className="space-y-6">

                {/* ── Welcome banner ── */}
                <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
                    }} />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-primary-foreground/70 text-sm">{today}</p>
                            <h1 className="text-2xl font-bold mt-1">
                                Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {employee.first_name}!
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-primary-foreground/80">
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {employee.designation ?? 'Employee'}
                                </span>
                                {employee.department && (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {employee.department.name}
                                    </span>
                                )}
                                <span className="font-mono text-xs bg-white/20 rounded px-2 py-0.5">
                                    {employee.employee_code}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button asChild size="sm" variant="secondary">
                                <Link href="/me/leave">
                                    <UmbrellaOff className="h-4 w-4 mr-1.5" /> Apply Leave
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                <Link href="/expenses">
                                    <CreditCard className="h-4 w-4 mr-1.5" /> Claim Expense
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={CalendarCheck}
                        label={`Attendance — ${month}`}
                        value={`${attStats.present ?? 0}d`}
                        sub={`${attStats.absent ?? 0} absent · ${attStats.late ?? 0} late`}
                        color="text-green-600" bg="bg-green-100 dark:bg-green-900/30"
                    />
                    <StatCard
                        icon={UmbrellaOff}
                        label="Leave Balance"
                        value={leaveBalance.reduce((s, b) => s + (b.remaining ?? 0), 0)}
                        sub="days remaining this year"
                        color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={Wallet}
                        label="Last Net Pay"
                        value={latestPayslip ? formatCurrency(latestPayslip.net_pay) : '—'}
                        sub={latestPayslip?.month ?? 'No payslip yet'}
                        color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending Tasks"
                        value={pendingTasks.length}
                        sub="lifecycle tasks due"
                        color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/30"
                    />
                </div>

                {/* ── Main content grid ── */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* ── Attendance week view ── */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                This Month's Attendance
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link href="/me/attendance">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {/* Stats row */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {[
                                    { label: 'Present',  value: attStats.present ?? 0,  color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
                                    { label: 'Absent',   value: attStats.absent ?? 0,   color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
                                    { label: 'Late',     value: attStats.late ?? 0,     color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
                                    { label: 'Half Day', value: attStats.half_day ?? 0, color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
                                ].map(s => (
                                    <div key={s.label} className={`rounded-lg p-3 text-center ${s.bg}`}>
                                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Recent 7 days strip */}
                            {recentAttendance.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Last {recentAttendance.length} days</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {recentAttendance.map((r, i) => (
                                            <div key={i} title={`${r.date}: ${attLabel[r.status] ?? r.status}`}
                                                className="flex flex-col items-center gap-1 w-10">
                                                <div className={`h-10 w-10 rounded-lg ${attColor[r.status] ?? 'bg-muted'} opacity-80`} />
                                                <span className="text-[9px] text-muted-foreground">
                                                    {new Date(r.date).getDate()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {Object.entries(attLabel).map(([k, v]) => (
                                            <span key={k} className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className={`h-2 w-2 rounded-sm ${attColor[k]}`} />
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Leave balance ── */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <UmbrellaOff className="h-4 w-4 text-muted-foreground" />
                                Leave Balance
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link href="/me/leave">Apply <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {leaveBalance.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No leave allocations for this year.</p>
                            ) : leaveBalance.map((b, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{b.type}</span>
                                        <span className="text-muted-foreground">{b.remaining}/{b.allocated} days</span>
                                    </div>
                                    <Progress
                                        value={b.allocated > 0 ? (b.remaining / b.allocated) * 100 : 0}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                            <Button asChild className="w-full mt-2" size="sm">
                                <Link href="/me/leave">
                                    <CalendarDays className="h-4 w-4 mr-1.5" /> Apply for Leave
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Payslips + Pending Tasks ── */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Recent payslips */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                My Payslips
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link href="/me/payslips">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentPayslips.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No payslips yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentPayslips.slice(0, 5).map(p => (
                                        <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="text-sm font-medium font-mono">{p.month}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Gross: {formatCurrency(p.gross_earnings)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-600">{formatCurrency(p.net_pay)}</p>
                                                    <p className="text-xs text-muted-foreground">Net pay</p>
                                                </div>
                                                <Badge variant={p.status === 'paid' ? 'success' : 'secondary'} className="text-xs">
                                                    {p.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending tasks */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                Pending Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingTasks.length === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                    <p className="text-sm font-medium">All tasks done!</p>
                                    <p className="text-xs text-muted-foreground">No pending lifecycle tasks.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {pendingTasks.map(t => (
                                        <div key={t.id} className="flex items-start gap-3 rounded-lg border p-3">
                                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{t.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due: {formatDate(t.due_date)} · <span className="capitalize">{t.type}</span>
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0 capitalize">{t.status?.replace('_', ' ')}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Recent leave + expenses ── */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Recent leave */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                Recent Leave Requests
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link href="/me/leave">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentLeave.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No leave requests yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentLeave.map(r => (
                                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="text-sm font-medium">{r.leave_type?.name ?? 'Leave'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(r.from_date)} – {formatDate(r.to_date)} · {r.days}d
                                                </p>
                                            </div>
                                            <Badge variant={leaveStatusVariant[r.status] ?? 'secondary'} className="text-xs capitalize">
                                                {r.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent expenses */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Recent Expense Claims
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs">
                                <Link href="/expenses">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentExpenses.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No expense claims yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentExpenses.map(e => (
                                        <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="text-sm font-medium truncate max-w-[180px]">{e.expense_number ?? e.description}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(e.expense_date)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{formatCurrency(e.total_amount)}</span>
                                                <Badge variant={expenseStatusVariant[e.status] ?? 'secondary'} className="text-xs capitalize">
                                                    {e.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    )
}
