import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariants = {
    draft: 'secondary', pending: 'warning', approved: 'success', rejected: 'destructive', paid: 'success',
}

export default function ExpenseClaims({ claims = {}, filters = {} }) {
    const list = claims.data ?? []

    return (
        <AppLayout>
            <Head title="My Expense Claims" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Claims</h1>
                        <p className="text-muted-foreground text-sm mt-1">Track your submitted expense claims</p>
                    </div>
                    <Button onClick={() => router.visit('/expenses/create')}>
                        <Plus className="w-4 h-4 mr-2" /> New Claim
                    </Button>
                </div>

                <Card>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No claims submitted yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((exp) => (
                                    <TableRow key={exp.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/expenses/${exp.id}`)}>
                                        <TableCell className="font-mono text-sm">{exp.expense_number}</TableCell>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{exp.category?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(exp.expense_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(exp.total_amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[exp.status] ?? 'secondary'}>{exp.status}</Badge>
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
