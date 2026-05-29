import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AssetShow({ asset }) {
    const depreciations = asset.depreciations ?? []
    const maintenances  = asset.maintenances ?? []

    const statusVariant = { active: 'success', disposed: 'destructive', under_maintenance: 'warning' }
    const methodLabel = { straight_line: 'Straight Line', declining_balance: 'Declining Balance', units_of_production: 'Units of Production' }

    return (
        <AppLayout>
            <Head title={asset.name} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/assets')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{asset.name}</h1>
                            <span className="text-muted-foreground font-mono text-sm">{asset.asset_code}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{asset.category?.name ?? 'Uncategorized'} · {asset.location ?? '—'}</p>
                    </div>
                    <Badge variant={statusVariant[asset.status] ?? 'secondary'} className="capitalize">
                        {asset.status?.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Purchase Cost</div>
                            <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(asset.purchase_cost)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Current Book Value</div>
                            <div className="text-2xl font-bold font-mono mt-1 text-blue-500">{formatCurrency(asset.book_value)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="text-sm text-muted-foreground">Total Depreciated</div>
                            <div className="text-2xl font-bold font-mono mt-1 text-orange-500">
                                {formatCurrency(parseFloat(asset.purchase_cost || 0) - parseFloat(asset.book_value || 0))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Asset Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                ['Purchase Date', formatDate(asset.purchase_date)],
                                ['Useful Life', `${asset.useful_life_years} years`],
                                ['Salvage Value', formatCurrency(asset.salvage_value)],
                                ['Depreciation Method', methodLabel[asset.depreciation_method] ?? asset.depreciation_method],
                                ['Serial Number', asset.serial_number ?? '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Recent Depreciation</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Book Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {depreciations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No depreciation runs</TableCell>
                                        </TableRow>
                                    ) : depreciations.slice(0, 5).map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell>{formatDate(d.depreciation_date)}</TableCell>
                                            <TableCell className="text-right font-mono text-red-500">{formatCurrency(d.amount)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(d.book_value_after)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
