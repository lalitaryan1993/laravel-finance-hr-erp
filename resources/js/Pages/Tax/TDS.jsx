import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, TrendingDown, Landmark, Printer, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n ?? 0)

export default function TDS({ tdsDeducted, tdsCollected, netTds, filters }) {
    const [from, setFrom] = useState(filters.from)
    const [to, setTo]     = useState(filters.to)

    function applyFilter() {
        router.get(route('tax.tds'), { from, to }, { preserveState: true })
    }

    const isPayable = (netTds ?? (tdsDeducted - tdsCollected)) > 0

    return (
        <AppLayout>
            <Head title="TDS Report" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">TDS Summary</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Tax Deducted at Source — deducted vs collected</p>
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
                                <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">TDS Deducted</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">₹{fmt(tdsDeducted)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Deducted from vendor / supplier payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">TDS Collected</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">₹{fmt(tdsCollected)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Deducted by customers from your invoices</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed">
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                    <Landmark className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Net TDS Payable</p>
                            </div>
                            <p className="text-2xl font-bold font-mono">₹{fmt(Math.abs(netTds ?? (tdsDeducted - tdsCollected)))}</p>
                            <Badge variant={isPayable ? 'destructive' : 'success'} className="mt-2 text-xs">
                                {isPayable ? 'Deposit to Govt' : 'Credit Available'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Liability detail */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="text-base">TDS Liability Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-5 py-4">
                                        <p className="font-medium">TDS Deducted from Payments</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Amount deducted from vendor/supplier bills — to be deposited with government</p>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">₹{fmt(tdsDeducted)}</span>
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-5 py-4">
                                        <p className="font-medium">TDS Deducted by Customers</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">TDS your customers deducted on your sales invoices — receivable / adjustable</p>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">₹{fmt(tdsCollected)}</span>
                                    </td>
                                </tr>
                                <tr className={cn('font-semibold', isPayable ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10')}>
                                    <td className="px-5 py-4">
                                        <p className="font-bold">Net TDS Payable to Government</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 font-normal">TDS Deducted − TDS Collected</p>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={cn('font-mono font-bold text-lg', isPayable ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                                            ₹{fmt(netTds ?? (tdsDeducted - tdsCollected))}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Info note */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/40 border text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>TDS must be deposited with the government by the 7th of the following month. File quarterly TDS returns (Form 26Q / 27Q) as applicable.</p>
                </div>
            </div>
        </AppLayout>
    )
}
