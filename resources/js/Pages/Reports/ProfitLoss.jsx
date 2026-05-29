import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, TrendingDown, Minus, Printer } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n ?? 0)

export default function ProfitLoss({ accounts, totals, filters }) {
    const [from, setFrom] = useState(filters.from)
    const [to, setTo]     = useState(filters.to)

    const income   = accounts.filter(a => a.type === 'income')
    const expenses = accounts.filter(a => a.type === 'expense')

    function applyFilter() {
        router.get(route('reports.pnl'), { from, to }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="Profit & Loss" />
            <div className="max-w-5xl space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('reports.index')} className="text-sm text-muted-foreground hover:text-foreground">← Reports</Link>
                        <h1 className="text-2xl font-bold mt-1">Profit &amp; Loss Statement</h1>
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
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">₹{fmt(totals.revenue)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">₹{fmt(totals.expenses)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">Net Profit</p>
                            <div className="flex items-center gap-2 mt-1">
                                {totals.net_profit >= 0
                                    ? <TrendingUp className="w-5 h-5 text-green-500" />
                                    : <TrendingDown className="w-5 h-5 text-red-500" />}
                                <p className={`text-2xl font-bold ${totals.net_profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    ₹{fmt(Math.abs(totals.net_profit))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AccountSection title="Income" rows={income} positive />
                <AccountSection title="Expenses" rows={expenses} />
            </div>
        </AppLayout>
    )
}

function AccountSection({ title, rows, positive = false }) {
    const total = rows.reduce((s, r) => s + Number(r.balance), 0)

    return (
        <Card>
            <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <span className="font-bold font-mono">₹{fmt(Math.abs(total))}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-2.5 text-muted-foreground w-24 font-mono text-xs">{row.code}</td>
                                <td className="py-2.5 text-foreground">{row.name}</td>
                                <td className="px-4 py-2.5 text-right font-mono font-medium">
                                    ₹{fmt(Math.abs(Number(row.balance)))}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No records</td></tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}
