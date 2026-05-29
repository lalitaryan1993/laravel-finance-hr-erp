import { useState } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    ArrowLeft, Send, Printer, CreditCard, Copy, Trash2,
    CheckCircle2, Edit, Building2, Mail, Phone, MapPin,
    Hash, AlertTriangle, Globe, Ship, FileText, Banknote,
    TrendingUp, Receipt, Info, ExternalLink, User, Calendar, Pencil
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CURRENCY_MAP } from '@/lib/currencies'

const STATUS_CFG = {
    draft:    { label: 'Draft',     dot: 'bg-gray-400',   cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    sent:     { label: 'Sent',      dot: 'bg-blue-400',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    partial:  { label: 'Partial',   dot: 'bg-yellow-400', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    paid:     { label: 'Paid',      dot: 'bg-green-500',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    overdue:  { label: 'Overdue',   dot: 'bg-red-500',    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    voided:   { label: 'Voided',    dot: 'bg-gray-300',   cls: 'bg-muted text-muted-foreground' },
    cancelled:{ label: 'Cancelled', dot: 'bg-gray-300',   cls: 'bg-muted text-muted-foreground' },
}

const TYPE_LABEL = {
    sales:          'Sales Invoice',
    tax_invoice:    'Tax Invoice',
    proforma:       'Proforma Invoice',
    export_invoice: 'Export Tax Invoice',
    export_proforma:'Export Proforma',
    bill_of_supply: 'Bill of Supply',
    credit_note:    'Credit Note',
    debit_note:     'Debit Note',
    purchase:       'Purchase Bill',
}

const OVERSEAS_TYPES = ['export_invoice', 'export_proforma']
const METHODS = ['bank_transfer','cash','cheque','upi','credit_card','neft','rtgs','imps']

function InfoRow({ label, value, mono = false, red = false, green = false, children }) {
    return (
        <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            {children ?? (
                <span className={cn('text-sm font-medium text-right', mono && 'font-mono', red && 'text-red-500', green && 'text-green-600')}>
                    {value ?? '—'}
                </span>
            )}
        </div>
    )
}

function PartyAvatar({ party, size = 'md' }) {
    const dim = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
    if (party?.logo) {
        return <img src={`/storage/${party.logo}`} alt={party.name} className={cn(dim, 'rounded-full object-cover border-2 border-border shrink-0')} />
    }
    return (
        <div className={cn(dim, 'rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0')}>
            {(party?.name ?? '?').slice(0, 2).toUpperCase()}
        </div>
    )
}

export default function InvoiceShow({ invoice }) {
    const [showPayment,      setShowPayment]      = useState(false)
    const [showDelete,       setShowDelete]        = useState(false)
    const [editPayment,      setEditPayment]       = useState(null)   // payment object being edited
    const [deletePayment,    setDeletePayment]     = useState(null)   // payment object to delete
    const [payProcessing,    setPayProcessing]     = useState(false)

    // New payment form
    const { data, setData, post, processing, reset, errors } = useForm({
        amount:         invoice.balance_due ?? 0,
        payment_date:   new Date().toISOString().slice(0, 10),
        payment_method: 'bank_transfer',
        reference:      '',
    })

    // Edit payment local state
    const [editData, setEditData] = useState({})

    const recordPayment = (e) => {
        e.preventDefault()
        post(`/invoices/${invoice.id}/payment`, {
            onSuccess: () => { reset(); setShowPayment(false) },
        })
    }

    function openEditPayment(p) {
        setEditData({
            amount:         p.amount,
            payment_date:   p.payment_date ? String(p.payment_date).slice(0, 10) : '',
            payment_method: p.payment_method ?? 'bank_transfer',
            reference:      p.reference_number ?? '',
        })
        setEditPayment(p)
    }

    function submitEditPayment(e) {
        e.preventDefault()
        setPayProcessing(true)
        router.put(`/invoices/${invoice.id}/payments/${editPayment.id}`, editData, {
            onSuccess: () => { setEditPayment(null); setPayProcessing(false) },
            onError:   () => setPayProcessing(false),
        })
    }

    function confirmDeletePayment(p) {
        setDeletePayment(p)
    }

    function doDeletePayment() {
        router.delete(`/invoices/${invoice.id}/payments/${deletePayment.id}`, {
            onSuccess: () => setDeletePayment(null),
        })
    }

    const grandTotal  = parseFloat(invoice.grand_total  || 0)
    const paidAmount  = parseFloat(invoice.paid_amount  || 0)
    const balanceDue  = parseFloat(invoice.balance_due  || 0)
    const paidPct     = grandTotal > 0 ? Math.min(100, (paidAmount / grandTotal) * 100) : 0

    const isOverdue   = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
    const isOverseas  = OVERSEAS_TYPES.includes(invoice.type)
    const isForeign   = invoice.currency && invoice.currency !== 'INR'
    const exchangeRate = parseFloat(invoice.exchange_rate || 1)
    const inrEquiv    = isForeign && exchangeRate > 0 ? grandTotal * exchangeRate : null

    const statusKey   = isOverdue ? 'overdue' : invoice.status
    const statusCfg   = STATUS_CFG[statusKey] ?? STATUS_CFG.draft
    const typeLabel   = TYPE_LABEL[invoice.type] ?? 'Invoice'
    const party       = invoice.party ?? {}
    const currencyInfo = CURRENCY_MAP[invoice.currency]

    return (
        <AppLayout>
            <Head title={`${invoice.invoice_number}`} />

            <div className="max-w-5xl mx-auto space-y-5">

                {/* ── Top bar ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.visit('/invoices/sales')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold font-mono tracking-tight">{invoice.invoice_number}</h1>
                                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', statusCfg.cls)}>
                                    <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                                    {statusCfg.label}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
                                    <FileText className="w-3 h-3" /> {typeLabel}
                                </span>
                                {isOverseas && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
                                        <Globe className="w-3 h-3" /> Overseas
                                    </span>
                                )}
                                {isOverdue && (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Issued {formatDate(invoice.invoice_date)}
                                {invoice.due_date && (
                                    <> · Due <span className={isOverdue ? 'text-red-500 font-medium' : ''}>{formatDate(invoice.due_date)}</span></>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {invoice.status !== 'paid' && invoice.status !== 'voided' && balanceDue > 0 && (
                            <Button onClick={() => setShowPayment(true)} className="gap-2 h-9">
                                <CreditCard className="w-4 h-4" /> Record Payment
                            </Button>
                        )}
                        {invoice.status !== 'paid' && invoice.status !== 'voided' && (
                            <Button variant="outline" className="gap-2 h-9"
                                onClick={() => router.visit(`/invoices/${invoice.id}/edit`)}>
                                <Edit className="w-4 h-4" /> Edit
                            </Button>
                        )}
                        <Button variant="outline" className="gap-2 h-9"
                            onClick={() => window.open(`/invoices/${invoice.id}/preview`, '_blank')}>
                            <ExternalLink className="w-4 h-4" /> Preview
                        </Button>
                        <Button variant="outline" className="gap-2 h-9"
                            onClick={() => window.open(`/invoices/${invoice.id}/pdf`, '_blank')}>
                            <Printer className="w-4 h-4" /> PDF
                        </Button>
                        {invoice.status === 'draft' && (
                            <Button variant="outline" className="gap-2 h-9"
                                onClick={() => router.post(`/invoices/${invoice.id}/send`)}>
                                <Send className="w-4 h-4" /> Send
                            </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-9 w-9"
                            onClick={() => router.post(`/invoices/${invoice.id}/duplicate`)}>
                            <Copy className="w-4 h-4" />
                        </Button>
                        {invoice.status !== 'paid' && (
                            <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                onClick={() => setShowDelete(true)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Amount hero card ── */}
                <Card className={cn(
                    'border-2',
                    paidPct >= 100 ? 'border-green-200 dark:border-green-800' :
                    isOverdue      ? 'border-red-200 dark:border-red-800' :
                    balanceDue > 0 ? 'border-orange-200 dark:border-orange-800' : 'border-border'
                )}>
                    <CardContent className="p-5">
                        {/* Totals row */}
                        <div className="flex flex-wrap gap-6 items-start justify-between mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Grand Total</p>
                                <p className="text-3xl font-bold font-mono tracking-tight">
                                    {formatCurrency(grandTotal, invoice.currency)}
                                </p>
                                {isForeign && inrEquiv !== null && (
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        <span className="font-mono">≈ {formatCurrency(inrEquiv, 'INR')}</span>
                                        <span className="text-xs">@ {exchangeRate} {invoice.currency}/INR</span>
                                    </p>
                                )}
                                {isForeign && (
                                    <p className="text-xs mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                                        <Globe className="w-3 h-3" />
                                        {currencyInfo ? `${invoice.currency} — ${currencyInfo.name}` : invoice.currency}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-6 flex-wrap">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paid</p>
                                    <p className="text-xl font-bold font-mono text-green-600 dark:text-green-400">
                                        {formatCurrency(paidAmount, invoice.currency)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Balance Due</p>
                                    <p className={cn('text-xl font-bold font-mono',
                                        balanceDue > 0 ? (isOverdue ? 'text-red-600' : 'text-orange-600 dark:text-orange-400') : 'text-muted-foreground')}>
                                        {formatCurrency(balanceDue, invoice.currency)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                <span>Payment progress</span>
                                <span className="font-medium">{paidPct.toFixed(1)}%</span>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all duration-700',
                                    paidPct >= 100 ? 'bg-green-500' : paidPct > 0 ? 'bg-yellow-500' : 'bg-muted-foreground/20')}
                                    style={{ width: `${paidPct}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Bill To + Invoice Details ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Bill To */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {invoice.party_type === 'vendor' ? 'Vendor Details' : 'Bill To'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Avatar + name */}
                            <div className="flex items-center gap-3">
                                <PartyAvatar party={party} size="lg" />
                                <div>
                                    <p className="font-bold text-base leading-tight">{party.name ?? '—'}</p>
                                    {party.company_name && party.company_name !== party.name && (
                                        <p className="text-sm text-muted-foreground">{party.company_name}</p>
                                    )}
                                    {party.customer_code && (
                                        <p className="text-xs font-mono text-muted-foreground">{party.customer_code}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5 text-sm">
                                {party.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <a href={`mailto:${party.email}`} className="text-blue-600 hover:underline truncate">
                                            {party.email}
                                        </a>
                                    </div>
                                )}
                                {(party.phone || party.mobile) && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span>{party.mobile ?? party.phone}</span>
                                        {party.mobile && party.phone && party.mobile !== party.phone && (
                                            <span className="text-muted-foreground">/ {party.phone}</span>
                                        )}
                                    </div>
                                )}
                                {party.website && (
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <a href={party.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                                            {party.website}
                                        </a>
                                    </div>
                                )}
                                {party.contact_person && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span>{party.contact_person}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            {(party.billing_address || party.billing_city || party.billing_state) && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <address className="not-italic text-muted-foreground leading-snug">
                                        {party.billing_address && <span>{party.billing_address}<br /></span>}
                                        {[party.billing_city, party.billing_state].filter(Boolean).join(', ')}
                                        {party.billing_pincode && ` — ${party.billing_pincode}`}
                                        {party.billing_country && party.billing_country !== 'India' && (
                                            <><br />{party.billing_country}</>
                                        )}
                                    </address>
                                </div>
                            )}

                            {/* Tax / credit */}
                            {(party.gst_number || party.pan_number || party.credit_limit > 0 || party.credit_days > 0) && (
                                <div className="pt-3 border-t border-border space-y-1">
                                    {party.gst_number && (
                                        <InfoRow label="GSTIN" value={party.gst_number} mono />
                                    )}
                                    {party.pan_number && (
                                        <InfoRow label="PAN" value={party.pan_number} mono />
                                    )}
                                    {party.credit_limit > 0 && (
                                        <InfoRow label="Credit Limit" value={formatCurrency(party.credit_limit)} mono />
                                    )}
                                    {party.credit_days > 0 && (
                                        <InfoRow label="Credit Terms" value={`Net ${party.credit_days} days`} />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Details */}
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Invoice Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-1">
                            <InfoRow label="Invoice Type">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs font-semibold">
                                    <FileText className="w-3 h-3" /> {typeLabel}
                                </span>
                            </InfoRow>
                            <InfoRow label="Invoice Number" value={invoice.invoice_number} mono />
                            <InfoRow label="Invoice Date" value={formatDate(invoice.invoice_date)} />
                            {invoice.due_date && (
                                <InfoRow label="Due Date" value={formatDate(invoice.due_date)} red={!!isOverdue} />
                            )}
                            <InfoRow label="Currency">
                                <span className="text-sm font-medium flex items-center gap-1.5">
                                    <span className="font-mono">{invoice.currency}</span>
                                    {currencyInfo && (
                                        <span className="text-muted-foreground text-xs">— {currencyInfo.name}</span>
                                    )}
                                    {isForeign && (
                                        <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            <Globe className="w-2.5 h-2.5" /> Foreign
                                        </span>
                                    )}
                                </span>
                            </InfoRow>
                            {isForeign && exchangeRate > 0 && (
                                <InfoRow label="Exchange Rate" value={`1 ${invoice.currency} = ₹${exchangeRate}`} mono />
                            )}
                            {invoice.place_of_supply && (
                                <InfoRow label="Place of Supply" value={invoice.place_of_supply} />
                            )}
                            {invoice.reference_number && (
                                <InfoRow label="Reference #" value={invoice.reference_number} mono />
                            )}

                            {/* Totals mini breakdown */}
                            <div className="pt-3 mt-2 border-t border-border space-y-1">
                                <InfoRow label="Subtotal">
                                    <span className="font-mono text-sm">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                </InfoRow>
                                {parseFloat(invoice.discount_amount) > 0 && (
                                    <InfoRow label="Discount">
                                        <span className="font-mono text-sm text-green-600">−{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                                    </InfoRow>
                                )}
                                {parseFloat(invoice.tax_amount) > 0 && (
                                    <InfoRow label="Tax (GST)">
                                        <span className="font-mono text-sm">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                                    </InfoRow>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                                    <span className="font-bold">Grand Total</span>
                                    <div className="text-right">
                                        <span className="font-mono font-bold text-lg">{formatCurrency(grandTotal, invoice.currency)}</span>
                                        {isForeign && inrEquiv !== null && (
                                            <p className="text-xs text-muted-foreground font-mono">≈ {formatCurrency(inrEquiv, 'INR')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Overseas / Export Details ── */}
                {isOverseas && (invoice.port_of_loading || invoice.port_of_discharge || invoice.country_of_origin || invoice.lut_bond_number || invoice.shipping_bill_no) && (
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="border-b pb-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-t-lg">
                            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Ship className="w-4 h-4" /> Export / Shipping Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                            {invoice.country_of_origin && (
                                <InfoRow label="Country of Origin" value={invoice.country_of_origin} />
                            )}
                            {invoice.lut_bond_number && (
                                <InfoRow label="LUT / Bond" value={invoice.lut_bond_number} mono />
                            )}
                            {invoice.port_of_loading && (
                                <InfoRow label="Port of Loading" value={invoice.port_of_loading} />
                            )}
                            {invoice.port_of_discharge && (
                                <InfoRow label="Port of Discharge" value={invoice.port_of_discharge} />
                            )}
                            {invoice.shipping_bill_no && (
                                <InfoRow label="Shipping Bill #" value={invoice.shipping_bill_no} mono />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Line Items ── */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Line Items</CardTitle>
                            <span className="text-xs text-muted-foreground">{(invoice.items ?? []).length} item{(invoice.items ?? []).length !== 1 ? 's' : ''}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 border-b">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">#</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Item / Service</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Qty</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Rate</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Disc.</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Tax</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoice.items ?? []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No line items</td>
                                        </tr>
                                    ) : (invoice.items ?? []).map((item, idx) => (
                                        <tr key={item.id ?? idx} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3.5 text-muted-foreground text-xs">{idx + 1}</td>
                                            <td className="px-4 py-3.5 min-w-[200px]">
                                                <div className="font-medium">{item.item_name}</div>
                                                {item.description && (
                                                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.description}</div>
                                                )}
                                                {item.hsn_sac_code && (
                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                        HSN/SAC: {item.hsn_sac_code}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-muted-foreground">
                                                {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono">
                                                {formatCurrency(item.unit_price, invoice.currency)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                {parseFloat(item.discount_percent) > 0
                                                    ? <span className="text-green-600 font-medium">{item.discount_percent}%</span>
                                                    : <span className="text-muted-foreground">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                {parseFloat(item.tax_rate) > 0
                                                    ? <span className="text-blue-600 dark:text-blue-400 font-medium">{item.tax_rate}%</span>
                                                    : <span className="text-muted-foreground">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono font-semibold">
                                                {formatCurrency(item.total_amount, invoice.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Totals footer */}
                                <tfoot className="bg-muted/20 border-t-2 border-border">
                                    {parseFloat(invoice.discount_amount) > 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-2 text-right text-sm text-muted-foreground">Subtotal</td>
                                            <td className="px-4 py-2 text-right font-mono text-sm">{formatCurrency(invoice.subtotal, invoice.currency)}</td>
                                        </tr>
                                    )}
                                    {parseFloat(invoice.discount_amount) > 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-1.5 text-right text-sm text-green-600">Discount</td>
                                            <td className="px-4 py-1.5 text-right font-mono text-sm text-green-600">−{formatCurrency(invoice.discount_amount, invoice.currency)}</td>
                                        </tr>
                                    )}
                                    {parseFloat(invoice.tax_amount) > 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-1.5 text-right text-sm text-muted-foreground">GST</td>
                                            <td className="px-4 py-1.5 text-right font-mono text-sm">{formatCurrency(invoice.tax_amount, invoice.currency)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td colSpan={6} className="px-4 py-3 text-right font-bold">Grand Total</td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-lg">{formatCurrency(grandTotal, invoice.currency)}</td>
                                    </tr>
                                    {isForeign && inrEquiv !== null && (
                                        <tr>
                                            <td colSpan={6} className="px-4 pb-3 text-right text-xs text-muted-foreground">
                                                INR Equivalent (@ {exchangeRate} {invoice.currency}/INR)
                                            </td>
                                            <td className="px-4 pb-3 text-right font-mono text-sm text-muted-foreground">
                                                {formatCurrency(inrEquiv, 'INR')}
                                            </td>
                                        </tr>
                                    )}
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Payments Received ── */}
                {(invoice.payments ?? []).length > 0 && (
                    <Card>
                        <CardHeader className="border-b pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Payments Received
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">{invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 border-b">
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Date</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Method</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Reference</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Amount</th>
                                        <th className="w-20" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {formatDate(p.payment_date)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs font-medium capitalize">
                                                    {(p.payment_method ?? '').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {p.reference_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(p.amount, invoice.currency)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditPayment(p)}
                                                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Edit payment">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDeletePayment(p)}
                                                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors"
                                                        title="Delete payment">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-border bg-muted/20">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-medium">Total Paid</td>
                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(paidAmount, invoice.currency)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* ── Notes & Terms ── */}
                {(invoice.customer_notes || invoice.terms_conditions) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {invoice.customer_notes && (
                            <Card>
                                <CardHeader className="border-b pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {invoice.customer_notes}
                                </CardContent>
                            </Card>
                        )}
                        {invoice.terms_conditions && (
                            <Card>
                                <CardHeader className="border-b pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Terms &amp; Conditions</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {invoice.terms_conditions}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* ── Record Payment Dialog ── */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Record Payment
                        </DialogTitle>
                    </DialogHeader>
                    <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5 text-sm mb-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice</span>
                            <span className="font-mono font-medium">{invoice.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Grand Total</span>
                            <span className="font-mono">{formatCurrency(grandTotal, invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span className="text-muted-foreground">Balance Due</span>
                            <span className="font-mono text-orange-600">{formatCurrency(balanceDue, invoice.currency)}</span>
                        </div>
                        {isForeign && inrEquiv !== null && (
                            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                                <span>INR Equivalent</span>
                                <span className="font-mono">≈ {formatCurrency(inrEquiv, 'INR')}</span>
                            </div>
                        )}
                    </div>
                    <form onSubmit={recordPayment} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount ({invoice.currency}) *</label>
                            <Input type="number" step="0.01" min="0.01" max={balanceDue}
                                value={data.amount} onChange={e => setData('amount', e.target.value)} />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Payment Date *</label>
                            <Input type="date" value={data.payment_date}
                                onChange={e => setData('payment_date', e.target.value)} />
                            {errors.payment_date && <p className="text-xs text-red-500">{errors.payment_date}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Payment Method *</label>
                            <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                {METHODS.map(m => (
                                    <option key={m} value={m}>{m.replace(/_/g, ' ').toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Reference / Transaction ID</label>
                            <Input placeholder="Cheque no., UTR, transaction ID…"
                                value={data.reference} onChange={e => setData('reference', e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Record Payment'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Payment Dialog ── */}
            <Dialog open={!!editPayment} onOpenChange={o => !o && setEditPayment(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit Payment
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEditPayment} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount ({invoice.currency}) *</label>
                            <Input type="number" step="0.01" min="0.01"
                                value={editData.amount ?? ''}
                                onChange={e => setEditData(d => ({ ...d, amount: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Payment Date *</label>
                            <Input type="date" value={editData.payment_date ?? ''}
                                onChange={e => setEditData(d => ({ ...d, payment_date: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Payment Method *</label>
                            <select value={editData.payment_method ?? 'bank_transfer'}
                                onChange={e => setEditData(d => ({ ...d, payment_method: e.target.value }))}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                {METHODS.map(m => (
                                    <option key={m} value={m}>{m.replace(/_/g, ' ').toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Reference / Transaction ID</label>
                            <Input placeholder="Cheque no., UTR, transaction ID…"
                                value={editData.reference ?? ''}
                                onChange={e => setEditData(d => ({ ...d, reference: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="outline" onClick={() => setEditPayment(null)}>Cancel</Button>
                            <Button type="submit" disabled={payProcessing}>
                                {payProcessing ? 'Saving…' : 'Update Payment'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Payment Confirm ── */}
            <Dialog open={!!deletePayment} onOpenChange={o => !o && setDeletePayment(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" /> Remove Payment
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Remove payment of <strong className="font-mono text-foreground">{formatCurrency(deletePayment?.amount, invoice.currency)}</strong> dated{' '}
                        <strong>{formatDate(deletePayment?.payment_date)}</strong>?
                        This will reverse the amount from the invoice balance.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeletePayment(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={doDeletePayment}>Remove Payment</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm ── */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" /> Delete Invoice
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong className="font-mono">{invoice.invoice_number}</strong>? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
                        <Button variant="destructive"
                            onClick={() => router.delete(`/invoices/${invoice.id}`, { onSuccess: () => setShowDelete(false) })}>
                            Delete Invoice
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
