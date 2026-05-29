import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, Package, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusColors = { active: 'success', disposed: 'secondary', under_maintenance: 'warning', fully_depreciated: 'outline' }

export default function AssetsIndex({ assets = {}, categories = [], filters = {} }) {
    const [showCreate, setShowCreate] = useState(false)
    const [search, setSearch] = useState(filters.search ?? '')
    const list = assets.data ?? []

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', asset_code: '', category_id: '', purchase_date: '',
        purchase_cost: '', useful_life_years: 5, depreciation_method: 'straight_line',
        location: '', serial_number: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/assets', { onSuccess: () => { reset(); setShowCreate(false) } })
    }

    const totalValue = list.reduce((s, a) => s + parseFloat(a.book_value ?? 0), 0)
    const totalCost  = list.reduce((s, a) => s + parseFloat(a.purchase_cost ?? 0), 0)

    return (
        <AppLayout>
            <Head title="Fixed Assets" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Fixed Assets</h1>
                        <p className="text-muted-foreground text-sm mt-1">Track, depreciate and manage company assets</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Asset
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Assets</div>
                        <div className="text-2xl font-bold mt-1">{assets.total ?? 0}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Original Cost</div>
                        <div className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalCost)}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="text-2xl font-bold font-mono mt-1 text-blue-600">{formatCurrency(totalValue)}</div>
                    </CardContent></Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search assets..." value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.get('/assets', { search }, { preserveState: true })}
                                    className="pl-9" />
                            </div>
                            <select onChange={(e) => router.get('/assets', { ...filters, category_id: e.target.value })}
                                defaultValue={filters.category_id ?? ''}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]">
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Purchase Date</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                    <TableHead className="text-right">Current Value</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No assets recorded yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((asset) => (
                                    <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/assets/${asset.id}`)}>
                                        <TableCell>
                                            <div className="font-medium">{asset.name}</div>
                                            {asset.serial_number && <div className="text-xs text-muted-foreground">S/N: {asset.serial_number}</div>}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{asset.asset_code}</TableCell>
                                        <TableCell>{asset.category?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(asset.purchase_date)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(asset.purchase_cost)}</TableCell>
                                        <TableCell className="text-right font-mono text-blue-600">{formatCurrency(asset.book_value)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[asset.status] ?? 'secondary'}>{asset.status?.replace('_', ' ')}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Fixed Asset</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Asset Name *</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Dell Laptop" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Asset Code</label>
                                <Input value={data.asset_code} onChange={(e) => setData('asset_code', e.target.value)} placeholder="AST-001" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Category</label>
                                <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Purchase Date *</label>
                                <Input type="date" value={data.purchase_date} onChange={(e) => setData('purchase_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Purchase Cost (₹) *</label>
                                <Input type="number" step="0.01" min="0" value={data.purchase_cost}
                                    onChange={(e) => setData('purchase_cost', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Useful Life (years)</label>
                                <Input type="number" min="1" value={data.useful_life_years}
                                    onChange={(e) => setData('useful_life_years', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Depreciation Method</label>
                                <select value={data.depreciation_method} onChange={(e) => setData('depreciation_method', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="straight_line">Straight Line</option>
                                    <option value="declining_balance">Declining Balance</option>
                                    <option value="units_of_production">Units of Production</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Add Asset</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
