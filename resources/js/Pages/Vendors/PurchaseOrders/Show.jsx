import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, Printer } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_VARIANT = {
    draft: 'secondary', sent: 'outline', confirmed: 'success',
    partial: 'warning', received: 'success', cancelled: 'destructive',
}

export default function PurchaseOrderShow({ order }) {
    const items = order.items ?? []
    const vendor = order.vendor ?? {}

    const currency = order.currency ?? 'INR'

    return (
        <AppLayout>
            <Head title={`PO ${order.po_number}`} />
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"
                        onClick={() => router.visit('/vendors/purchase-orders')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{order.po_number}</h1>
                            <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize">
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {vendor.name ?? '—'} · Ordered {formatDate(order.order_date)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            onClick={() => router.visit(`/vendors/purchase-orders/${order.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Subtotal</div>
                        <div className="text-2xl font-bold font-mono mt-1 tabular-nums">{formatCurrency(order.subtotal, currency)}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Tax</div>
                        <div className="text-2xl font-bold font-mono mt-1 tabular-nums text-orange-500">{formatCurrency(order.tax_amount, currency)}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total ({currency})</div>
                        <div className="text-2xl font-bold font-mono mt-1 tabular-nums text-primary">{formatCurrency(order.total_amount, currency)}</div>
                    </CardContent></Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Vendor & Order Info */}
                    <Card>
                        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                ['Vendor', vendor.name ?? '—'],
                                ['Order Date', formatDate(order.order_date)],
                                ['Expected Delivery', order.expected_delivery_date ? formatDate(order.expected_delivery_date) : '—'],
                                ['Currency', order.currency],
                                ['Payment Terms', order.payment_terms ?? '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Notes & Address */}
                    <Card>
                        <CardHeader><CardTitle>Additional Info</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {order.delivery_address && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Delivery Address</p>
                                    <p className="whitespace-pre-line">{order.delivery_address}</p>
                                </div>
                            )}
                            {order.notes && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Notes</p>
                                    <p className="text-muted-foreground/80">{order.notes}</p>
                                </div>
                            )}
                            {order.terms_conditions && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Terms & Conditions</p>
                                    <p className="text-muted-foreground/80">{order.terms_conditions}</p>
                                </div>
                            )}
                            {!order.delivery_address && !order.notes && !order.terms_conditions && (
                                <p className="text-muted-foreground italic">No additional information</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Line Items */}
                <Card>
                    <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[35%]">Item</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Tax %</TableHead>
                                    <TableHead className="text-right">Tax Amt</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No items
                                        </TableCell>
                                    </TableRow>
                                ) : items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.item_name}</div>
                                            {item.description && (
                                                <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{item.unit ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">{formatCurrency(item.unit_price, currency)}</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">{item.tax_rate ? `${item.tax_rate}%` : '—'}</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums text-orange-500">{formatCurrency(item.tax_amount, currency)}</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums font-semibold">{formatCurrency(item.total_amount, currency)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Totals footer */}
                        <div className="border-t p-4 space-y-1 text-sm">
                            <div className="flex justify-end gap-8">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono w-32 text-right tabular-nums">{formatCurrency(order.subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-end gap-8">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-mono w-32 text-right tabular-nums text-orange-500">{formatCurrency(order.tax_amount, currency)}</span>
                            </div>
                            <div className="flex justify-end gap-8 text-base font-bold border-t pt-1 mt-1">
                                <span>Total ({currency})</span>
                                <span className="font-mono w-32 text-right tabular-nums text-primary">{formatCurrency(order.total_amount, currency)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
