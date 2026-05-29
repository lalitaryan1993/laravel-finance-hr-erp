import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Pencil, FileText } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function AccountShow({ account }) {
    const lines = account.journal_lines ?? []

    const balance = lines.reduce((sum, l) => {
        const dr = parseFloat(l.debit || 0)
        const cr = parseFloat(l.credit || 0)
        return account.nature === 'debit' ? sum + dr - cr : sum + cr - dr
    }, parseFloat(account.opening_balance || 0))

    return (
        <AppLayout>
            <Head title={`${account.code} — ${account.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/accounting/accounts')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono text-sm">{account.code}</span>
                            <h1 className="text-2xl font-bold">{account.name}</h1>
                        </div>
                        <p className="text-muted-foreground text-sm capitalize">{account.type} · {account.account_group?.name}</p>
                    </div>
                    <Badge variant={account.is_active ? 'success' : 'secondary'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => router.visit(`/accounting/accounts/${account.id}/statement`)}>
                        <FileText className="w-4 h-4 mr-2" /> Statement
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.visit(`/accounting/accounts/${account.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Opening Balance</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(account.opening_balance)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Transactions</div>
                            <div className="text-2xl font-bold mt-1">{lines.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Current Balance</div>
                            <div className={cn('text-2xl font-bold font-mono mt-1', balance < 0 ? 'text-red-500' : 'text-green-600')}>
                                {formatCurrency(Math.abs(balance))} {balance < 0 ? 'Cr' : 'Dr'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No transactions recorded
                                        </TableCell>
                                    </TableRow>
                                ) : lines.map((l) => (
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
