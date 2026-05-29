import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'

export default function BudgetVariance({ budgets = [] }) {
    const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.total_amount || 0), 0)
    const totalSpent   = budgets.reduce((s, b) => s + parseFloat(b.spent_amount || 0), 0)
    const totalVariance = totalBudgeted - totalSpent

    return (
        <AppLayout>
            <Head title="Budget Variance" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Budget Variance Analysis</h1>
                        <p className="text-muted-foreground text-sm mt-1">Compare budgeted vs actual spending across all budgets</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/budget')}>
                        ← Back to Budgets
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Budgeted</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalBudgeted)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Actual</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalSpent)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Overall Variance</div>
                            <div className={cn('text-2xl font-bold font-mono mt-1', totalVariance < 0 ? 'text-red-500' : 'text-green-600')}>
                                {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Variance by Budget</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Budget Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Budgeted</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead className="w-40">Utilization</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No budget data available
                                        </TableCell>
                                    </TableRow>
                                ) : budgets.map((b) => {
                                    const budgeted = parseFloat(b.total_amount || 0)
                                    const actual   = parseFloat(b.spent_amount || 0)
                                    const variance = budgeted - actual
                                    const pct = budgeted > 0 ? Math.min(100, (actual / budgeted) * 100) : 0
                                    const over = pct >= 100

                                    return (
                                        <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/budget/${b.id}`)}>
                                            <TableCell className="font-medium">{b.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={b.status === 'approved' ? 'success' : 'secondary'} className="capitalize">
                                                    {b.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(budgeted)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(actual)}</TableCell>
                                            <TableCell className={cn('text-right font-mono font-medium', variance < 0 ? 'text-red-500' : 'text-green-600')}>
                                                {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={pct} className={cn('h-2', over ? '[&>[data-indicator]]:bg-red-500' : '')} />
                                                    <span className={cn('text-xs w-10 shrink-0', over ? 'text-red-500' : 'text-muted-foreground')}>
                                                        {pct.toFixed(0)}%
                                                    </span>
                                                </div>
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
