import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, Building2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function VendorShow({ vendor }) {
    const invoices = vendor.invoices ?? []
    const outstanding = invoices.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0)

    return (
        <AppLayout>
            <Head title={vendor.name} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/vendors')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{vendor.name}</h1>
                        <p className="text-muted-foreground text-sm">{vendor.email}</p>
                    </div>
                    <Badge variant={vendor.is_active ? 'success' : 'secondary'}>{vendor.is_active ? 'Active' : 'Inactive'}</Badge>
                    <Button variant="outline" onClick={() => router.visit(`/vendors/${vendor.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'GST Number', value: vendor.gst_number ?? '—' },
                        { label: 'PAN Number', value: vendor.pan_number ?? '—' },
                        { label: 'Payment Terms', value: vendor.payment_days ? `${vendor.payment_days} days` : '—' },
                        { label: 'Outstanding', value: formatCurrency(outstanding), highlight: outstanding > 0 },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-5">
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                                <div className={`font-semibold mt-1 ${s.highlight ? 'text-red-600' : ''}`}>{s.value}</div>
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
                                <span>{vendor.phone ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">City</span>
                                <span>{vendor.city ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">State</span>
                                <span>{vendor.state ?? '—'}</span>
                            </div>
                            {vendor.address && (
                                <div>
                                    <span className="text-muted-foreground">Address</span>
                                    <p className="mt-0.5">{vendor.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Financial</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Currency</span>
                                <span>{vendor.currency ?? 'INR'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Credit Limit</span>
                                <span>{vendor.credit_limit ? formatCurrency(vendor.credit_limit) : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Bills</span>
                                <span>{invoices.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Recent Bills</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.visit('/invoices/purchase')}>
                                View All
                            </Button>
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
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bills</TableCell>
                                    </TableRow>
                                ) : invoices.slice(0, 10).map((inv) => (
                                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                        <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(inv.balance_due) > 0
                                                ? <span className="text-red-600">{formatCurrency(inv.balance_due)}</span>
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
