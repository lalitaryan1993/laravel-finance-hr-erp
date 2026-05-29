import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Building2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function BankingIndex({ bankAccounts = [], recentTransactions = [] }) {
    const totalBalance = bankAccounts.reduce((s, a) => s + parseFloat(a.current_balance || 0), 0)

    return (
        <AppLayout>
            <Head title="Banking" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Banking</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage bank accounts and transactions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" /> Reconcile
                        </Button>
                        <Button onClick={() => router.visit('/banking/accounts/create')}>
                            <Plus className="w-4 h-4 mr-2" /> Add Account
                        </Button>
                    </div>
                </div>

                {/* Total Balance */}
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                    <CardContent className="p-6">
                        <div className="text-blue-100 text-sm">Total Bank Balance</div>
                        <div className="text-4xl font-bold mt-1 font-mono">{formatCurrency(totalBalance)}</div>
                        <div className="text-blue-200 text-sm mt-2">{bankAccounts.length} accounts connected</div>
                    </CardContent>
                </Card>

                {/* Bank Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bankAccounts.map((acct) => (
                        <Card key={acct.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.visit(`/banking/accounts/${acct.id}`)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <Badge variant={acct.is_active ? 'success' : 'secondary'} className="text-xs">
                                        {acct.account_type?.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="font-bold text-lg">{acct.bank_name}</div>
                                <div className="text-sm text-muted-foreground font-mono">****{acct.account_number?.slice(-4)}</div>
                                <div className="mt-3 pt-3 border-t border-border">
                                    <div className="text-xs text-muted-foreground">Current Balance</div>
                                    <div className={cn('text-xl font-bold font-mono', parseFloat(acct.current_balance) < 0 ? 'text-red-500' : '')}>
                                        {formatCurrency(acct.current_balance)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.visit('/banking/accounts/create')}>
                        <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground">
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="font-medium">Add Bank Account</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Transactions</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.visit('/banking/transactions')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No recent transactions
                                        </TableCell>
                                    </TableRow>
                                ) : recentTransactions.map((txn) => (
                                    <TableRow key={txn.id} className="hover:bg-muted/50">
                                        <TableCell>{formatDate(txn.transaction_date)}</TableCell>
                                        <TableCell className="font-medium">{txn.description}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{txn.bankAccount?.bank_name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn('flex items-center justify-end gap-1 font-mono font-medium',
                                                txn.type === 'credit' ? 'text-green-600' : 'text-red-500')}>
                                                {txn.type === 'credit'
                                                    ? <ArrowDownRight className="w-3 h-3" />
                                                    : <ArrowUpRight className="w-3 h-3" />}
                                                {formatCurrency(txn.amount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={txn.is_reconciled ? 'success' : 'outline'} className="text-xs">
                                                {txn.is_reconciled ? 'Reconciled' : 'Unreconciled'}
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
