import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, Receipt, Upload } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusColors = {
    draft:    'secondary',
    pending:  'warning',
    approved: 'success',
    rejected: 'destructive',
    paid:     'success',
}

export default function ExpensesIndex({ expenses = {}, categories = [], filters = {} }) {
    const [showCreate, setShowCreate] = useState(false)
    const [search, setSearch] = useState(filters.search ?? '')
    const list = expenses.data ?? []

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        category_id: '',
        expense_date: new Date().toISOString().slice(0, 10),
        total_amount: '',
        currency: 'INR',
        description: '',
        receipt: null,
    })

    const submit = (e) => {
        e.preventDefault()
        post('/expenses', { forceFormData: true, onSuccess: () => { reset(); setShowCreate(false) } })
    }

    return (
        <AppLayout>
            <Head title="Expenses" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Expenses</h1>
                        <p className="text-muted-foreground text-sm mt-1">Track and manage business expenses</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search expenses..."
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.get('/expenses', { search }, { preserveState: true })}
                                    className="pl-9" />
                            </div>
                            <select onChange={(e) => router.get('/expenses', { ...filters, status: e.target.value })}
                                defaultValue={filters.status ?? ''}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expense #</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No expenses found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((exp) => (
                                    <TableRow key={exp.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/expenses/${exp.id}`)}>
                                        <TableCell className="font-mono text-sm">{exp.expense_number}</TableCell>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{exp.category?.name}</TableCell>
                                        <TableCell>{formatDate(exp.expense_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(exp.total_amount)}</TableCell>
                                        <TableCell><Badge variant={statusColors[exp.status] ?? 'secondary'}>{exp.status}</Badge></TableCell>
                                        <TableCell>{exp.receipt_path ? <Badge variant="outline">Attached</Badge> : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Title *</label>
                            <Input placeholder="e.g. Hotel stay - Mumbai trip" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Category</label>
                                <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date *</label>
                                <Input type="date" value={data.expense_date} onChange={(e) => setData('expense_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount *</label>
                            <Input type="number" step="0.01" min="0" placeholder="0.00"
                                value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} />
                            {errors.total_amount && <p className="text-xs text-destructive">{errors.total_amount}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                                rows={2} placeholder="Additional notes..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Add Expense</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
