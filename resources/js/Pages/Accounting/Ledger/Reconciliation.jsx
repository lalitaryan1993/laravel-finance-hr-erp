import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, AlertCircle, Landmark, Calendar, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function Reconciliation({ bankAccounts = [], transactions = [], selectedAccount, stats, filters = {} }) {
    const [selected,   setSelected]   = useState([])
    const [processing, setProcessing] = useState(false)

    const accountId = filters.bank_account_id ?? ''
    const from      = filters.from ?? ''
    const to        = filters.to   ?? ''

    function applyFilter(overrides) {
        setSelected([])
        router.get('/accounting/reconciliation', { bank_account_id: accountId, from, to, ...overrides }, {
            preserveScroll: true,
        })
    }

    function toggleAll(e) {
        setSelected(e.target.checked ? transactions.map(t => t.id) : [])
    }

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    function reconcile() {
        if (!selected.length) return
        setProcessing(true)
        router.post('/accounting/reconciliation', {
            transaction_ids:  selected,
            bank_account_id:  accountId,
        }, {
            onFinish: () => { setProcessing(false); setSelected([]) },
        })
    }

    const statCards = [
        { label: 'Accounts to Reconcile', value: stats?.accounts_to_reconcile ?? 0, icon: AlertCircle,   color: 'text-amber-500' },
        { label: 'Reconciled This Month',  value: stats?.reconciled_this_month  ?? 0, icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Unmatched Entries',      value: stats?.unmatched_entries       ?? 0, icon: AlertCircle,  color: 'text-red-500' },
    ]

    const allChecked = transactions.length > 0 && selected.length === transactions.length

    return (
        <AppLayout>
            <Head title="Account Reconciliation" />
            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold">Account Reconciliation</h1>
                    <p className="text-muted-foreground text-sm mt-1">Match bank transactions against your book entries</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {statCards.map(s => (
                        <Card key={s.label}>
                            <CardContent className="p-5 flex items-center gap-4">
                                <s.icon className={cn('w-8 h-8 shrink-0', s.color)} />
                                <div>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-sm text-muted-foreground">{s.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bank Account Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bankAccounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Landmark className="w-10 h-10 mb-3 opacity-30" />
                                <p className="font-medium">No bank accounts found</p>
                                <p className="text-sm mt-1">Add bank accounts in the Banking module first</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {bankAccounts.map(acct => (
                                    <button
                                        key={acct.id}
                                        onClick={() => applyFilter({ bank_account_id: acct.id })}
                                        className={cn(
                                            'text-left p-4 rounded-lg border-2 transition-all hover:shadow-md',
                                            String(accountId) === String(acct.id)
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                                : 'border-border hover:border-blue-200'
                                        )}
                                    >
                                        <div className="font-semibold text-sm">{acct.account_name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{acct.bank_name} · {acct.account_number}</div>
                                        <div className="mt-2 text-base font-bold">{formatCurrency(acct.current_balance, acct.currency)}</div>
                                        <div className="mt-1.5 text-xs text-muted-foreground">
                                            {acct.last_reconciled_date
                                                ? <>Last reconciled: {formatDate(acct.last_reconciled_date)}</>
                                                : 'Never reconciled'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transactions Panel */}
                {selectedAccount && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <CardTitle>
                                    Unreconciled — {selectedAccount.account_name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* Date range */}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="date"
                                            value={from}
                                            onChange={e => applyFilter({ from: e.target.value })}
                                            className="border border-border rounded px-2 py-1 text-sm bg-background h-8"
                                        />
                                        <span className="text-muted-foreground text-sm">–</span>
                                        <input
                                            type="date"
                                            value={to}
                                            onChange={e => applyFilter({ to: e.target.value })}
                                            className="border border-border rounded px-2 py-1 text-sm bg-background h-8"
                                        />
                                    </div>

                                    {selected.length > 0 && (
                                        <Button
                                            size="sm"
                                            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={reconcile}
                                            disabled={processing}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Reconcile {selected.length} selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <CheckCircle2 className="w-12 h-12 mb-3 text-green-500 opacity-60" />
                                    <p className="font-medium">All transactions reconciled</p>
                                    <p className="text-sm mt-1">No unreconciled transactions in the selected period</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={allChecked}
                                                        onChange={toggleAll}
                                                        className="w-4 h-4 rounded"
                                                    />
                                                </TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map(tx => {
                                                const isCredit = tx.transaction_type === 'credit'
                                                return (
                                                    <TableRow
                                                        key={tx.id}
                                                        className={cn(
                                                            'cursor-pointer',
                                                            selected.includes(tx.id) && 'bg-blue-50/50 dark:bg-blue-900/10'
                                                        )}
                                                        onClick={() => toggleOne(tx.id)}
                                                    >
                                                        <TableCell onClick={e => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(tx.id)}
                                                                onChange={() => toggleOne(tx.id)}
                                                                className="w-4 h-4 rounded"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">{formatDate(tx.transaction_date)}</TableCell>
                                                        <TableCell className="text-sm max-w-xs truncate">{tx.description ?? '—'}</TableCell>
                                                        <TableCell className="font-mono text-xs">{tx.reference_number ?? '—'}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-xs',
                                                                    isCredit
                                                                        ? 'text-green-600 border-green-200'
                                                                        : 'text-red-600 border-red-200'
                                                                )}
                                                            >
                                                                {isCredit ? 'Credit' : 'Debit'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className={cn(
                                                            'text-right font-mono text-sm font-medium',
                                                            isCredit ? 'text-green-600' : 'text-red-600'
                                                        )}>
                                                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount, selectedAccount.currency)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                                            {tx.balance != null ? formatCurrency(tx.balance, selectedAccount.currency) : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
