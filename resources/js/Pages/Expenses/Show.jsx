import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, XCircle, Send } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariants = {
    draft: 'secondary', pending: 'warning', approved: 'success', rejected: 'destructive', paid: 'success',
}

export default function ExpenseShow({ expense }) {
    const { post, processing } = useForm({})

    const submit = (e) => {
        e.preventDefault()
        post(`/expenses/${expense.id}/submit`)
    }

    return (
        <AppLayout>
            <Head title={`Expense: ${expense.expense_number}`} />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/expenses')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{expense.title}</h1>
                        <p className="text-muted-foreground text-sm">{expense.expense_number}</p>
                    </div>
                    <Badge variant={statusVariants[expense.status] ?? 'secondary'} className="text-sm">
                        {expense.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold text-lg font-mono">{formatCurrency(expense.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium">{expense.category?.name ?? '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Date</span>
                                <span>{formatDate(expense.expense_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Submitted by</span>
                                <span>{expense.submitted_by_user?.name ?? '—'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5 space-y-3">
                            {expense.approved_by_user && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Approved by</span>
                                    <span className="font-medium text-green-600">{expense.approved_by_user.name}</span>
                                </div>
                            )}
                            {expense.rejection_reason && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Rejection reason: </span>
                                    <span className="text-red-600">{expense.rejection_reason}</span>
                                </div>
                            )}
                            {expense.receipt_path && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Receipt</span>
                                    <a href={`/storage/${expense.receipt_path}`} target="_blank"
                                        className="text-primary hover:underline">View receipt</a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {expense.description && (
                    <Card>
                        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle></CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm">{expense.description}</p>
                        </CardContent>
                    </Card>
                )}

                {expense.status === 'pending' && (
                    <div className="flex gap-3">
                        <Button variant="outline" loading={processing}
                            onClick={() => router.post(`/expenses/${expense.id}/approve`)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button variant="destructive" loading={processing}
                            onClick={() => router.post(`/expenses/${expense.id}/reject`)}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                    </div>
                )}

                {expense.status === 'draft' && (
                    <form onSubmit={submit}>
                        <Button type="submit" loading={processing}>
                            <Send className="w-4 h-4 mr-2" /> Submit for Approval
                        </Button>
                    </form>
                )}
            </div>
        </AppLayout>
    )
}
