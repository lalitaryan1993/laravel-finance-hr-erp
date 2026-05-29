import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function BankTransfers({ transfers = {}, accounts = [] }) {
    const [showCreate, setShowCreate] = useState(false)
    const list = transfers.data ?? []

    const { data, setData, post, processing, reset, errors } = useForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        transfer_date: new Date().toISOString().slice(0, 10),
        reference: '',
        description: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/banking/transfers', { onSuccess: () => { reset(); setShowCreate(false) } })
    }

    return (
        <AppLayout>
            <Head title="Fund Transfers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Fund Transfers</h1>
                        <p className="text-muted-foreground text-sm mt-1">Move funds between bank accounts</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Transfer
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>From Account</TableHead>
                                    <TableHead />
                                    <TableHead>To Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No transfers recorded yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-muted/50">
                                        <TableCell>{formatDate(t.transfer_date)}</TableCell>
                                        <TableCell className="font-medium">{t.fromAccount?.account_name}</TableCell>
                                        <TableCell><ArrowRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                        <TableCell className="font-medium">{t.toAccount?.account_name}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(t.amount)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{t.reference ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>New Fund Transfer</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">From Account *</label>
                            <select value={data.from_account_id} onChange={(e) => setData('from_account_id', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">Select account...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} — {a.account_name}</option>)}
                            </select>
                            {errors.from_account_id && <p className="text-xs text-destructive">{errors.from_account_id}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">To Account *</label>
                            <select value={data.to_account_id} onChange={(e) => setData('to_account_id', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">Select account...</option>
                                {accounts.filter(a => a.id !== parseInt(data.from_account_id)).map(a =>
                                    <option key={a.id} value={a.id}>{a.bank_name} — {a.account_name}</option>)}
                            </select>
                            {errors.to_account_id && <p className="text-xs text-destructive">{errors.to_account_id}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Amount *</label>
                                <Input type="number" step="0.01" min="0.01" placeholder="0.00"
                                    value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date *</label>
                                <Input type="date" value={data.transfer_date}
                                    onChange={(e) => setData('transfer_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Reference</label>
                            <Input placeholder="Transaction ref..." value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <Input placeholder="Notes..." value={data.description}
                                onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Transfer Funds</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
