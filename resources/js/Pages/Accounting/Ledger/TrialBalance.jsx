import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function TrialBalance({ accounts = [], totals = {}, asOf = '', filters = {} }) {
    const [date, setDate] = useState(asOf || new Date().toISOString().slice(0, 10))

    const balanced = Math.abs((totals.total_debit ?? 0) - (totals.total_credit ?? 0)) < 0.01

    return (
        <AppLayout>
            <Head title="Trial Balance" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Trial Balance</h1>
                        <p className="text-muted-foreground text-sm mt-1">Summary of all account balances</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">As of Date</label>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={() => router.get('/accounting/trial-balance', { as_of: date })}>
                                    Generate
                                </Button>
                            </div>
                            <div className={cn('flex items-center gap-2 ml-auto px-4 py-2 rounded-lg text-sm font-medium',
                                balanced ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                         : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                                {balanced
                                    ? <><CheckCircle className="w-4 h-4" /> Trial Balance is Balanced</>
                                    : <><AlertTriangle className="w-4 h-4" /> Out of Balance — Difference: {formatCurrency(Math.abs((totals.total_debit ?? 0) - (totals.total_credit ?? 0)))}</>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Debit Balance</TableHead>
                                    <TableHead className="text-right">Credit Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-sm">{acc.code}</TableCell>
                                        <TableCell className="font-medium">{acc.name}</TableCell>
                                        <TableCell className="capitalize text-muted-foreground">{acc.type}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {acc.debit_balance > 0 ? formatCurrency(acc.debit_balance) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {acc.credit_balance > 0 ? formatCurrency(acc.credit_balance) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/50 font-bold border-t-2 border-border">
                                    <TableCell colSpan={3} className="text-right font-bold">TOTAL</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-lg">
                                        {formatCurrency(totals.total_debit ?? 0)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-lg">
                                        {formatCurrency(totals.total_credit ?? 0)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
