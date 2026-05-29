import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export default function BudgetShow({ budget }) {
    const lines = budget.lines ?? []
    const pct = budget.total_amount > 0
        ? Math.min(100, (parseFloat(budget.spent_amount || 0) / parseFloat(budget.total_amount)) * 100)
        : 0
    const overBudget = pct >= 100

    const handleApprove = () => router.post(`/budget/${budget.id}/approve`)

    return (
        <AppLayout>
            <Head title={budget.name} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/budget')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{budget.name}</h1>
                        <p className="text-muted-foreground text-sm">{budget.fiscal_year?.name}</p>
                    </div>
                    <Badge variant={budget.status === 'approved' ? 'success' : 'secondary'} className="capitalize">
                        {budget.status}
                    </Badge>
                    {budget.status !== 'approved' && (
                        <Button onClick={handleApprove}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Budget
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Budget</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(budget.total_amount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Actual Spent</div>
                            <div className={cn('text-2xl font-bold font-mono mt-1', overBudget ? 'text-red-500' : 'text-green-600')}>
                                {formatCurrency(budget.spent_amount)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Variance</div>
                            <div className={cn('text-2xl font-bold font-mono mt-1', overBudget ? 'text-red-500' : 'text-green-600')}>
                                {overBudget ? '-' : '+'}{formatCurrency(Math.abs(parseFloat(budget.total_amount) - parseFloat(budget.spent_amount)))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Budget utilization</span>
                            <span className={cn('font-medium', overBudget ? 'text-red-500' : '')}>{pct.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(pct, 100)}
                            className={overBudget ? '[&>[data-indicator]]:bg-red-500' : ''} />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{formatDate(budget.start_date)}</span>
                            <span>{formatDate(budget.end_date)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Budget Lines</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Budgeted</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No budget lines added
                                        </TableCell>
                                    </TableRow>
                                ) : lines.map((line) => {
                                    const variance = parseFloat(line.amount || 0) - parseFloat(line.actual_amount || 0)
                                    return (
                                        <TableRow key={line.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{line.account?.name ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground capitalize">{line.period_type}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(line.amount)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(line.actual_amount)}</TableCell>
                                            <TableCell className={cn('text-right font-mono font-medium', variance < 0 ? 'text-red-500' : 'text-green-600')}>
                                                {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
