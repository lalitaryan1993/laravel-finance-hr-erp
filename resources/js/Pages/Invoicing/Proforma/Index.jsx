import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ProformaIndex({ invoices = {}, filters = {} }) {
    const list = invoices.data ?? []

    return (
        <AppLayout>
            <Head title="Proforma Invoices" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Proforma Invoices</h1>
                        <p className="text-muted-foreground text-sm mt-1">Draft invoices before confirmation</p>
                    </div>
                    <Button onClick={() => router.visit('/invoices/create?type=proforma')}>
                        <Plus className="w-4 h-4 mr-2" /> New Proforma
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Proforma #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No proforma invoices yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((inv) => (
                                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                        <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                                        <TableCell>{inv.party?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
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
