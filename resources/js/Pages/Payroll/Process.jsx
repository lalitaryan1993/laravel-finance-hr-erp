import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlayCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PayrollProcess({ employees = [], month, payrollRuns = [] }) {
    const [selected, setSelected] = useState([])
    const [payMonth, setPayMonth] = useState(month ?? '')
    const [processing, setProcessing] = useState(false)

    const toggleAll = (e) => {
        setSelected(e.target.checked ? employees.map((emp) => emp.id) : [])
    }

    const toggleOne = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    }

    const runPayroll = () => {
        if (!payMonth) return
        setProcessing(true)
        router.post('/payroll/run', {
            month: payMonth,
            employee_ids: selected,
        }, { onFinish: () => setProcessing(false) })
    }

    const statusVariant = { completed: 'success', processing: 'warning', failed: 'destructive' }

    return (
        <AppLayout>
            <Head title="Process Payroll" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Process Payroll</h1>
                        <p className="text-muted-foreground text-sm mt-1">Run monthly salary disbursements</p>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Payroll Settings</CardTitle></CardHeader>
                    <CardContent className="flex items-end gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Payroll Month</label>
                            <Input type="month" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} className="w-44" />
                        </div>
                        <Button onClick={runPayroll} disabled={processing || !payMonth} className="gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Run Payroll {selected.length ? `(${selected.length} employees)` : '(All)'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Employees — {employees.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <input type="checkbox" onChange={toggleAll}
                                            checked={selected.length === employees.length && employees.length > 0} />
                                    </TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Structure</TableHead>
                                    <TableHead className="text-right">Basic Salary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No active employees
                                        </TableCell>
                                    </TableRow>
                                ) : employees.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-muted/50 cursor-pointer"
                                        onClick={() => toggleOne(emp.id)}>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" checked={selected.includes(emp.id)}
                                                onChange={() => toggleOne(emp.id)} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{emp.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{emp.employee_code}</div>
                                        </TableCell>
                                        <TableCell>{emp.department?.name ?? '—'}</TableCell>
                                        <TableCell>{emp.salary_structure?.name ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(emp.basic_salary)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {payrollRuns.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Recent Payroll Runs</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total Gross</TableHead>
                                        <TableHead className="text-right">Total Net</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrollRuns.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-medium">{run.month}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[run.status] ?? 'secondary'} className="capitalize">
                                                    {run.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(run.total_gross)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(run.total_net)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
