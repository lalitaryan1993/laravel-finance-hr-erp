import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function Payslips({ payslips = {}, filters = {} }) {
    const list = payslips.data ?? []

    const handleMonthFilter = (e) => {
        router.get('/payroll/payslips', { month: e.target.value }, { preserveState: true })
    }

    const statusVariant = { generated: 'secondary', paid: 'success', cancelled: 'destructive' }

    return (
        <AppLayout>
            <Head title="Payslips" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payslips</h1>
                        <p className="text-muted-foreground text-sm mt-1">Employee salary slips by month</p>
                    </div>
                    <Input type="month" defaultValue={filters.month ?? ''} onChange={handleMonthFilter} className="w-40" />
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Gross</TableHead>
                                    <TableHead className="text-right">Deductions</TableHead>
                                    <TableHead className="text-right">Net Pay</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No payslips found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((slip) => (
                                    <TableRow key={slip.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/payroll/payslips/${slip.id}/pdf`)}>
                                        <TableCell>
                                            <div className="font-medium">{slip.employee?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{slip.employee?.employee_code}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{slip.employee?.department?.name ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-sm">{slip.month}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(slip.gross_earnings)}</TableCell>
                                        <TableCell className="text-right font-mono text-red-500">{formatCurrency(slip.total_deductions)}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-green-600">{formatCurrency(slip.net_pay)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[slip.status] ?? 'secondary'} className="capitalize">
                                                {slip.status}
                                            </Badge>
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
