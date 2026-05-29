import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function BankingReconciliation({ accounts = [], selectedAccount = null, transactions = [], filters = {} }) {
    const totalUnreconciled = transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0)

    return (
        <AppLayout>
            <Head title="Bank Reconciliation" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
                        <p className="text-muted-foreground text-sm mt-1">Match transactions against bank statement</p>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <select value={filters.account_id ?? selectedAccount?.id ?? ''}
                        onChange={(e) => router.get('/banking/reconciliation', { account_id: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[240px]">
                        <option value="">Select account...</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} — {a.account_name}</option>)}
                    </select>
                    {selectedAccount && (
                        <div className="text-sm text-muted-foreground">
                            Current Balance: <span className="font-mono font-medium">{formatCurrency(selectedAccount.current_balance)}</span>
                        </div>
                    )}
                </div>

                {selectedAccount && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Unreconciled</div>
                                <div className="text-2xl font-bold mt-1">{transactions.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Unreconciled Amount</div>
                                <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalUnreconciled)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Account Balance</div>
                                <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(selectedAccount.current_balance)}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Unreconciled Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-green-500" />
                                            {selectedAccount ? 'All transactions reconciled!' : 'Select an account to begin'}
                                        </TableCell>
                                    </TableRow>
                                ) : transactions.map((txn) => (
                                    <TableRow key={txn.id} className="hover:bg-muted/50">
                                        <TableCell>{formatDate(txn.transaction_date)}</TableCell>
                                        <TableCell className="font-medium">{txn.description}</TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {txn.reference_number ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={cn('font-mono font-medium',
                                                txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500')}>
                                                {txn.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button size="sm" variant="outline" className="h-7 text-xs">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Reconciled
                                            </Button>
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
