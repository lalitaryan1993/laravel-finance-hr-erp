import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function CustomerOutstanding({ customers = [] }) {
    const totalOutstanding = customers.reduce((s, c) => s + parseFloat(c.outstanding || 0), 0)

    return (
        <AppLayout>
            <Head title="Outstanding Receivables" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Outstanding Receivables</h1>
                        <p className="text-muted-foreground text-sm mt-1">Customers with unpaid invoices</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Outstanding</div>
                        <div className="text-2xl font-bold font-mono text-orange-600">{formatCurrency(totalOutstanding)}</div>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>GST Number</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead className="text-right">Outstanding</TableHead>
                                    <TableHead>Risk</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-green-500" />
                                            No outstanding receivables
                                        </TableCell>
                                    </TableRow>
                                ) : customers.map((c) => {
                                    const amount = parseFloat(c.outstanding || 0)
                                    const risk = amount > 500000 ? 'high' : amount > 100000 ? 'medium' : 'low'
                                    const riskVariant = { high: 'destructive', medium: 'warning', low: 'success' }
                                    return (
                                        <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/customers/${c.id}`)}>
                                            <TableCell>
                                                <div className="font-medium">{c.name}</div>
                                                <div className="text-xs text-muted-foreground">{c.email}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{c.gst_number ?? '—'}</TableCell>
                                            <TableCell>{c.city ?? '—'}</TableCell>
                                            <TableCell className="text-right font-mono font-medium text-orange-600">
                                                {formatCurrency(amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={riskVariant[risk]} className="capitalize">{risk}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
