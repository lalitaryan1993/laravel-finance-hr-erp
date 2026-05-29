import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, FileText, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusConfig = {
    draft:   { label: 'Draft',   variant: 'secondary' },
    sent:    { label: 'Sent',    variant: 'info' },
    partial: { label: 'Partial', variant: 'warning' },
    paid:    { label: 'Paid',    variant: 'success' },
    overdue: { label: 'Overdue', variant: 'destructive' },
}

export default function PurchaseIndex({ invoices = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const list = invoices.data ?? []

    const totalBill   = list.reduce((s, i) => s + parseFloat(i.grand_total || 0), 0)
    const totalUnpaid = list.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0)

    return (
        <AppLayout>
            <Head title="Purchase Bills" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Purchase Bills</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage vendor bills and payments</p>
                    </div>
                    <Button onClick={() => router.visit('/invoices/create?type=purchase')}>
                        <Plus className="w-4 h-4 mr-2" /> New Bill
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Bills', value: invoices.total ?? list.length, format: 'count' },
                        { label: 'Total Billed', value: totalBill, format: 'currency' },
                        { label: 'Amount Due', value: totalUnpaid, format: 'currency', highlight: totalUnpaid > 0 },
                    ].map((s) => (
                        <Card key={s.label} className={s.highlight ? 'border-red-300 dark:border-red-700' : ''}>
                            <CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">{s.label}</div>
                                <div className={`text-2xl font-bold mt-1 font-mono ${s.highlight ? 'text-red-600' : ''}`}>
                                    {s.format === 'currency' ? formatCurrency(s.value) : s.value.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search bills..." value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.get('/invoices/purchase', { search }, { preserveState: true })}
                                    className="pl-9" />
                            </div>
                            <select defaultValue={filters.status ?? ''}
                                onChange={(e) => router.get('/invoices/purchase', { ...filters, status: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                <option value="">All Status</option>
                                {Object.entries(statusConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill #</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance Due</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No purchase bills yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((inv) => {
                                    const cfg = statusConfig[inv.status] ?? statusConfig.draft
                                    const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.payment_status !== 'paid'
                                    return (
                                        <TableRow key={inv.id} className="group hover:bg-muted/50">
                                            <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                                            <TableCell className="font-medium">{inv.party?.name ?? '—'}</TableCell>
                                            <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                                            <TableCell className={isOverdue ? 'text-red-500 font-medium' : ''}>{formatDate(inv.due_date)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {parseFloat(inv.balance_due) > 0
                                                    ? <span className="text-red-600 font-medium">{formatCurrency(inv.balance_due)}</span>
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isOverdue ? 'destructive' : cfg.variant}>
                                                    {isOverdue ? 'Overdue' : cfg.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                                    onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                                    <Eye className="w-3 h-3" />
                                                </Button>
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
