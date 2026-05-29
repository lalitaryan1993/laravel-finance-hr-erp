import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS = {
    draft:     { label: 'Draft',     class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    sent:      { label: 'Sent',      class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    partial:   { label: 'Partial',   class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    paid:      { label: 'Paid',      class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    overdue:   { label: 'Overdue',   class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    voided:    { label: 'Voided',    class: 'bg-muted text-muted-foreground' },
    cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground' },
}

const TYPE_LABELS = {
    sales: 'Sales', tax_invoice: 'Tax Invoice', purchase: 'Purchase',
    credit_note: 'Credit Note', debit_note: 'Debit Note',
    proforma: 'Proforma', export_invoice: 'Export',
}

const QUICK_LINKS = [
    { label: 'Sales Invoices',  href: '/invoices/sales',       color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Purchase Bills',  href: '/invoices/purchase',    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Credit Notes',    href: '/invoices/credit-notes',color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Proforma',        href: '/invoices/proforma',    color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Recurring',       href: '/invoices/recurring',   color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' },
]

export default function InvoicesIndex({ invoices = {}, filters = {} }) {
    const list = invoices.data ?? []
    const [search, setSearch] = useState(filters.search ?? '')

    function isOverdue(inv) {
        return inv.due_date && new Date(inv.due_date) < new Date()
            && inv.status !== 'paid' && inv.status !== 'voided'
    }

    function statusKey(inv) {
        return isOverdue(inv) ? 'overdue' : inv.status
    }

    const totalInvoices  = invoices.total ?? list.length
    const totalAmount    = list.reduce((s, i) => s + parseFloat(i.grand_total || 0), 0)
    const totalOutstanding = list.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0)

    return (
        <AppLayout>
            <Head title="Invoices" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Invoices</h1>
                        <p className="text-muted-foreground text-sm mt-1">All invoices across sales, purchase and credit notes</p>
                    </div>
                    <Button onClick={() => router.visit('/invoices/create')}>
                        <Plus className="w-4 h-4 mr-2" /> New Invoice
                    </Button>
                </div>

                {/* Quick nav */}
                <div className="flex gap-3 flex-wrap">
                    {QUICK_LINKS.map(l => (
                        <button key={l.href}
                            onClick={() => router.visit(l.href)}
                            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80', l.color)}>
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Invoices</div>
                        <div className="text-2xl font-bold mt-1">{totalInvoices}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Amount (page)</div>
                        <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalAmount)}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Outstanding (page)</div>
                        <div className={cn('text-2xl font-bold font-mono mt-1', totalOutstanding > 0 ? 'text-orange-500' : '')}>
                            {formatCurrency(totalOutstanding)}
                        </div>
                    </CardContent></Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search invoice # or party..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && router.get('/invoices', { search }, { preserveState: true })}
                                    className="pl-9" />
                            </div>
                            <select defaultValue={filters.status ?? ''}
                                onChange={e => router.get('/invoices', { ...filters, status: e.target.value }, { preserveState: true })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[130px]">
                                <option value="">All Statuses</option>
                                {Object.entries(STATUS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Party</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No invoices found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map(inv => {
                                    const overdue = isOverdue(inv)
                                    const sk = statusKey(inv)
                                    const sc = STATUS[sk] ?? STATUS.draft
                                    const balDue = parseFloat(inv.balance_due || 0)

                                    return (
                                        <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/invoices/${inv.id}`)}>
                                            <TableCell className="font-mono text-sm font-semibold text-primary">{inv.invoice_number}</TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {TYPE_LABELS[inv.type] ?? inv.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{inv.party?.name ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(inv.invoice_date)}</TableCell>
                                            <TableCell>
                                                <span className={cn('text-sm', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
                                                    {formatDate(inv.due_date) ?? '—'}
                                                    {overdue && <AlertTriangle className="inline ml-1 w-3 h-3" />}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(inv.grand_total)}</TableCell>
                                            <TableCell className="text-right">
                                                {balDue > 0 ? (
                                                    <span className="font-mono font-semibold text-orange-500">{formatCurrency(balDue)}</span>
                                                ) : (
                                                    <span className="text-green-500 text-xs flex items-center justify-end gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-semibold', sc.class)}>
                                                    {sc.label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {invoices.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {invoices.from}–{invoices.to} of {invoices.total}
                                </p>
                                <div className="flex gap-1">
                                    {invoices.links?.map((link, i) => (
                                        <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className="h-8 min-w-[32px] px-2 text-xs"
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
