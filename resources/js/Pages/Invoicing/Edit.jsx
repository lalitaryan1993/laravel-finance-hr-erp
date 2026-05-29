import { useMemo } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Plus, Trash2, ArrowLeft, Save, AlertTriangle, FileText, Ship, Globe, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CURRENCIES } from '@/lib/currencies'

const TYPE_LABEL = {
    sales:          'Sales Invoice',
    tax_invoice:    'Tax Invoice',
    proforma:       'Proforma Invoice',
    export_invoice: 'Export Invoice',
    export_proforma:'Export Proforma',
    bill_of_supply: 'Bill of Supply',
    credit_note:    'Credit Note',
    debit_note:     'Debit Note',
    purchase:       'Purchase Bill',
}

const emptyLine = () => ({
    item_name: '', description: '', hsn_sac_code: '', unit: '',
    quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0,
})

const GST_TYPES     = ['sales','tax_invoice','credit_note','debit_note','purchase']
const OVERSEAS_TYPES = ['export_invoice','export_proforma']

export default function InvoiceEdit({ invoice, customers = [], vendors = [], taxRates = [] }) {
    const isVendor  = invoice.party_type === 'vendor'
    const parties   = isVendor ? vendors : customers
    const showGst   = GST_TYPES.includes(invoice.type)
    const isOverseas = OVERSEAS_TYPES.includes(invoice.type)
    const typeLabel = TYPE_LABEL[invoice.type] ?? 'Invoice'

    const { data, setData, post, processing, errors } = useForm({
        _method:           'PUT',
        party_id:          String(invoice.party_id ?? ''),
        invoice_date:      invoice.invoice_date ? String(invoice.invoice_date).slice(0, 10) : '',
        due_date:          invoice.due_date     ? String(invoice.due_date).slice(0, 10)     : '',
        currency:          invoice.currency ?? 'INR',
        exchange_rate:     invoice.exchange_rate ?? 1,
        place_of_supply:   invoice.place_of_supply ?? '',
        port_of_loading:   invoice.port_of_loading ?? '',
        port_of_discharge: invoice.port_of_discharge ?? '',
        country_of_origin: invoice.country_of_origin ?? 'India',
        lut_bond_number:   invoice.lut_bond_number ?? '',
        shipping_bill_no:  invoice.shipping_bill_no ?? '',
        customer_notes:    invoice.customer_notes ?? '',
        terms_conditions:  invoice.terms_conditions ?? '',
        items: invoice.items?.length
            ? invoice.items.map(i => ({
                item_name:        i.item_name ?? '',
                description:      i.description ?? '',
                hsn_sac_code:     i.hsn_sac_code ?? '',
                unit:             i.unit ?? '',
                quantity:         i.quantity ?? 1,
                unit_price:       i.unit_price ?? 0,
                discount_percent: i.discount_percent ?? 0,
                tax_rate:         i.tax_rate ?? 0,
            }))
            : [emptyLine()],
    })

    const setItem    = (idx, field, val) => {
        const items = [...data.items]
        items[idx]  = { ...items[idx], [field]: val }
        setData('items', items)
    }
    const addLine    = () => setData('items', [...data.items, emptyLine()])
    const removeLine = (idx) => setData('items', data.items.filter((_, i) => i !== idx))

    const calcLine = (item) => {
        const base    = (item.quantity || 0) * (item.unit_price || 0)
        const disc    = base * ((item.discount_percent || 0) / 100)
        const taxable = base - disc
        const tax     = showGst ? taxable * ((item.tax_rate || 0) / 100) : 0
        return { taxable, tax, total: taxable + tax }
    }

    const subtotal   = data.items.reduce((s, it) => s + calcLine(it).taxable, 0)
    const taxTotal   = data.items.reduce((s, it) => s + calcLine(it).tax, 0)
    const grandTotal = subtotal + taxTotal

    const selectedParty = useMemo(
        () => parties.find(p => String(p.id) === String(data.party_id)) ?? null,
        [parties, data.party_id]
    )

    function submit(e) {
        e.preventDefault()
        // POST with _method:PUT because useForm.put() sends PUT natively but
        // some servers need the method override for file-less forms — both work.
        post(`/invoices/${invoice.id}`)
    }

    if (invoice.status === 'paid') {
        return (
            <AppLayout>
                <Head title="Edit Invoice" />
                <div className="max-w-lg mx-auto mt-12 text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                    <h2 className="text-xl font-bold">Cannot Edit Paid Invoice</h2>
                    <p className="text-muted-foreground">This invoice is fully paid and cannot be modified.</p>
                    <Button onClick={() => router.visit(`/invoices/${invoice.id}`)}>
                        View Invoice
                    </Button>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <Head title={`Edit — ${invoice.invoice_number}`} />
            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/invoices/${invoice.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">Edit {typeLabel}</h1>
                            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                                <FileText className="w-3 h-3" />{invoice.invoice_number}
                            </span>
                            {isOverseas && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
                                    <Globe className="w-3.5 h-3.5" /> Overseas / Export
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Changes will recalculate all totals
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">

                    {/* ── Details ── */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">{isVendor ? 'Vendor' : 'Customer'} &amp; Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">

                            {/* Party select + mini card */}
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">{isVendor ? 'Vendor' : 'Customer'} *</label>
                                <select value={data.party_id}
                                    onChange={e => setData('party_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select…</option>
                                    {parties.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}{p.gst_number ? ` — ${p.gst_number}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.party_id && <p className="text-xs text-destructive">{errors.party_id}</p>}

                                {selectedParty && (
                                    <div className="rounded-lg bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        {selectedParty.email && <span>✉ {selectedParty.email}</span>}
                                        {selectedParty.phone && <span>☎ {selectedParty.phone}</span>}
                                        {selectedParty.gst_number && <span className="font-mono">GSTIN: {selectedParty.gst_number}</span>}
                                        {selectedParty.billing_city && <span>📍 {[selectedParty.billing_city, selectedParty.billing_state].filter(Boolean).join(', ')}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Currency</label>
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Exchange rate — overseas only */}
                            {isOverseas && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Exchange Rate (to INR)</label>
                                    <Input type="number" step="0.0001" min="0.0001"
                                        value={data.exchange_rate}
                                        onChange={e => setData('exchange_rate', e.target.value)}
                                        placeholder="e.g. 83.50" />
                                </div>
                            )}

                            {/* Place of supply */}
                            {showGst && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Place of Supply</label>
                                    <Input placeholder="e.g. Maharashtra"
                                        value={data.place_of_supply}
                                        onChange={e => setData('place_of_supply', e.target.value)} />
                                </div>
                            )}

                            {/* Invoice Date */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Invoice Date *</label>
                                <DatePicker value={data.invoice_date} onChange={v => setData('invoice_date', v)} />
                                {errors.invoice_date && <p className="text-xs text-destructive">{errors.invoice_date}</p>}
                            </div>

                            {/* Due Date */}
                            {!['proforma','export_proforma','bill_of_supply'].includes(invoice.type) && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <DatePicker value={data.due_date} onChange={v => setData('due_date', v)} placeholder="Select due date" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Overseas / Export Fields ── */}
                    {isOverseas && (
                        <Card className="border-blue-200 dark:border-blue-800">
                            <CardHeader className="border-b pb-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-t-lg">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Ship className="w-4 h-4 text-blue-600" />
                                    Export / Shipping Details
                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">Overseas</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Country of Origin</label>
                                    <Input value={data.country_of_origin}
                                        onChange={e => setData('country_of_origin', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">LUT / Bond Number</label>
                                    <Input placeholder="Letter of Undertaking ref." className="font-mono"
                                        value={data.lut_bond_number}
                                        onChange={e => setData('lut_bond_number', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Port of Loading</label>
                                    <Input placeholder="e.g. Nhava Sheva, Mumbai"
                                        value={data.port_of_loading}
                                        onChange={e => setData('port_of_loading', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Port of Discharge</label>
                                    <Input placeholder="e.g. Jebel Ali, Dubai"
                                        value={data.port_of_discharge}
                                        onChange={e => setData('port_of_discharge', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Shipping Bill Number</label>
                                    <Input className="font-mono"
                                        value={data.shipping_bill_no}
                                        onChange={e => setData('shipping_bill_no', e.target.value)} />
                                </div>
                                <div className="col-span-2 flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-300">
                                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    Export invoices are zero-rated under GST. Ensure your LUT/Bond is valid before raising an export invoice without payment of IGST.
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Line Items ── */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Line Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5">
                                    <Plus className="w-4 h-4" /> Add Line
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/30 border-b">
                                            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Item / Description</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-24">HSN/SAC</th>
                                            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-16">Qty</th>
                                            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-24">Unit Price</th>
                                            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-16">Disc%</th>
                                            {showGst && (
                                                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-28">Tax</th>
                                            )}
                                            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-24">Total</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, idx) => {
                                            const { total } = calcLine(item)
                                            return (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/10">
                                                    <td className="px-3 py-2 min-w-[200px]">
                                                        <Input placeholder="Item name *"
                                                            value={item.item_name}
                                                            onChange={e => setItem(idx, 'item_name', e.target.value)}
                                                            className="h-8 text-sm" />
                                                        <Input placeholder="Description (optional)"
                                                            value={item.description}
                                                            onChange={e => setItem(idx, 'description', e.target.value)}
                                                            className="h-7 text-xs mt-1 border-dashed text-muted-foreground" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="HSN/SAC"
                                                            value={item.hsn_sac_code}
                                                            onChange={e => setItem(idx, 'hsn_sac_code', e.target.value)}
                                                            className="h-8 text-xs font-mono w-24" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0.001" step="0.001"
                                                            value={item.quantity}
                                                            onChange={e => setItem(idx, 'quantity', e.target.value)}
                                                            className="h-8 text-sm text-right w-16" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01"
                                                            value={item.unit_price}
                                                            onChange={e => setItem(idx, 'unit_price', e.target.value)}
                                                            className="h-8 text-sm text-right w-24" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" max="100" step="0.01"
                                                            value={item.discount_percent}
                                                            onChange={e => setItem(idx, 'discount_percent', e.target.value)}
                                                            className="h-8 text-sm text-right w-16" />
                                                    </td>
                                                    {showGst && (
                                                        <td className="px-3 py-2">
                                                            <select value={item.tax_rate}
                                                                onChange={e => setItem(idx, 'tax_rate', e.target.value)}
                                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                                                                <option value="0">0%</option>
                                                                {taxRates.map(t => (
                                                                    <option key={t.id} value={t.rate}>{t.name} ({t.rate}%)</option>
                                                                ))}
                                                                <option value="5">5%</option>
                                                                <option value="12">12%</option>
                                                                <option value="18">18%</option>
                                                                <option value="28">28%</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-2 text-right font-mono font-semibold">
                                                        {formatCurrency(total, data.currency)}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {data.items.length > 1 && (
                                                            <Button type="button" variant="ghost" size="icon"
                                                                className="h-7 w-7" onClick={() => removeLine(idx)}>
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
                                    {showGst && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">GST</span>
                                            <span className="font-mono">{formatCurrency(taxTotal, data.currency)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t pt-1.5">
                                        <span>Grand Total</span>
                                        <span className="font-mono text-primary">{formatCurrency(grandTotal, data.currency)}</span>
                                    </div>
                                    {isOverseas && parseFloat(data.exchange_rate) > 0 && (
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>INR Equivalent (@ {data.exchange_rate})</span>
                                            <span className="font-mono">{formatCurrency(grandTotal * parseFloat(data.exchange_rate || 1), 'INR')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Notes & Terms ── */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">Notes &amp; Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Customer Notes</label>
                                <textarea rows={3} placeholder="Thank you for your business…"
                                    value={data.customer_notes}
                                    onChange={e => setData('customer_notes', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Terms &amp; Conditions</label>
                                <textarea rows={3} placeholder="Payment terms, delivery terms…"
                                    value={data.terms_conditions}
                                    onChange={e => setData('terms_conditions', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline"
                            onClick={() => router.visit(`/invoices/${invoice.id}`)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
