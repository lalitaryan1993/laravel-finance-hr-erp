import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_VARIANT = {
    draft:     'secondary',
    sent:      'outline',
    confirmed: 'success',
    partial:   'warning',
    received:  'success',
    cancelled: 'destructive',
}

export default function PurchaseOrdersIndex({ orders = {}, stats = {}, vendors = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const [from,   setFrom]   = useState(filters.from   ?? '')
    const [to,     setTo]     = useState(filters.to     ?? '')
    const list = orders.data ?? []

    const applyFilter = (extra) =>
        router.get('/vendors/purchase-orders', { ...filters, ...extra }, { preserveState: true })

    const applySearch = () => applyFilter({ search, from, to })

    return (
        <AppLayout>
            <Head title="Purchase Orders" />
            <div className="space-y-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Purchase Orders</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage orders placed with vendors</p>
                    </div>
                    <Button onClick={() => router.visit('/vendors/purchase-orders/create')}>
                        <Plus className="w-4 h-4 mr-2" /> New PO
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold mt-1 tabular-nums">{stats.total ?? 0}</p>
                    </CardContent></Card>

                    <Card><CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold mt-1 tabular-nums text-primary">
                            {formatCurrency(stats.totalValue ?? 0)}
                        </p>
                    </CardContent></Card>

                    <Card><CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Confirmed</p>
                        <p className="text-2xl font-bold mt-1 tabular-nums text-emerald-600 dark:text-emerald-400">
                            {stats.confirmed ?? 0}
                        </p>
                    </CardContent></Card>

                    <Card><CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Received</p>
                        <p className="text-2xl font-bold mt-1 tabular-nums">
                            {stats.received ?? 0}
                        </p>
                    </CardContent></Card>
                </div>

                {/* Filters + Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <Input placeholder="Search PO number or vendor…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applySearch()}
                                    className="pl-9" />
                            </div>

                            {/* Date from */}
                            <Input type="date" value={from}
                                onChange={e => setFrom(e.target.value)}
                                className="w-36"
                                title="From date" />

                            {/* Date to */}
                            <Input type="date" value={to}
                                onChange={e => setTo(e.target.value)}
                                className="w-36"
                                title="To date" />

                            {/* Vendor filter */}
                            <select defaultValue={filters.vendor_id ?? ''}
                                onChange={e => applyFilter({ vendor_id: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All Vendors</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>

                            {/* Status filter */}
                            <select defaultValue={filters.status ?? ''}
                                onChange={e => applyFilter({ status: e.target.value })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All Statuses</option>
                                {['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>

                            {/* Apply search button */}
                            <Button type="button" variant="outline" size="sm"
                                className="h-9 px-4" onClick={applySearch}>
                                Apply
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Expected Delivery</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium">No purchase orders found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or create a new PO</p>
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((po) => (
                                    <TableRow key={po.id} className="cursor-pointer hover:bg-muted/40"
                                        onClick={() => router.visit(`/vendors/purchase-orders/${po.id}`)}>
                                        <TableCell className="font-mono text-sm font-semibold">{po.po_number}</TableCell>
                                        <TableCell className="font-medium">{po.vendor?.name ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(po.order_date)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {po.expected_delivery_date ? formatDate(po.expected_delivery_date) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold">
                                            {formatCurrency(po.total_amount, po.currency ?? 'INR')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_VARIANT[po.status] ?? 'secondary'} className="capitalize">
                                                {po.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {orders.from}–{orders.to} of {orders.total} orders
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8"
                                disabled={!orders.prev_page_url}
                                onClick={() => orders.prev_page_url && router.visit(orders.prev_page_url)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 rounded border border-input bg-background text-xs font-medium">
                                {orders.current_page} / {orders.last_page}
                            </span>
                            <Button variant="outline" size="icon" className="h-8 w-8"
                                disabled={!orders.next_page_url}
                                onClick={() => orders.next_page_url && router.visit(orders.next_page_url)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    )
}
