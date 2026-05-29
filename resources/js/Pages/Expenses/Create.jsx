import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ArrowLeft } from 'lucide-react'

export default function ExpenseCreate({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        expense_date: new Date().toISOString().slice(0, 10),
        total_amount: '',
        currency: 'INR',
        description: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/expenses')
    }

    return (
        <AppLayout>
            <Head title="New Expense" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/expenses')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">New Expense</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Submit a business expense</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Title *</label>
                                <Input placeholder="e.g. Hotel stay - Mumbai trip"
                                    value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Category</label>
                                    <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">Select category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Date *</label>
                                    <DatePicker value={data.expense_date} onChange={(v) => setData('expense_date', v)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Amount *</label>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                                        value={data.total_amount} onChange={(e) => setData('total_amount', e.target.value)} />
                                    {errors.total_amount && <p className="text-xs text-destructive">{errors.total_amount}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Currency</label>
                                    <select value={data.currency} onChange={(e) => setData('currency', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(v) => setData('description', v)}
                                    placeholder="Additional notes, justification..."
                                    minHeight={120}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit('/expenses')}>Cancel</Button>
                        <Button type="submit" loading={processing}>Add Expense</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
