import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { UmbrellaOff, CalendarDays, CheckCircle2, XCircle, Clock } from 'lucide-react'

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'destructive', cancelled: 'secondary' }
const statusIcon = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
    cancelled: XCircle,
}

export default function EmployeeLeave({ employee, leaveTypes = [], balance = [], requests }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type_id: leaveTypes[0]?.id ?? '',
        from_date: '',
        to_date: '',
        reason: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/me/leave', { onSuccess: () => reset() })
    }

    const list = requests?.data ?? (Array.isArray(requests) ? requests : [])

    return (
        <AppLayout>
            <Head title="My Leave" />
            <div className="space-y-6 max-w-5xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UmbrellaOff className="h-6 w-6 text-primary" /> My Leave
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Apply for leave and view your request history
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Apply for leave form */}
                    <Card className="lg:col-span-1">
                        <CardHeader><CardTitle className="text-base">Apply for Leave</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Leave Type *</label>
                                    <select
                                        value={data.leave_type_id}
                                        onChange={e => setData('leave_type_id', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Select type…</option>
                                        {leaveTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    {errors.leave_type_id && <p className="text-xs text-destructive">{errors.leave_type_id}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">From Date *</label>
                                    <Input type="date" value={data.from_date} onChange={e => setData('from_date', e.target.value)} />
                                    {errors.from_date && <p className="text-xs text-destructive">{errors.from_date}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">To Date *</label>
                                    <Input type="date" value={data.to_date} onChange={e => setData('to_date', e.target.value)} />
                                    {errors.to_date && <p className="text-xs text-destructive">{errors.to_date}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reason *</label>
                                    <textarea
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                        placeholder="Briefly explain the reason for leave…"
                                    />
                                    {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Submitting…' : 'Submit Request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Leave balance */}
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle className="text-base">Leave Balance — {new Date().getFullYear()}</CardTitle></CardHeader>
                        <CardContent>
                            {balance.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    No leave allocations for this year.
                                </p>
                            ) : (
                                <div className="space-y-5">
                                    {balance.map((b, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                                                    {b.type}
                                                </span>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-muted-foreground">Used: <strong>{b.used}</strong></span>
                                                    <span className="text-green-600 font-semibold">{b.remaining} left</span>
                                                    <span className="text-muted-foreground text-xs">/ {b.allocated}</span>
                                                </div>
                                            </div>
                                            <Progress
                                                value={b.allocated > 0 ? (b.remaining / b.allocated) * 100 : 0}
                                                className="h-2.5"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Leave history */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Leave Request History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {list.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground">
                                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No leave requests</p>
                                <p className="text-sm mt-1">Your submitted leave requests will appear here.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.map(r => {
                                        const Icon = statusIcon[r.status] ?? Clock
                                        return (
                                            <TableRow key={r.id}>
                                                <TableCell className="font-medium">
                                                    {r.leave_type?.name ?? '—'}
                                                </TableCell>
                                                <TableCell>{formatDate(r.from_date)}</TableCell>
                                                <TableCell>{formatDate(r.to_date)}</TableCell>
                                                <TableCell>{r.days}d</TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                                                    {r.reason}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusVariant[r.status] ?? 'secondary'}
                                                        className="flex items-center gap-1 w-fit capitalize">
                                                        <Icon className="h-3 w-3" />
                                                        {r.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
