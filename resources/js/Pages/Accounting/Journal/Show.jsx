import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function JournalShow({ journal }) {
    const lines = journal.lines ?? []

    const post   = () => router.post(`/accounting/journal/${journal.id}/post`)
    const voidJ  = () => router.post(`/accounting/journal/${journal.id}/void`)
    const reverse = () => router.post(`/accounting/journal/${journal.id}/reverse`)

    const statusVariant = { draft: 'secondary', posted: 'success', voided: 'destructive' }

    return (
        <AppLayout>
            <Head title={journal.journal_number} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/accounting/journal')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold font-mono">{journal.journal_number}</h1>
                        <p className="text-muted-foreground text-sm capitalize">{journal.journal_type?.replace('_', ' ')} · {formatDate(journal.date)}</p>
                    </div>
                    <Badge variant={statusVariant[journal.status] ?? 'secondary'} className="capitalize">
                        {journal.status}
                    </Badge>
                    {journal.status === 'draft' && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => router.visit(`/accounting/journal/${journal.id}/edit`)}>
                                Edit
                            </Button>
                            <Button size="sm" onClick={post}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Post
                            </Button>
                        </>
                    )}
                    {journal.status === 'posted' && (
                        <>
                            <Button variant="outline" size="sm" onClick={reverse}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Reverse
                            </Button>
                            <Button variant="destructive" size="sm" onClick={voidJ}>
                                <XCircle className="w-4 h-4 mr-2" /> Void
                            </Button>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Date</div>
                            <div className="font-semibold mt-0.5">{formatDate(journal.date)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Type</div>
                            <div className="font-semibold mt-0.5 capitalize">{journal.journal_type?.replace('_', ' ')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Total Debit</div>
                            <div className="font-mono font-semibold mt-0.5">{formatCurrency(journal.total_debit)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Total Credit</div>
                            <div className="font-mono font-semibold mt-0.5">{formatCurrency(journal.total_credit)}</div>
                        </CardContent>
                    </Card>
                </div>

                {journal.narration && (
                    <Card>
                        <CardContent className="p-4 text-sm text-muted-foreground italic">
                            {journal.narration}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle>Journal Lines</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((l) => (
                                    <TableRow key={l.id}>
                                        <TableCell>
                                            <span className="font-mono text-sm text-muted-foreground mr-2">{l.account?.code}</span>
                                            <span className="font-medium">{l.account?.name}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{l.description ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(l.debit) > 0 ? formatCurrency(l.debit) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(l.credit) > 0 ? formatCurrency(l.credit) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-semibold bg-muted/30">
                                    <TableCell colSpan={2} className="text-right">Total</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(journal.total_debit)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(journal.total_credit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
