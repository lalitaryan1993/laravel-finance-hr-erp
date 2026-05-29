import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function BudgetIndex({ budgets = {}, fiscalYears = [], filters = {} }) {
    const [showCreate, setShowCreate] = useState(false)
    const list = budgets.data ?? []

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', fiscal_year_id: '', period_type: 'annual',
        start_date: '', end_date: '', description: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/budget', { onSuccess: () => { reset(); setShowCreate(false) } })
    }

    const totalBudgeted = list.reduce((s, b) => s + parseFloat(b.total_amount ?? 0), 0)
    const totalSpent = list.reduce((s, b) => s + parseFloat(b.spent_amount ?? 0), 0)

    return (
        <AppLayout>
            <Head title="Budgets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Budgets</h1>
                        <p className="text-muted-foreground text-sm mt-1">Plan and track financial budgets</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Budget
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Budgeted</div>
                        <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalBudgeted)}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Actual</div>
                        <div className={cn('text-2xl font-bold font-mono mt-1', totalSpent > totalBudgeted ? 'text-red-500' : 'text-green-600')}>
                            {formatCurrency(totalSpent)}
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Budget Variance</div>
                        <div className={cn('text-2xl font-bold font-mono mt-1', totalSpent > totalBudgeted ? 'text-red-500' : 'text-green-600')}>
                            {totalSpent > totalBudgeted ? '-' : '+'}{formatCurrency(Math.abs(totalBudgeted - totalSpent))}
                        </div>
                    </CardContent></Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.length === 0 ? (
                        <Card className="col-span-2">
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <div className="font-medium">No budgets created yet</div>
                                <div className="text-sm mt-1">Create a budget to track spending against targets</div>
                                <Button className="mt-4" onClick={() => setShowCreate(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Create First Budget
                                </Button>
                            </CardContent>
                        </Card>
                    ) : list.map((budget) => {
                        const pct = budget.total_amount > 0
                            ? Math.min(100, (parseFloat(budget.actual_amount ?? 0) / parseFloat(budget.total_amount)) * 100)
                            : 0
                        const overBudget = pct > 100

                        return (
                            <Card key={budget.id} className={cn('cursor-pointer hover:shadow-md transition-shadow',
                                overBudget ? 'border-red-300 dark:border-red-800' : '')}
                                onClick={() => router.visit(`/budget/${budget.id}`)}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">{budget.name}</CardTitle>
                                            <div className="text-xs text-muted-foreground mt-1">{budget.fiscal_year?.name}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {overBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            <Badge variant={budget.status === 'approved' ? 'success' : 'secondary'}>
                                                {budget.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Actual vs Budget</span>
                                            <span className={cn('font-medium', overBudget ? 'text-red-500' : '')}>
                                                {pct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={Math.min(pct, 100)}
                                            className={overBudget ? '[&>[data-indicator]]:bg-red-500' : ''} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Actual: {formatCurrency(budget.actual_amount)}</span>
                                            <span>Budget: {formatCurrency(budget.total_amount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Create New Budget</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Budget Name *</label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. FY 2024-25 Operating Budget" />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Fiscal Year</label>
                            <select value={data.fiscal_year_id} onChange={(e) => setData('fiscal_year_id', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                <option value="">Select fiscal year...</option>
                                {fiscalYears.map(fy => <option key={fy.id} value={fy.id}>{fy.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Start Date *</label>
                                <Input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">End Date *</label>
                                <Input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Period Type</label>
                            <select value={data.period_type} onChange={(e) => setData('period_type', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                <option value="annual">Annual</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="monthly">Monthly</option>
                                <option value="project">Project-based</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                                rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Create Budget</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
