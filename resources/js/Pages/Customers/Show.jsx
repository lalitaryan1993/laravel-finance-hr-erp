import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CustomerShow({ customer }) {
    const invoices = customer.invoices ?? []
    const outstanding = invoices.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0)

    return (
        <AppLayout>
            <Head title={customer.name} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/customers')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{customer.name}</h1>
                        <p className="text-muted-foreground text-sm">{customer.email}</p>
                    </div>
                    <Badge variant={customer.is_active ? 'success' : 'secondary'}>{customer.is_active ? 'Active' : 'Inactive'}</Badge>
                    <Button variant="outline" size="sm" onClick={() => router.visit(`/customers/${customer.id}/statement`)}>
                        <FileText className="w-4 h-4 mr-2" /> Statement
                    </Button>
                    <Button variant="outline" onClick={() => router.visit(`/customers/${customer.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'GST Number', value: customer.gst_number ?? '—' },
                        { label: 'PAN Number', value: customer.pan_number ?? '—' },
                        { label: 'Credit Terms', value: customer.credit_days ? `${customer.credit_days} days` : '—' },
                        { label: 'Outstanding', value: formatCurrency(outstanding), highlight: outstanding > 0 },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-5">
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                                <div className={`font-semibold mt-1 ${s.highlight ? 'text-orange-600' : ''}`}>{s.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span>{customer.phone ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">City</span>
                                <span>{customer.city ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">State</span>
                                <span>{customer.state ?? '—'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Financial</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Currency</span>
                                <span>{customer.currency ?? 'INR'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Credit Limit</span>
                                <span>{customer.credit_limit ? formatCurrency(customer.credit_limit) : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Invoices</span>
                                <span>{invoices.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Recent Invoices</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.visit('/invoices/sales')}>View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices</TableCell>
                                    </TableRow>
                                ) : invoices.slice(0, 10).map((inv) => (
                                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                        <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(inv.balance_due) > 0
                                                ? <span className="text-orange-600">{formatCurrency(inv.balance_due)}</span>
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
