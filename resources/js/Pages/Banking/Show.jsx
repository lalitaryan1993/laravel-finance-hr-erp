import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function BankAccountShow({ account }) {
    const transactions = account.transactions ?? []

    return (
        <AppLayout>
            <Head title={account.account_name} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/banking')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{account.account_name}</h1>
                        <p className="text-muted-foreground text-sm">{account.bank_name} · ****{account.account_number?.slice(-4)}</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit(`/banking/accounts/${account.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                        <CardContent className="p-5">
                            <div className="text-blue-100 text-sm">Current Balance</div>
                            <div className="text-3xl font-bold font-mono mt-1">{formatCurrency(account.current_balance ?? account.balance ?? 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Account Type</div>
                            <div className="text-lg font-semibold mt-1 capitalize">{account.account_type?.replace('_', ' ')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">IFSC Code</div>
                            <div className="text-lg font-semibold font-mono mt-1">{account.ifsc_code ?? '—'}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            No transactions yet
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
