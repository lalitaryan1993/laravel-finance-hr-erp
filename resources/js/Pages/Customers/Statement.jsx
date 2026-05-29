import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Printer } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function CustomerStatement({ customer, filters = {} }) {
    const [from, setFrom] = useState(filters.from ?? '')
    const [to, setTo]     = useState(filters.to ?? '')
    const invoices  = customer.invoices ?? []
    const payments  = customer.payments ?? []

    const totalInvoiced = invoices.reduce((s, i) => s + parseFloat(i.grand_total || 0), 0)
    const totalPaid     = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0)
    const outstanding   = totalInvoiced - totalPaid

    const applyFilter = () => {
        router.get(`/customers/${customer.id}/statement`, { from, to })
    }

    return (
        <AppLayout>
            <Head title={`Statement — ${customer.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/customers/${customer.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Account Statement</h1>
                        <p className="text-muted-foreground text-sm">{customer.name}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>

                <div className="flex gap-3 items-end bg-muted/30 rounded-lg p-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">From</label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-36" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">To</label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-36" />
                    </div>
                    <Button variant="outline" onClick={applyFilter}>Apply</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Invoiced</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalInvoiced)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Paid</div>
                            <div className="text-2xl font-bold font-mono mt-1 text-green-600">{formatCurrency(totalPaid)}</div>
                        </CardContent>
                    </Card>
                    <Card className={outstanding > 0 ? 'border-orange-300 dark:border-orange-700' : ''}>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Outstanding</div>
                            <div className={cn('text-2xl font-bold font-mono mt-1', outstanding > 0 ? 'text-orange-600' : 'text-green-600')}>
                                {formatCurrency(outstanding)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices</TableCell>
                                    </TableRow>
                                ) : invoices.map((inv) => (
                                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                        <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                                        <TableCell>{formatDate(inv.due_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{formatCurrency(inv.paid_amount)}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(inv.balance_due) > 0
                                                ? <span className="text-orange-600 font-medium">{formatCurrency(inv.balance_due)}</span>
                                                : '—'}
                                        </TableCell>
                                        <TableCell><Badge variant="secondary">{inv.status}</Badge></TableCell>
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
