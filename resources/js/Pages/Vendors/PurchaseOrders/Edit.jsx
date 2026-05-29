import { useMemo } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/currencies'

const STATUSES = ['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled']
const emptyItem = () => ({ item_name: '', description: '', unit: '', quantity: 1, unit_price: 0, tax_rate: 0 })

function VendorCard({ vendor }) {
    if (!vendor) return null
    return (
        <div className="rounded-lg border border-border bg-muted/40 p-3 mt-2 text-sm">
            <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {(vendor.name ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <p className="font-semibold">{vendor.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {vendor.email         && <span>✉ {vendor.email}</span>}
                {vendor.gst_number    && <span className="font-mono">GSTIN: {vendor.gst_number}</span>}
                {vendor.payment_terms && <span>Terms: {vendor.payment_terms}</span>}
                {vendor.currency      && <span>Default currency: {vendor.currency}</span>}
            </div>
        </div>
    )
}

export default function EditPurchaseOrder({ order, vendors = [] }) {
    const existingItems = (order.items ?? []).map(item => ({
        item_name:   item.item_name   ?? '',
        description: item.description ?? '',
        unit:        item.unit        ?? '',
        quantity:    parseFloat(item.quantity)   || 1,
        unit_price:  parseFloat(item.unit_price) || 0,
        tax_rate:    parseFloat(item.tax_rate)   || 0,
    }))

    const { data, setData, put, processing, errors } = useForm({
        vendor_id:              order.vendor_id              ?? '',
        order_date:             order.order_date             ?? '',
        expected_delivery_date: order.expected_delivery_date ?? '',
        status:                 order.status                 ?? 'draft',
        payment_terms:          order.payment_terms          ?? '',
        currency:               order.currency               ?? 'INR',
        delivery_address:       order.delivery_address       ?? '',
        notes:                  order.notes                  ?? '',
        terms_conditions:       order.terms_conditions       ?? '',
        items:                  existingItems.length > 0 ? existingItems : [emptyItem()],
    })

    const selectedVendor = useMemo(
        () => vendors.find(v => String(v.id) === String(data.vendor_id)) ?? null,
        [vendors, data.vendor_id]
    )

    const onVendorChange = (vendorId) => {
        const vendor = vendors.find(v => String(v.id) === String(vendorId))
        setData(prev => ({
            ...prev,
            vendor_id:     vendorId,
            currency:      vendor?.currency      || prev.currency,
            payment_terms: vendor?.payment_terms || prev.payment_terms,
        }))
    }

    const setItem    = (idx, field, value) => {
        const items = [...data.items]
        items[idx]  = { ...items[idx], [field]: value }
        setData('items', items)
    }
    const addItem    = () => setData('items', [...data.items, emptyItem()])
    const removeItem = (idx) => setData('items', data.items.filter((_, i) => i !== idx))

    const calcLine = (item) => {
        const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
        const tax  = line * ((parseFloat(item.tax_rate) || 0) / 100)
        return { line, tax, total: line + tax }
    }

    const subtotal   = data.items.reduce((s, it) => s + calcLine(it).line,  0)
    const taxTotal   = data.items.reduce((s, it) => s + calcLine(it).tax,   0)
    const grandTotal = subtotal + taxTotal

    const submit = (e) => {
        e.preventDefault()
        put(`/vendors/purchase-orders/${order.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit ${order.po_number}`} />
            <div className="space-y-6 max-w-5xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"
                        onClick={() => router.visit(`/vendors/purchase-orders/${order.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit {order.po_number}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Update order details, items and status</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* Vendor & Order Details */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">Vendor &amp; Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">

                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Vendor *</label>
                                <select value={data.vendor_id} onChange={e => onVendorChange(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="">Select vendor…</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                                {errors.vendor_id && <p className="text-xs text-destructive">{errors.vendor_id}</p>}
                                <VendorCard vendor={selectedVendor} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Order Date *</label>
                                <Input type="date" value={data.order_date}
                                    onChange={e => setData('order_date', e.target.value)} />
                                {errors.order_date && <p className="text-xs text-destructive">{errors.order_date}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Expected Delivery</label>
                                <Input type="date" value={data.expected_delivery_date}
                                    onChange={e => setData('expected_delivery_date', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Status</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Currency *</label>
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                                    ))}
                                </select>
                                {errors.currency && <p className="text-xs text-destructive">{errors.currency}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Payment Terms</label>
                                <Input placeholder="e.g. Net 30" value={data.payment_terms}
                                    onChange={e => setData('payment_terms', e.target.value)} />
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Delivery Address</label>
                                <textarea value={data.delivery_address}
                                    onChange={e => setData('delivery_address', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Line Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
                                    <Plus className="w-4 h-4" /> Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/30 border-b">
                                            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">Item / Description</th>
                                            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs w-20">Unit</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-20">Qty</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-28">Unit Price</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-20">Tax %</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-28">Total</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, idx) => {
                                            const { total } = calcLine(item)
                                            return (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="Item name *" value={item.item_name}
                                                            onChange={e => setItem(idx, 'item_name', e.target.value)}
                                                            className="h-8 text-sm min-w-[160px]" />
                                                        {errors[`items.${idx}.item_name`] && (
                                                            <p className="text-xs text-destructive mt-0.5">{errors[`items.${idx}.item_name`]}</p>
                                                        )}
                                                        <Input placeholder="Description (optional)" value={item.description}
                                                            onChange={e => setItem(idx, 'description', e.target.value)}
                                                            className="h-7 text-xs mt-1 text-muted-foreground border-dashed" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="pcs" value={item.unit}
                                                            onChange={e => setItem(idx, 'unit', e.target.value)}
                                                            className="h-8 text-xs w-16" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0.001" step="any" value={item.quantity}
                                                            onChange={e => setItem(idx, 'quantity', e.target.value)}
                                                            className="h-8 text-sm text-right w-20" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" value={item.unit_price}
                                                            onChange={e => setItem(idx, 'unit_price', e.target.value)}
                                                            className="h-8 text-sm text-right w-28" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" max="100" step="0.01" value={item.tax_rate}
                                                            onChange={e => setItem(idx, 'tax_rate', e.target.value)}
                                                            className="h-8 text-sm text-right w-20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono text-sm font-medium whitespace-nowrap">
                                                        {formatCurrency(total, data.currency)}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {data.items.length > 1 && (
                                                            <Button type="button" variant="ghost" size="icon"
                                                                className="h-7 w-7" onClick={() => removeItem(idx)}>
                                                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="p-4 border-t bg-muted/20">
                                <div className="ml-auto max-w-xs space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-mono">{formatCurrency(subtotal, data.currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span className="font-mono text-orange-600 dark:text-orange-400">{formatCurrency(taxTotal, data.currency)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base border-t pt-1.5 mt-1">
                                        <span>Total ({data.currency})</span>
                                        <span className="font-mono text-primary">{formatCurrency(grandTotal, data.currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes & Terms */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">Notes &amp; Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Terms &amp; Conditions</label>
                                <textarea value={data.terms_conditions}
                                    onChange={e => setData('terms_conditions', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline"
                            onClick={() => router.visit(`/vendors/purchase-orders/${order.id}`)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout>
    )
}
