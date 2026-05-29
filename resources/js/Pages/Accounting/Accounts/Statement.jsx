import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Printer } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AccountStatement({ account, lines = {} }) {
    const list = lines.data ?? []
    const [from, setFrom] = useState('')
    const [to, setTo]   = useState('')

    const applyFilter = () => {
        router.get(`/accounting/accounts/${account.id}/statement`, { from, to })
    }

    let runningBalance = parseFloat(account.opening_balance || 0)
    const rows = list.map((l) => {
        const dr = parseFloat(l.debit || 0)
        const cr = parseFloat(l.credit || 0)
        runningBalance += account.nature === 'debit' ? dr - cr : cr - dr
        return { ...l, runningBalance }
    })

    return (
        <AppLayout>
            <Head title={`Statement — ${account.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/accounting/accounts/${account.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Account Statement</h1>
                        <p className="text-muted-foreground text-sm font-mono">{account.code} · {account.name}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>

                <div className="flex gap-3 items-end bg-muted/30 rounded-lg p-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">From</label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-36" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">To</label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-36" />
                    </div>
                    <Button variant="outline" onClick={applyFilter}>Apply</Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Ledger Entries</CardTitle>
                            <span className="text-sm text-muted-foreground">Opening Balance: {formatCurrency(account.opening_balance)}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No transactions in this period
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((l) => (
                                    <TableRow key={l.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-sm">{l.journal?.journal_number}</TableCell>
                                        <TableCell>{formatDate(l.journal?.date)}</TableCell>
                                        <TableCell className="text-muted-foreground">{l.description ?? l.journal?.narration ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(l.debit) > 0 ? formatCurrency(l.debit) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(l.credit) > 0 ? formatCurrency(l.credit) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {formatCurrency(Math.abs(l.runningBalance))} {l.runningBalance < 0 ? 'Cr' : 'Dr'}
                                        </TableCell>
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
