import { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const emptyLine = () => ({ account_id: '', description: '', debit: '', credit: '' })

export default function JournalCreate({ accounts = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        journal_type: 'general',
        date: new Date().toISOString().slice(0, 10),
        narration: '',
        reference: '',
        currency: 'INR',
        lines: [emptyLine(), emptyLine()],
    })

    const updateLine = (i, field, value) => {
        const lines = [...data.lines]
        lines[i] = { ...lines[i], [field]: value }
        if (field === 'debit' && value) lines[i].credit = ''
        if (field === 'credit' && value) lines[i].debit = ''
        setData('lines', lines)
    }

    const addLine = () => setData('lines', [...data.lines, emptyLine()])
    const removeLine = (i) => {
        if (data.lines.length <= 2) return
        setData('lines', data.lines.filter((_, idx) => idx !== i))
    }

    const totalDebit  = data.lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0)
    const totalCredit = data.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0)
    const balanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0

    const submit = (e) => {
        e.preventDefault()
        post('/accounting/journal')
    }

    return (
        <AppLayout>
            <Head title="New Journal Entry" />
            <div className="space-y-6 max-w-5xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/accounting/journal')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">New Journal Entry</h1>
                        <p className="text-muted-foreground text-sm">Create a double-entry journal record</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Journal Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Journal Type *</label>
                                <select value={data.journal_type} onChange={(e) => setData('journal_type', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {['general','sales','purchase','payment','receipt','contra','adjustment'].map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date *</label>
                                <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Reference</label>
                                <Input placeholder="e.g. INV-2024-001" value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Currency</label>
                                <select value={data.currency} onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="INR">INR — Indian Rupee</option>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Narration / Description</label>
                                <textarea value={data.narration} onChange={(e) => setData('narration', e.target.value)}
                                    placeholder="Briefly describe this journal entry..."
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Journal Lines</CardTitle>
                                <div className={cn('flex items-center gap-2 text-sm px-3 py-1 rounded-full',
                                    balanced ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                             : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400')}>
                                    {balanced
                                        ? <><CheckCircle className="w-3 h-3" /> Balanced</>
                                        : <><AlertTriangle className="w-3 h-3" /> Not balanced</>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                                <div className="col-span-4">Account</div>
                                <div className="col-span-4">Description</div>
                                <div className="col-span-2 text-right">Debit (₹)</div>
                                <div className="col-span-2 text-right">Credit (₹)</div>
                            </div>
                            {data.lines.map((line, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center group">
                                    <div className="col-span-4">
                                        <select value={line.account_id} onChange={(e) => updateLine(i, 'account_id', e.target.value)}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                            <option value="">Select account...</option>
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-4">
                                        <Input placeholder="Line description" value={line.description}
                                            onChange={(e) => updateLine(i, 'description', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <Input type="number" step="0.01" min="0" placeholder="0.00"
                                            value={line.debit} onChange={(e) => updateLine(i, 'debit', e.target.value)}
                                            className="text-right" />
                                    </div>
                                    <div className="col-span-2 flex gap-1">
                                        <Input type="number" step="0.01" min="0" placeholder="0.00"
                                            value={line.credit} onChange={(e) => updateLine(i, 'credit', e.target.value)}
                                            className="text-right flex-1" />
                                        <Button type="button" variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive h-9 w-9 flex-shrink-0"
                                            onClick={() => removeLine(i)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" size="sm" onClick={addLine} className="mt-2">
                                <Plus className="w-3 h-3 mr-1" /> Add Line
                            </Button>

                            <div className="border-t border-border pt-3 mt-4">
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-8 text-right font-medium text-sm">Totals:</div>
                                    <div className="col-span-2 text-right font-bold font-mono">{formatCurrency(totalDebit)}</div>
                                    <div className="col-span-2 text-right font-bold font-mono pr-10">{formatCurrency(totalCredit)}</div>
                                </div>
                                {!balanced && totalDebit > 0 && (
                                    <div className="text-right text-xs text-orange-600 mt-1">
                                        Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit('/accounting/journal')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!balanced} loading={processing}>
                            Save Journal Entry
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
