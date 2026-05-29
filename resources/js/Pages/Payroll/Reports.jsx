import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PayrollReports({ runs = {}, filters = {} }) {
    const list = runs.data ?? []

    const totalGross = list.reduce((s, r) => s + parseFloat(r.total_gross || 0), 0)
    const totalNet   = list.reduce((s, r) => s + parseFloat(r.total_net || 0), 0)
    const totalDed   = list.reduce((s, r) => s + parseFloat(r.total_deductions || 0), 0)

    const statusVariant = { completed: 'success', processing: 'warning', failed: 'destructive' }

    return (
        <AppLayout>
            <Head title="Payroll Reports" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payroll Reports</h1>
                        <p className="text-muted-foreground text-sm mt-1">Historical payroll run summaries</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Gross (YTD)</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalGross)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Deductions (YTD)</div>
                            <div className="text-2xl font-bold font-mono mt-1 text-red-500">{formatCurrency(totalDed)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Net Pay (YTD)</div>
                            <div className="text-2xl font-bold font-mono mt-1 text-green-600">{formatCurrency(totalNet)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Payroll Run History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Gross</TableHead>
                                    <TableHead className="text-right">Deductions</TableHead>
                                    <TableHead className="text-right">Net Pay</TableHead>
                                    <TableHead>Run At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No payroll runs found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((run) => (
                                    <TableRow key={run.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium font-mono">{run.month}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[run.status] ?? 'secondary'} className="capitalize">
                                                {run.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(run.total_gross)}</TableCell>
                                        <TableCell className="text-right font-mono text-red-500">{formatCurrency(run.total_deductions)}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-green-600">{formatCurrency(run.total_net)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {run.run_at ? new Date(run.run_at).toLocaleDateString('en-IN') : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
