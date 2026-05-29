import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function BudgetForecast({ budgets = [], forecasts = [] }) {
    return (
        <AppLayout>
            <Head title="Budget Forecast" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Budget Forecast</h1>
                        <p className="text-muted-foreground text-sm mt-1">AI-powered spending projections based on historical trends</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/budget')}>
                        ← Back to Budgets
                    </Button>
                </div>

                {forecasts.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center space-y-3">
                            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
                            <div className="text-lg font-medium">No forecast data available</div>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                Forecasts are generated after at least 3 months of budget actuals. Continue tracking actuals to enable forecasting.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader><CardTitle>Spending Projections</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Budget</TableHead>
                                        <TableHead className="text-right">Budgeted</TableHead>
                                        <TableHead className="text-right">Actual (to date)</TableHead>
                                        <TableHead className="text-right">Forecasted End</TableHead>
                                        <TableHead className="text-right">Variance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecasts.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="font-medium">{f.name}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(f.total_amount)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(f.actual_amount)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(f.forecasted)}</TableCell>
                                            <TableCell className={`text-right font-mono ${parseFloat(f.forecasted) > parseFloat(f.total_amount) ? 'text-red-500' : 'text-green-600'}`}>
                                                {formatCurrency(parseFloat(f.total_amount) - parseFloat(f.forecasted))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}
