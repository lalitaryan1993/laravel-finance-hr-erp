import { useState, useMemo } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, Trash2, ArrowLeft, Info, Globe, FileText, Receipt, Ship } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CURRENCIES } from '@/lib/currencies'

// ─── Invoice type definitions ────────────────────────────────────────────────
const INVOICE_TYPES = [
    {
        group: 'Domestic',
        types: [
            { value: 'tax_invoice',    label: 'Tax Invoice',      icon: Receipt, desc: 'Standard GST tax invoice for domestic sales', prefix: 'TINV', gst: true,  party: 'customer' },
            { value: 'sales',          label: 'Sales Invoice',    icon: FileText, desc: 'General sales invoice (non-GST or mixed)',    prefix: 'INV',  gst: true,  party: 'customer' },
            { value: 'proforma',       label: 'Proforma Invoice', icon: FileText, desc: 'Pre-invoice / quotation — no payment due',    prefix: 'PRO',  gst: true,  party: 'customer' },
            { value: 'bill_of_supply', label: 'Bill of Supply',   icon: FileText, desc: 'For exempt goods or composition dealers',     prefix: 'BOS',  gst: false, party: 'customer' },
            { value: 'purchase',       label: 'Purchase Bill',    icon: Receipt,  desc: 'Bill for goods/services received',            prefix: 'PINV', gst: true,  party: 'vendor'   },
            { value: 'credit_note',    label: 'Credit Note',      icon: FileText, desc: 'Reduce tax liability on a sales invoice',     prefix: 'CN',   gst: true,  party: 'customer' },
            { value: 'debit_note',     label: 'Debit Note',       icon: FileText, desc: 'Increase tax liability on a purchase bill',   prefix: 'DN',   gst: true,  party: 'vendor'   },
        ],
    },
    {
        group: 'Overseas / Export',
        types: [
            { value: 'export_invoice', label: 'Export Tax Invoice',  icon: Ship,    desc: 'Zero-rated GST invoice for overseas customers', prefix: 'EXPINV', gst: false, party: 'customer', overseas: true },
            { value: 'export_proforma',label: 'Export Proforma',     icon: Ship,    desc: 'Proforma for overseas / international customers', prefix: 'EXPPRO', gst: false, party: 'customer', overseas: true },
        ],
    },
]

const ALL_TYPES = INVOICE_TYPES.flatMap(g => g.types)

const emptyLine = () => ({
    item_name: '', description: '', hsn_sac_code: '', unit: '',
    quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0,
})

// ─── Mini customer card shown after selection ─────────────────────────────────
function CustomerCard({ party }) {
    if (!party) return null
    return (
        <div className="rounded-lg border border-border bg-muted/40 p-3 mt-2 text-sm space-y-1">
            <div className="flex items-center gap-2">
                {party.logo
                    ? <img src={`/storage/${party.logo}`} alt={party.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                    : <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {(party.name ?? '?').slice(0, 2).toUpperCase()}
                      </div>
                }
                <div>
                    <p className="font-semibold">{party.name}</p>
                    {party.company_name && party.company_name !== party.name && (
                        <p className="text-xs text-muted-foreground">{party.company_name}</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-xs text-muted-foreground">
                {party.email    && <span>✉ {party.email}</span>}
                {party.phone    && <span>☎ {party.phone}</span>}
                {party.gst_number && <span className="font-mono">GSTIN: {party.gst_number}</span>}
                {party.pan_number && <span className="font-mono">PAN: {party.pan_number}</span>}
                {(party.billing_city || party.billing_state || party.billing_country) && (
                    <span className="col-span-2">
                        {[party.billing_city, party.billing_state, party.billing_country].filter(Boolean).join(', ')}
                        {party.billing_pincode && ` - ${party.billing_pincode}`}
                    </span>
                )}
                {party.credit_days > 0 && <span>Net {party.credit_days} days</span>}
            </div>
        </div>
    )
}

export default function InvoiceCreate({ type: initType = 'tax_invoice', customers = [], vendors = [], taxRates = [], nextNumber = '' }) {
    const [selectedTypeDef, setSelectedTypeDef] = useState(() => ALL_TYPES.find(t => t.value === initType) ?? ALL_TYPES[0])
    const isVendorParty = selectedTypeDef.party === 'vendor'
    const parties = isVendorParty ? vendors : customers

    const { data, setData, post, processing, errors } = useForm({
        type:             selectedTypeDef.value,
        party_type:       selectedTypeDef.party,
        party_id:         '',
        invoice_date:     new Date().toISOString().slice(0, 10),
        due_date:         '',
        currency:         selectedTypeDef.overseas ? 'USD' : 'INR',
        place_of_supply:  '',
        exchange_rate:    1,
        port_of_loading:  '',
        port_of_discharge:'',
        country_of_origin:'India',
        lut_bond_number:  '',
        shipping_bill_no: '',
        terms_conditions: '',
        customer_notes:   '',
        items:            [emptyLine()],
    })

    // When invoice type changes, update related fields
    function changeType(typeDef) {
        setSelectedTypeDef(typeDef)
        setData(prev => ({
            ...prev,
            type:       typeDef.value,
            party_type: typeDef.party,
            party_id:   '',
            currency:   typeDef.overseas ? 'USD' : 'INR',
            items: prev.items.map(item => ({
                ...item,
                tax_rate: typeDef.gst ? item.tax_rate : 0,
            })),
        }))
    }

    const selectedParty = useMemo(() =>
        parties.find(p => String(p.id) === String(data.party_id)) ?? null,
    [parties, data.party_id])

    const setItem = (idx, field, value) => {
        const items = [...data.items]
        items[idx] = { ...items[idx], [field]: value }
        setData('items', items)
    }
    const addLine    = () => setData('items', [...data.items, emptyLine()])
    const removeLine = (idx) => setData('items', data.items.filter((_, i) => i !== idx))

    const calcLine = (item) => {
        const base    = (item.quantity || 0) * (item.unit_price || 0)
        const disc    = base * ((item.discount_percent || 0) / 100)
        const taxable = base - disc
        const tax     = selectedTypeDef.gst ? taxable * ((item.tax_rate || 0) / 100) : 0
        return { taxable, tax, total: taxable + tax }
    }

    const subtotal   = data.items.reduce((s, it) => s + calcLine(it).taxable, 0)
    const taxTotal   = data.items.reduce((s, it) => s + calcLine(it).tax, 0)
    const grandTotal = subtotal + taxTotal

    const submit = (e) => {
        e.preventDefault()
        post('/invoices')
    }

    return (
        <AppLayout>
            <Head title="New Invoice" />
            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{selectedTypeDef.label}</h1>
                        <p className="text-muted-foreground text-sm font-mono">{nextNumber}</p>
                    </div>
                    {selectedTypeDef.overseas && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
                            <Globe className="w-3.5 h-3.5" /> Overseas / Export
                        </span>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* ── Invoice Type Selector ── */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">Invoice Type</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {INVOICE_TYPES.map(group => (
                                <div key={group.group}>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{group.group}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {group.types.map(t => {
                                            const Icon = t.icon
                                            const active = selectedTypeDef.value === t.value
                                            return (
                                                <button key={t.value} type="button"
                                                    onClick={() => changeType(t)}
                                                    className={cn(
                                                        'flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all',
                                                        active
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                                                    )}>
                                                    <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
                                                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={cn('text-sm font-semibold', active && 'text-primary')}>{t.label}</p>
                                                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{t.desc}</p>
                                                        {!t.gst && (
                                                            <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-1.5 py-0.5 rounded font-medium">No GST</span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* ── Party + Details ── */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-base">
                                {isVendorParty ? 'Vendor / Supplier Details' : 'Customer Details'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            {/* Party select */}
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">
                                    {isVendorParty ? 'Vendor' : 'Customer'} *
                                </label>
                                <select value={data.party_id} onChange={e => setData('party_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select {isVendorParty ? 'vendor' : 'customer'}…</option>
                                    {parties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}{p.gst_number ? ` — ${p.gst_number}` : ''}</option>
                                    ))}
                                </select>
                                {errors.party_id && <p className="text-xs text-destructive">{errors.party_id}</p>}
                                {/* Customer info card */}
                                <CustomerCard party={selectedParty} />
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

                            {/* Exchange rate for overseas */}
                            {selectedTypeDef.overseas && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Exchange Rate (to INR)</label>
                                    <Input type="number" step="0.0001" min="0.0001"
                                        value={data.exchange_rate}
                                        onChange={e => setData('exchange_rate', e.target.value)}
                                        placeholder="e.g. 83.50" />
                                </div>
                            )}

                            {/* Invoice Date */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Invoice Date *</label>
                                <DatePicker value={data.invoice_date} onChange={v => setData('invoice_date', v)} />
                            </div>

                            {/* Due Date — not for proforma/export proforma */}
                            {!['proforma','export_proforma','bill_of_supply'].includes(selectedTypeDef.value) && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <DatePicker value={data.due_date} onChange={v => setData('due_date', v)} placeholder="Select due date" />
                                </div>
                            )}

                            {/* Place of Supply — domestic only */}
                            {!selectedTypeDef.overseas && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Place of Supply</label>
                                    <Input placeholder="e.g. Maharashtra, Karnataka…"
                                        value={data.place_of_supply} onChange={e => setData('place_of_supply', e.target.value)} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Overseas / Export Fields ── */}
                    {selectedTypeDef.overseas && (
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
                                    <Input value={data.country_of_origin} onChange={e => setData('country_of_origin', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">LUT / Bond Number</label>
                                    <Input placeholder="Letter of Undertaking ref." className="font-mono"
                                        value={data.lut_bond_number} onChange={e => setData('lut_bond_number', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Port of Loading</label>
                                    <Input placeholder="e.g. Nhava Sheva, Mumbai"
                                        value={data.port_of_loading} onChange={e => setData('port_of_loading', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Port of Discharge</label>
                                    <Input placeholder="e.g. Jebel Ali, Dubai"
                                        value={data.port_of_discharge} onChange={e => setData('port_of_discharge', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Shipping Bill Number</label>
                                    <Input className="font-mono"
                                        value={data.shipping_bill_no} onChange={e => setData('shipping_bill_no', e.target.value)} />
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
                                            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">Item / Service</th>
                                            <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">HSN/SAC</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-16">Qty</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-24">Unit Price</th>
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-16">Disc%</th>
                                            {selectedTypeDef.gst && (
                                                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs w-28">Tax Rate</th>
                                            )}
                                            <th className="text-right px-3 py-2.5 font-medium text-muted-foreground text-xs w-24">Total</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, idx) => {
                                            const { total } = calcLine(item)
                                            return (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="Item name" value={item.item_name}
                                                            onChange={e => setItem(idx, 'item_name', e.target.value)}
                                                            className="h-8 text-sm min-w-[160px]" />
                                                        <Input placeholder="Description (optional)" value={item.description ?? ''}
                                                            onChange={e => setItem(idx, 'description', e.target.value)}
                                                            className="h-7 text-xs mt-1 text-muted-foreground border-dashed" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="HSN/SAC" value={item.hsn_sac_code}
                                                            onChange={e => setItem(idx, 'hsn_sac_code', e.target.value)}
                                                            className="h-8 text-xs font-mono w-24" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0.001" step="0.001" value={item.quantity}
                                                            onChange={e => setItem(idx, 'quantity', e.target.value)}
                                                            className="h-8 text-sm text-right w-16" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" value={item.unit_price}
                                                            onChange={e => setItem(idx, 'unit_price', e.target.value)}
                                                            className="h-8 text-sm text-right w-24" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" max="100" step="0.01" value={item.discount_percent}
                                                            onChange={e => setItem(idx, 'discount_percent', e.target.value)}
                                                            className="h-8 text-sm text-right w-16" />
                                                    </td>
                                                    {selectedTypeDef.gst && (
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
                                                    <td className="px-3 py-2 text-right font-mono text-sm font-medium">
                                                        {formatCurrency(total, data.currency)}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {data.items.length > 1 && (
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                                                                onClick={() => removeLine(idx)}>
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
                                    {selectedTypeDef.gst && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">GST</span>
                                            <span className="font-mono">{formatCurrency(taxTotal, data.currency)}</span>
                                        </div>
                                    )}
                                    {!selectedTypeDef.gst && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-yellow-600 dark:text-yellow-400">No tax applied (Zero-rated / Exempt)</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t pt-1.5 mt-1">
                                        <span>Grand Total</span>
                                        <span className="font-mono text-primary">{formatCurrency(grandTotal, data.currency)}</span>
                                    </div>
                                    {selectedTypeDef.overseas && data.exchange_rate > 0 && (
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
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Notes &amp; Terms</CardTitle></CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Customer Notes</label>
                                <textarea rows={3} placeholder="Thank you for your business…"
                                    value={data.customer_notes} onChange={e => setData('customer_notes', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Terms &amp; Conditions</label>
                                <textarea rows={3} placeholder="Payment terms, delivery terms…"
                                    value={data.terms_conditions} onChange={e => setData('terms_conditions', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <FileText className="w-4 h-4" />
                            {processing ? 'Creating…' : `Create ${selectedTypeDef.label}`}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
