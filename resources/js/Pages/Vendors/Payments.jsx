import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function VendorPayments({ payments = {}, filters = {} }) {
    const list = payments.data ?? []

    return (
        <AppLayout>
            <Head title="Vendor Payments" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Vendor Payments</h1>
                    <p className="text-muted-foreground text-sm mt-1">All outgoing payments to vendors</p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment #</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No vendor payments recorded
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((pmt) => (
                                    <TableRow key={pmt.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-sm">{pmt.payment_number}</TableCell>
                                        <TableCell className="font-medium">{pmt.invoices?.[0]?.party?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(pmt.payment_date)}</TableCell>
                                        <TableCell className="capitalize">{pmt.payment_method?.replace('_', ' ')}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(pmt.amount)}</TableCell>
                                        <TableCell><Badge variant="success">{pmt.status}</Badge></TableCell>
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
