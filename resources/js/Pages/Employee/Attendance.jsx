import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarCheck, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const statusColor = {
    present:  'bg-green-500',
    absent:   'bg-red-400',
    late:     'bg-amber-400',
    half_day: 'bg-blue-400',
    on_leave: 'bg-purple-400',
    holiday:  'bg-slate-200 dark:bg-slate-700',
    weekend:  'bg-slate-100 dark:bg-slate-800',
}

const statusVariant = {
    present: 'success', absent: 'destructive', late: 'warning',
    half_day: 'info', on_leave: 'secondary', holiday: 'outline',
}

const statusLabel = {
    present: 'Present', absent: 'Absent', late: 'Late',
    half_day: 'Half Day', on_leave: 'On Leave', holiday: 'Holiday',
}

function CalendarGrid({ records, month }) {
    const [year, mon] = month.split('-').map(Number)
    const firstDay = new Date(year, mon - 1, 1).getDay()
    const daysInMonth = new Date(year, mon, 0).getDate()

    // Map date string → record
    const byDate = {}
    records.forEach(r => { byDate[r.date] = r })

    const blanks = firstDay === 0 ? 6 : firstDay - 1 // Mon-start grid

    return (
        <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: blanks }, (_, i) => (
                    <div key={`b${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const d = i + 1
                    const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const rec = byDate[dateStr]
                    const isWeekend = [0, 6].includes(new Date(year, mon - 1, d).getDay())
                    const isToday = dateStr === new Date().toISOString().slice(0, 10)

                    return (
                        <div
                            key={d}
                            title={rec ? `${statusLabel[rec.status] ?? rec.status}${rec.check_in ? ` · In: ${rec.check_in}` : ''}${rec.check_out ? ` · Out: ${rec.check_out}` : ''}` : isWeekend ? 'Weekend' : ''}
                            className={`
                                relative flex flex-col items-center justify-center rounded-lg aspect-square p-1 text-xs
                                ${rec ? statusColor[rec.status] + ' text-white' : isWeekend ? statusColor.weekend + ' text-muted-foreground' : 'bg-muted/40 text-muted-foreground'}
                                ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                            `}
                        >
                            <span className="font-semibold">{d}</span>
                            {rec && (
                                <span className="text-[9px] opacity-90 leading-none mt-0.5">
                                    {statusLabel[rec.status]?.slice(0, 4) ?? rec.status}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function EmployeeAttendance({ employee, records = [], stats = {}, month }) {
    const [year, mon] = month.split('-').map(Number)
    const monthLabel = new Date(year, mon - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    const prevMonth = () => {
        const d = new Date(year, mon - 2, 1)
        router.get('/me/attendance', { month: d.toISOString().slice(0, 7) }, { preserveState: true })
    }
    const nextMonth = () => {
        const d = new Date(year, mon, 1)
        router.get('/me/attendance', { month: d.toISOString().slice(0, 7) }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="My Attendance" />
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarCheck className="h-6 w-6 text-primary" /> My Attendance
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {employee?.employee_code} — {employee?.first_name} {employee?.last_name}
                        </p>
                    </div>
                    {/* Month navigation */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-36 text-center">{monthLabel}</span>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Present',  value: stats.present ?? 0,  color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
                        { label: 'Absent',   value: stats.absent ?? 0,   color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
                        { label: 'Late',     value: stats.late ?? 0,     color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
                        { label: 'Half Day', value: stats.half_day ?? 0, color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
                        { label: 'On Leave', value: stats.on_leave ?? 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className={`p-4 text-center rounded-lg ${s.bg}`}>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{monthLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CalendarGrid records={records} month={month} />

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                            {Object.entries(statusLabel).map(([k, v]) => (
                                <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className={`h-3 w-3 rounded-sm ${statusColor[k]}`} />
                                    {v}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Detail list */}
                {records.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Daily Log</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {[...records].reverse().map((r, i) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-3">
                                        <span className="w-24 text-sm text-muted-foreground shrink-0">
                                            {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </span>
                                        <Badge variant={statusVariant[r.status] ?? 'secondary'} className="capitalize w-20 justify-center">
                                            {statusLabel[r.status] ?? r.status}
                                        </Badge>
                                        {r.check_in && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {r.check_in} – {r.check_out ?? '—'}
                                            </span>
                                        )}
                                        {r.working_hours && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {Number(r.working_hours).toFixed(1)}h
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
