import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function BankTransactions({ transactions = {}, accounts = [], filters = {} }) {
    const [from, setFrom] = useState(filters.from ?? '')
    const [to, setTo]     = useState(filters.to ?? '')
    const list = transactions.data ?? []

    const applyFilter = () => {
        router.get('/banking/transactions', { ...filters, from, to }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="Bank Transactions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Bank Transactions</h1>
                        <p className="text-muted-foreground text-sm mt-1">{transactions.total ?? list.length} transactions</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap gap-3">
                            <select value={filters.account_id ?? ''}
                                onChange={(e) => router.get('/banking/transactions', { ...filters, account_id: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]">
                                <option value="">All Accounts</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} — {a.account_name}</option>)}
                            </select>
                            <select value={filters.type ?? ''}
                                onChange={(e) => router.get('/banking/transactions', { ...filters, type: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                <option value="">All Types</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36" placeholder="From" />
                            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36" placeholder="To" />
                            <Button variant="outline" onClick={applyFilter}>Apply</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((txn) => (
                                    <TableRow key={txn.id} className="hover:bg-muted/50">
                                        <TableCell>{formatDate(txn.transaction_date)}</TableCell>
                                        <TableCell className="font-medium">{txn.description}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {txn.bankAccount?.bank_name}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {txn.reference_number ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn('flex items-center justify-end gap-1 font-mono font-medium',
                                                txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500')}>
                                                {txn.transaction_type === 'credit'
                                                    ? <ArrowDownRight className="w-3 h-3" />
                                                    : <ArrowUpRight className="w-3 h-3" />}
                                                {formatCurrency(txn.amount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={txn.is_reconciled ? 'success' : 'outline'} className="text-xs">
                                                {txn.is_reconciled ? 'Reconciled' : 'Pending'}
                                            </Badge>
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
