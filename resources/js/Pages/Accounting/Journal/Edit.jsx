import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const emptyLine = () => ({ account_id: '', debit: '', credit: '', description: '' })

export default function JournalEdit({ journal, accounts = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        date: journal.date ?? '',
        journal_type: journal.journal_type ?? 'general',
        narration: journal.narration ?? '',
        reference: journal.reference ?? '',
        lines: journal.lines?.length
            ? journal.lines.map((l) => ({ account_id: l.account_id, debit: l.debit, credit: l.credit, description: l.description ?? '' }))
            : [emptyLine(), emptyLine()],
    })

    const setLine = (i, field, val) => {
        const lines = [...data.lines]
        lines[i] = { ...lines[i], [field]: val }
        setData('lines', lines)
    }

    const addLine = () => setData('lines', [...data.lines, emptyLine()])
    const removeLine = (i) => setData('lines', data.lines.filter((_, idx) => idx !== i))

    const totalDebit  = data.lines.reduce((s, l) => s + parseFloat(l.debit  || 0), 0)
    const totalCredit = data.lines.reduce((s, l) => s + parseFloat(l.credit || 0), 0)
    const balanced    = Math.abs(totalDebit - totalCredit) < 0.001

    const submit = (e) => {
        e.preventDefault()
        put(`/accounting/journal/${journal.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit — ${journal.journal_number}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/accounting/journal/${journal.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Journal Entry</h1>
                        <p className="text-muted-foreground text-sm font-mono">{journal.journal_number}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date *</label>
                                <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Journal Type</label>
                                <select value={data.journal_type} onChange={(e) => setData('journal_type', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    {['general', 'sales', 'purchase', 'payment', 'receipt', 'contra', 'adjustment'].map((t) =>
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Narration</label>
                                <Input value={data.narration} onChange={(e) => setData('narration', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Reference</label>
                                <Input value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Journal Lines</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Line
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-32 text-right">Debit (₹)</TableHead>
                                        <TableHead className="w-32 text-right">Credit (₹)</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.lines.map((line, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <select value={line.account_id} onChange={(e) => setLine(i, 'account_id', e.target.value)}
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                                    <option value="">Select account</option>
                                                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                                                </select>
                                            </TableCell>
                                            <TableCell>
                                                <Input value={line.description} onChange={(e) => setLine(i, 'description', e.target.value)}
                                                    placeholder="Description" className="h-9" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" step="0.01" min="0" value={line.debit}
                                                    onChange={(e) => setLine(i, 'debit', e.target.value)}
                                                    className="h-9 text-right font-mono" />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" step="0.01" min="0" value={line.credit}
                                                    onChange={(e) => setLine(i, 'credit', e.target.value)}
                                                    className="h-9 text-right font-mono" />
                                            </TableCell>
                                            <TableCell>
                                                {data.lines.length > 2 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className={`font-semibold ${!balanced ? 'bg-red-50 dark:bg-red-950' : 'bg-muted/30'}`}>
                                        <TableCell colSpan={2} className="text-right">
                                            {!balanced && <span className="text-destructive text-xs mr-2">Not balanced</span>}
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalDebit)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalCredit)}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/accounting/journal/${journal.id}`)}>Cancel</Button>
                        <Button type="submit" loading={processing} disabled={!balanced}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
