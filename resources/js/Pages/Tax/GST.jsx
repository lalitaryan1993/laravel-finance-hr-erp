import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, TrendingDown, Minus, FileText, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n ?? 0)

export default function GST({ outputGst, inputGst, netGst, salesInvoices, purchaseInvoices, filters }) {
    const [from, setFrom] = useState(filters.from)
    const [to, setTo]     = useState(filters.to)

    function applyFilter() {
        router.get(route('tax.gst'), { from, to }, { preserveState: true })
    }

    const isPayable = netGst >= 0

    return (
        <AppLayout>
            <Head title="GST Report" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">GST Summary</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Goods and Services Tax — output vs input reconciliation</p>
                    </div>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>

                {/* Date filter */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">From</label>
                                <DatePicker value={from} onChange={setFrom} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">To</label>
                                <DatePicker value={to} onChange={setTo} />
                            </div>
                            <Button onClick={applyFilter}>Apply Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Output GST</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">₹{fmt(outputGst)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{salesInvoices.length} sales invoice{salesInvoices.length !== 1 ? 's' : ''}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Input GST</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">₹{fmt(inputGst)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{purchaseInvoices.length} purchase invoice{purchaseInvoices.length !== 1 ? 's' : ''}</p>
                        </CardContent>
                    </Card>
                    <Card className={cn('border-2', isPayable ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800')}>
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
                                    isPayable ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30')}>
                                    {isPayable
                                        ? <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        : <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Net GST {isPayable ? 'Payable' : 'Refundable'}</p>
                            </div>
                            <p className={cn('text-2xl font-bold font-mono',
                                isPayable ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                                ₹{fmt(Math.abs(netGst))}
                            </p>
                            <Badge variant={isPayable ? 'destructive' : 'success'} className="mt-2 text-xs">
                                {isPayable ? 'Tax Payable to Govt' : 'Refund Receivable'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Reconciliation summary row */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                            <span className="text-muted-foreground">GST Reconciliation</span>
                            <div className="flex items-center gap-6 font-mono text-sm">
                                <span className="text-blue-600 dark:text-blue-400">Output: ₹{fmt(outputGst)}</span>
                                <span className="text-muted-foreground">−</span>
                                <span className="text-purple-600 dark:text-purple-400">Input: ₹{fmt(inputGst)}</span>
                                <span className="text-muted-foreground">=</span>
                                <span className={cn('font-bold', isPayable ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                                    Net: ₹{fmt(netGst)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice tables */}
                <GSTTable title="Output GST — Sales Invoices" invoices={salesInvoices} emptyText="No sales invoices in this period" />
                <GSTTable title="Input GST — Purchase Invoices" invoices={purchaseInvoices} emptyText="No purchase invoices in this period" />
            </div>
        </AppLayout>
    )
}

function GSTTable({ title, invoices, emptyText }) {
    const total = invoices.reduce((s, i) => s + i.tax_amount, 0)

    return (
        <Card>
            <CardHeader className="pb-0 border-b">
                <div className="flex items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {title}
                    </CardTitle>
                    <span className="font-mono font-semibold text-sm">₹{fmt(total)}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/30 border-b">
                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Invoice #</th>
                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Party</th>
                            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Taxable</th>
                            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">GST</th>
                            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 font-mono font-medium text-primary">{inv.invoice_number}</td>
                                <td className="px-4 py-3 text-muted-foreground">{inv.invoice_date}</td>
                                <td className="px-4 py-3">{inv.party_name}</td>
                                <td className="px-4 py-3 text-right font-mono">₹{fmt(inv.subtotal)}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">₹{fmt(inv.tax_amount)}</td>
                                <td className="px-4 py-3 text-right font-mono font-bold">₹{fmt(inv.grand_total)}</td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{emptyText}</td>
                            </tr>
                        )}
                    </tbody>
                    {invoices.length > 0 && (
                        <tfoot>
                            <tr className="bg-muted/30 border-t font-semibold">
                                <td colSpan={3} className="px-4 py-2.5 text-muted-foreground">Total ({invoices.length} invoices)</td>
                                <td className="px-4 py-2.5 text-right font-mono">₹{fmt(invoices.reduce((s, i) => s + i.subtotal, 0))}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400">₹{fmt(total)}</td>
                                <td className="px-4 py-2.5 text-right font-mono">₹{fmt(invoices.reduce((s, i) => s + i.grand_total, 0))}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </CardContent>
        </Card>
    )
}
