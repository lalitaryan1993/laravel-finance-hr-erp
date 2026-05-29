import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ExpenseApprovals({ pending = {} }) {
    const list = pending.data ?? []

    return (
        <AppLayout>
            <Head title="Expense Approvals" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Expense Approvals</h1>
                        <p className="text-muted-foreground text-sm mt-1">Review and approve pending expense claims</p>
                    </div>
                    <Badge variant="warning">{pending.total ?? list.length} pending</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expense #</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Submitted By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-green-500" />
                                            No pending approvals
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((exp) => (
                                    <TableRow key={exp.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-sm">{exp.expense_number}</TableCell>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{exp.submitted_by?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(exp.expense_date)}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(exp.total_amount)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-300"
                                                    onClick={() => router.post(`/expenses/${exp.id}/approve`)}>
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-300"
                                                    onClick={() => router.post(`/expenses/${exp.id}/reject`, { reason: 'Rejected' })}>
                                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs"
                                                    onClick={() => router.visit(`/expenses/${exp.id}`)}>
                                                    View
                                                </Button>
                                            </div>
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
