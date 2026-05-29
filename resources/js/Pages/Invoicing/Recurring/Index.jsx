import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function RecurringIndex({ invoices = {}, filters = {} }) {
    const list = invoices.data ?? []

    return (
        <AppLayout>
            <Head title="Recurring Invoices" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Recurring Invoices</h1>
                        <p className="text-muted-foreground text-sm mt-1">Auto-generate invoices on a schedule</p>
                    </div>
                    <Button onClick={() => router.visit('/invoices/create?type=sales&recurring=1')}>
                        <Plus className="w-4 h-4 mr-2" /> New Recurring
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Next Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No recurring invoices configured
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((inv) => (
                                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                        <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                                        <TableCell>{inv.party?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(inv.next_invoice_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                        <TableCell>{inv.recurring_frequency ?? '—'}</TableCell>
                                        <TableCell><Badge variant="success">Active</Badge></TableCell>
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
