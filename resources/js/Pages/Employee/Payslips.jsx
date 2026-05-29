import { Head } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Download, TrendingUp, Wallet, ArrowDownRight } from 'lucide-react'

export default function EmployeePayslips({ employee, payslips = [] }) {
    const latest = payslips[0]

    return (
        <AppLayout>
            <Head title="My Payslips" />
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" /> My Payslips
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {employee?.employee_code} — {employee?.first_name} {employee?.last_name}
                    </p>
                </div>

                {/* Latest payslip summary */}
                {latest && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Gross Earnings', value: formatCurrency(latest.gross_earnings), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                            { label: 'Deductions', value: formatCurrency(latest.total_deductions), icon: ArrowDownRight, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
                            { label: 'Net Pay', value: formatCurrency(latest.net_pay), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
                        ].map(item => (
                            <Card key={item.label}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                        <p className="text-lg font-bold font-mono">{item.value}</p>
                                        <p className="text-xs text-muted-foreground">{latest.month}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Payslips table */}
                <Card>
                    <CardHeader><CardTitle>Payslip History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {payslips.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No payslips yet</p>
                                <p className="text-sm mt-1">Payslips will appear here after payroll is processed.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Pay Period</TableHead>
                                        <TableHead className="text-right">Basic</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">Deductions</TableHead>
                                        <TableHead className="text-right">Net Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payslips.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-mono font-medium">{p.month}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(p.pay_period_start)} – {formatDate(p.pay_period_end)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(p.basic_salary)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(p.gross_earnings)}</TableCell>
                                            <TableCell className="text-right font-mono text-red-500">
                                                {formatCurrency(p.total_deductions)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold text-green-600">
                                                {formatCurrency(p.net_pay)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'paid' ? 'success' : 'secondary'} className="capitalize">
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {p.pdf_path && (
                                                    <Button asChild variant="ghost" size="sm">
                                                        <a href={`/storage/${p.pdf_path}`} target="_blank" rel="noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
