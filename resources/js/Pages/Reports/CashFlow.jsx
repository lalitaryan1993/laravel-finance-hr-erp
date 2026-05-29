import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, TrendingDown, Printer } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n ?? 0)

export default function CashFlow({ totals, filters }) {
    const [from, setFrom] = useState(filters.from)
    const [to, setTo]     = useState(filters.to)

    function applyFilter() {
        router.get(route('reports.cash-flow'), { from, to }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="Cash Flow" />
            <div className="max-w-4xl space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('reports.index')} className="text-sm text-muted-foreground hover:text-foreground">← Reports</Link>
                        <h1 className="text-2xl font-bold mt-1">Cash Flow Statement</h1>
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
                            <Button onClick={applyFilter}>Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Cash Inflows</p>
                            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 font-mono">₹{fmt(totals.inflows)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Cash Outflows</p>
                            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 font-mono">₹{fmt(totals.outflows)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                            <div className="flex items-center gap-2 mt-1">
                                {totals.net >= 0
                                    ? <TrendingUp className="w-5 h-5 text-green-500" />
                                    : <TrendingDown className="w-5 h-5 text-red-500" />}
                                <p className={`text-2xl font-bold font-mono ${totals.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    ₹{fmt(Math.abs(totals.net))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cash movement table */}
                <Card>
                    <CardHeader className="border-b py-3">
                        <CardTitle className="text-base">Cash Movement Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-5 py-3 text-foreground">Total Cash Inflows</td>
                                    <td className="px-5 py-3 text-right font-mono font-semibold text-green-600 dark:text-green-400">
                                        + ₹{fmt(totals.inflows)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-5 py-3 text-foreground">Total Cash Outflows</td>
                                    <td className="px-5 py-3 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                                        - ₹{fmt(totals.outflows)}
                                    </td>
                                </tr>
                                <tr className="bg-muted/40">
                                    <td className="px-5 py-3 font-bold">Net Cash Position</td>
                                    <td className={`px-5 py-3 text-right font-bold font-mono ${totals.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        ₹{fmt(totals.net)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
