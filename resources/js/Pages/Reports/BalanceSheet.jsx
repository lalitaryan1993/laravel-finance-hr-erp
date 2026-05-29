import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Printer } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n ?? 0)

export default function BalanceSheet({ accounts, totals, asOf }) {
    const [date, setDate] = useState(asOf)

    const assets      = accounts.filter(a => a.type === 'asset')
    const liabilities = accounts.filter(a => a.type === 'liability')
    const equity      = accounts.filter(a => a.type === 'equity')

    const balanced = Math.abs(totals.assets - (totals.liabilities + totals.equity)) < 0.01

    function applyFilter() {
        router.get(route('reports.balance-sheet'), { as_of: date }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="Balance Sheet" />
            <div className="max-w-5xl space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('reports.index')} className="text-sm text-muted-foreground hover:text-foreground">← Reports</Link>
                        <h1 className="text-2xl font-bold mt-1">Balance Sheet</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={balanced ? 'success' : 'destructive'}>
                            {balanced ? 'Balanced' : 'Unbalanced'}
                        </Badge>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                    </div>
                </div>

                {/* Date filter */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">As of Date</label>
                                <DatePicker value={date} onChange={setDate} />
                            </div>
                            <Button onClick={applyFilter}>Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Assets */}
                    <BSSection title="Assets" rows={assets} total={totals.assets} />

                    {/* Right: Liabilities + Equity */}
                    <div className="space-y-4">
                        <BSSection title="Liabilities" rows={liabilities} total={totals.liabilities} />
                        <BSSection title="Equity" rows={equity} total={totals.equity} />

                        <Card>
                            <CardContent className="py-3">
                                <div className="flex justify-between font-bold">
                                    <span>Total Liabilities &amp; Equity</span>
                                    <span className="font-mono">₹{fmt(totals.liabilities + totals.equity)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

function BSSection({ title, rows, total }) {
    return (
        <Card>
            <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <span className="font-bold font-mono">₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(total)}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-2.5 text-muted-foreground w-20 font-mono text-xs">{r.code}</td>
                                <td className="py-2.5 text-foreground">{r.name}</td>
                                <td className="px-4 py-2.5 text-right font-mono font-medium">
                                    ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(Math.abs(r.balance))}
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
