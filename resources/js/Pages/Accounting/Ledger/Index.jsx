import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function LedgerIndex({ accounts = [], entries = [], account = null, filters = {}, openingBalance = 0 }) {
    const [form, setForm] = useState({
        account_id: filters.account_id ?? '',
        from: filters.from ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        to: filters.to ?? new Date().toISOString().slice(0, 10),
    })

    const runQuery = () => router.get('/accounting/ledger', form, { preserveState: true })

    let runningBalance = openingBalance
    const rows = entries.map((e) => {
        runningBalance += (parseFloat(e.debit) || 0) - (parseFloat(e.credit) || 0)
        return { ...e, balance: runningBalance }
    })

    return (
        <AppLayout>
            <Head title="General Ledger" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">General Ledger</h1>
                        <p className="text-muted-foreground text-sm mt-1">Account statement and transaction history</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account</label>
                                <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select account...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">From Date</label>
                                <Input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">To Date</label>
                                <Input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={runQuery} className="w-full">
                                    <Filter className="w-4 h-4 mr-2" /> View Ledger
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {account && (
                        <CardContent>
                            <div className="bg-muted/50 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-lg">{account.code} — {account.name}</div>
                                        <div className="text-sm text-muted-foreground capitalize">{account.type} | {account.nature} normal balance</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Closing Balance</div>
                                        <div className="text-xl font-bold font-mono">{formatCurrency(runningBalance)}</div>
                                    </div>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Journal #</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={5} className="font-medium">Opening Balance</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(openingBalance)}</TableCell>
                                    </TableRow>
                                    {rows.map((r, i) => (
                                        <TableRow key={i} className="hover:bg-muted/50">
                                            <TableCell>{formatDate(r.date)}</TableCell>
                                            <TableCell className="font-mono text-sm">{r.journal_number}</TableCell>
                                            <TableCell className="text-muted-foreground">{r.description || r.narration}</TableCell>
                                            <TableCell className="text-right font-mono text-green-600">{r.debit > 0 ? formatCurrency(r.debit) : '—'}</TableCell>
                                            <TableCell className="text-right font-mono text-red-500">{r.credit > 0 ? formatCurrency(r.credit) : '—'}</TableCell>
                                            <TableCell className="text-right font-mono font-medium">{formatCurrency(r.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    )}
                </Card>
            </div>
        </AppLayout>
    )
}
