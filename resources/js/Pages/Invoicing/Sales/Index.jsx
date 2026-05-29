import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Plus, Search, Download, Eye, FileText, Send, Printer,
    Edit, Trash2, CreditCard, CheckCircle2, Clock, AlertTriangle,
    TrendingUp, Banknote, Receipt, Filter, X, MoreVertical, Copy,
    ChevronDown, CalendarRange, SlidersHorizontal
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
    { value: '',                label: 'All Types' },
    { value: 'sales',           label: 'Sales Invoice' },
    { value: 'tax_invoice',     label: 'Tax Invoice' },
    { value: 'export_invoice',  label: 'Export Invoice' },
    { value: 'export_proforma', label: 'Export Proforma' },
    { value: 'bill_of_supply',  label: 'Bill of Supply' },
]

const STATUS = {
    draft:    { label: 'Draft',    dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    sent:     { label: 'Sent',     dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    partial:  { label: 'Partial',  dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    paid:     { label: 'Paid',     dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    overdue:  { label: 'Overdue',  dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    voided:   { label: 'Voided',   dot: 'bg-gray-300',   badge: 'bg-muted text-muted-foreground' },
    cancelled:{ label: 'Cancelled',dot: 'bg-gray-300',   badge: 'bg-muted text-muted-foreground' },
}

const METHODS = ['bank_transfer','cash','cheque','upi','credit_card','neft','rtgs','imps']

export default function SalesIndex({ invoices = {}, filters = {} }) {
    const list = invoices.data ?? []
    const [search, setSearch]           = useState(filters.search ?? '')
    const [from, setFrom]               = useState(filters.from ?? '')
    const [to, setTo]                   = useState(filters.to ?? '')
    const [minAmount, setMinAmount]     = useState(filters.min_amount ?? '')
    const [maxAmount, setMaxAmount]     = useState(filters.max_amount ?? '')
    const [typeFilter, setTypeFilter]   = useState(filters.type_filter ?? '')
    const [showFilters, setShowFilters] = useState(
        !!(filters.from || filters.to || filters.min_amount || filters.max_amount || filters.type_filter)
    )
    const [payTarget, setPayTarget]     = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [openMenuId, setOpenMenuId]   = useState(null)

    const hasActiveFilters = !!(filters.search || filters.status || filters.from || filters.to || filters.min_amount || filters.max_amount || filters.type_filter)

    function applyFilters(overrides = {}) {
        const params = {
            search,
            status: filters.status ?? '',
            from,
            to,
            min_amount: minAmount,
            max_amount: maxAmount,
            type_filter: typeFilter,
            ...overrides,
        }
        // strip empty values
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
        router.get('/invoices/sales', params, { preserveState: true })
    }

    function clearFilters() {
        setSearch(''); setFrom(''); setTo(''); setMinAmount(''); setMaxAmount(''); setTypeFilter('')
        router.get('/invoices/sales', {}, { preserveState: false })
    }

    // Derived summary stats from current page
    const totalRevenue    = list.reduce((s, i) => s + parseFloat(i.grand_total || 0), 0)
    const totalOutstanding = list.reduce((s, i) => s + parseFloat(i.balance_due || 0), 0)
    const paidCount       = list.filter(i => i.status === 'paid').length
    const overdueCount    = list.filter(i => isOverdue(i)).length

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: 0,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'bank_transfer',
        reference: '',
    })

    function isOverdue(inv) {
        return inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid' && inv.status !== 'voided'
    }

    function getStatusKey(inv) {
        return isOverdue(inv) ? 'overdue' : inv.status
    }

    function openPayDialog(inv) {
        setPayTarget(inv)
        setData({ amount: inv.balance_due ?? 0, payment_date: new Date().toISOString().slice(0, 10), payment_method: 'bank_transfer', reference: '' })
        setOpenMenuId(null)
    }

    function submitPayment(e) {
        e.preventDefault()
        post(`/invoices/${payTarget.id}/payment`, {
            onSuccess: () => { reset(); setPayTarget(null) },
        })
    }

    function confirmDelete(inv) {
        setDeleteTarget(inv)
        setOpenMenuId(null)
    }

    function doDelete() {
        router.delete(`/invoices/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        })
    }

    return (
        <AppLayout>
            <Head title="Sales Invoices" />
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Sales Invoices</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Manage customer invoices, track payments &amp; outstanding balances
                        </p>
                    </div>
                    <Button onClick={() => router.visit('/invoices/create?type=sales')} className="gap-2">
                        <Plus className="w-4 h-4" /> New Invoice
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                            <p className="text-2xl font-bold font-mono">{invoices.total ?? list.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Invoices</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-xs text-muted-foreground">Revenue</span>
                            </div>
                            <p className="text-xl font-bold font-mono text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</p>
                            <p className="text-xs text-muted-foreground mt-1">This page</p>
                        </CardContent>
                    </Card>
                    <Card className={totalOutstanding > 0 ? 'border-orange-200 dark:border-orange-800' : ''}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                    <Banknote className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="text-xs text-muted-foreground">Outstanding</span>
                            </div>
                            <p className={cn('text-xl font-bold font-mono', totalOutstanding > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground')}>
                                {formatCurrency(totalOutstanding)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Balance due</p>
                        </CardContent>
                    </Card>
                    <Card className={overdueCount > 0 ? 'border-red-200 dark:border-red-800' : ''}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
                                    overdueCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-muted')}>
                                    <AlertTriangle className={cn('w-4 h-4', overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')} />
                                </div>
                                <span className="text-xs text-muted-foreground">Overdue</span>
                            </div>
                            <p className={cn('text-2xl font-bold', overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}>
                                {overdueCount}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters + Table */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        {/* Row 1: Search + toggle buttons */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <form onSubmit={(e) => { e.preventDefault(); applyFilters() }}
                                className="relative flex-1 min-w-[220px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoice #, customer, GSTIN…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </form>

                            {/* Status tabs */}
                            <div className="flex items-center gap-1 flex-wrap">
                                {['', 'draft', 'sent', 'partial', 'paid', 'overdue'].map(s => (
                                    <button key={s}
                                        onClick={() => applyFilters({ status: s })}
                                        className={cn('h-8 px-3 rounded-md text-xs font-medium transition-colors',
                                            (filters.status ?? '') === s
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}>
                                        {s === '' ? 'All' : STATUS[s]?.label ?? s}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <Button
                                    variant={showFilters ? 'secondary' : 'outline'}
                                    size="sm"
                                    className="h-9 gap-1.5"
                                    onClick={() => setShowFilters(v => !v)}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                                            {[filters.from, filters.to, filters.min_amount, filters.max_amount, filters.type_filter].filter(Boolean).length}
                                        </span>
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={clearFilters}>
                                        <X className="w-3.5 h-3.5" /> Clear
                                    </Button>
                                )}
                                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Row 2: Expanded filters */}
                        {showFilters && (
                            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">From Date</label>
                                    <Input type="date" value={from} onChange={e => setFrom(e.target.value)}
                                        className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">To Date</label>
                                    <Input type="date" value={to} onChange={e => setTo(e.target.value)}
                                        className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Min Amount</label>
                                    <Input type="number" min="0" step="0.01" placeholder="₹ 0"
                                        value={minAmount} onChange={e => setMinAmount(e.target.value)}
                                        className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Max Amount</label>
                                    <Input type="number" min="0" step="0.01" placeholder="₹ ∞"
                                        value={maxAmount} onChange={e => setMaxAmount(e.target.value)}
                                        className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Invoice Type</label>
                                    <div className="relative">
                                        <select
                                            value={typeFilter}
                                            onChange={e => setTypeFilter(e.target.value)}
                                            className="w-full h-9 appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {TYPE_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-5 flex justify-end">
                                    <Button size="sm" className="h-8 px-4" onClick={() => applyFilters()}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Active filter chips */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                                        Search: {filters.search}
                                        <button onClick={() => { setSearch(''); applyFilters({ search: '' }) }} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.type_filter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                                        {TYPE_OPTIONS.find(o => o.value === filters.type_filter)?.label ?? filters.type_filter}
                                        <button onClick={() => { setTypeFilter(''); applyFilters({ type_filter: '' }) }} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {(filters.from || filters.to) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                                        <CalendarRange className="w-3 h-3" />
                                        {filters.from ?? '…'} → {filters.to ?? '…'}
                                        <button onClick={() => { setFrom(''); setTo(''); applyFilters({ from: '', to: '' }) }} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {(filters.min_amount || filters.max_amount) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                                        ₹{filters.min_amount ?? 0} – {filters.max_amount ? '₹' + filters.max_amount : '∞'}
                                        <button onClick={() => { setMinAmount(''); setMaxAmount(''); applyFilters({ min_amount: '', max_amount: '' }) }} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 border-b">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Invoice #</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Customer</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Due</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Amount</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Balance</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <FileText className="w-12 h-12 text-muted-foreground/30" />
                                                    <p className="text-muted-foreground font-medium">No invoices found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hasActiveFilters ? 'Try clearing your filters' : 'Create your first invoice to get started'}
                                                    </p>
                                                    {!hasActiveFilters && (
                                                        <Button size="sm" className="mt-1" onClick={() => router.visit('/invoices/create?type=sales')}>
                                                            <Plus className="w-4 h-4 mr-1" /> New Invoice
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : list.map((inv) => {
                                        const overdue = isOverdue(inv)
                                        const sk = getStatusKey(inv)
                                        const sc = STATUS[sk] ?? STATUS.draft
                                        const balDue = parseFloat(inv.balance_due || 0)
                                        const paidPct = inv.grand_total > 0
                                            ? Math.min(100, (parseFloat(inv.paid_amount || 0) / parseFloat(inv.grand_total)) * 100)
                                            : 0

                                        return (
                                            <tr key={inv.id}
                                                className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/invoices/${inv.id}`)}>

                                                {/* Invoice # */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />
                                                        <span className="font-mono font-semibold text-primary">{inv.invoice_number}</span>
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-bold text-primary">
                                                                {(inv.party?.name ?? '?').slice(0, 2).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium truncate max-w-[180px]">{inv.party?.name ?? '—'}</p>
                                                            {inv.party?.email && (
                                                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{inv.party.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3.5 text-muted-foreground">{formatDate(inv.invoice_date)}</td>

                                                {/* Due */}
                                                <td className="px-4 py-3.5">
                                                    <span className={cn('font-medium', overdue ? 'text-red-500' : 'text-muted-foreground')}>
                                                        {formatDate(inv.due_date) ?? '—'}
                                                        {overdue && <AlertTriangle className="inline ml-1 w-3 h-3" />}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3.5 text-right font-mono font-medium">
                                                    {formatCurrency(inv.grand_total, inv.currency)}
                                                </td>

                                                {/* Balance */}
                                                <td className="px-4 py-3.5 text-right">
                                                    {balDue > 0 ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                                                {formatCurrency(balDue, inv.currency)}
                                                            </span>
                                                            <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                                                                <div className="h-full bg-green-500 rounded-full"
                                                                    style={{ width: `${paidPct}%` }} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs flex items-center gap-1 justify-end">
                                                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Paid
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', sc.badge)}>
                                                        {sc.label}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                    <div className="relative">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8"
                                                            onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}>
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                        {openMenuId === inv.id && (
                                                            <div className="absolute right-0 top-9 z-50 w-48 rounded-lg border border-border bg-popover shadow-lg py-1">
                                                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                    onClick={() => { router.visit(`/invoices/${inv.id}`); setOpenMenuId(null) }}>
                                                                    <Eye className="w-3.5 h-3.5 text-muted-foreground" /> View
                                                                </button>
                                                                {inv.status !== 'paid' && inv.status !== 'voided' && (
                                                                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                        onClick={() => { router.visit(`/invoices/${inv.id}/edit`); setOpenMenuId(null) }}>
                                                                        <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
                                                                    </button>
                                                                )}
                                                                {inv.status !== 'paid' && inv.status !== 'voided' && balDue > 0 && (
                                                                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                        onClick={() => openPayDialog(inv)}>
                                                                        <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> Record Payment
                                                                    </button>
                                                                )}
                                                                {inv.status === 'draft' && (
                                                                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                        onClick={() => { router.post(`/invoices/${inv.id}/send`); setOpenMenuId(null) }}>
                                                                        <Send className="w-3.5 h-3.5 text-muted-foreground" /> Send
                                                                    </button>
                                                                )}
                                                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                    onClick={() => { window.open(`/invoices/${inv.id}/pdf`, '_blank'); setOpenMenuId(null) }}>
                                                                    <Printer className="w-3.5 h-3.5 text-muted-foreground" /> Print PDF
                                                                </button>
                                                                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                                    onClick={() => { router.post(`/invoices/${inv.id}/duplicate`); setOpenMenuId(null) }}>
                                                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
                                                                </button>
                                                                {inv.status !== 'paid' && (
                                                                    <>
                                                                        <div className="border-t border-border my-1" />
                                                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                            onClick={() => confirmDelete(inv)}>
                                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {invoices.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Showing {invoices.from}–{invoices.to} of {invoices.total} invoices
                                </p>
                                <div className="flex gap-1">
                                    {invoices.links?.map((link, i) => (
                                        <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className="h-8 min-w-[32px] px-2 text-xs"
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Record Payment Dialog */}
            <Dialog open={!!payTarget} onOpenChange={(o) => !o && setPayTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Record Payment
                        </DialogTitle>
                    </DialogHeader>
                    {payTarget && (
                        <>
                            <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5 text-sm mb-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Invoice</span>
                                    <span className="font-mono font-medium">{payTarget.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer</span>
                                    <span className="font-medium">{payTarget.party?.name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span className="text-muted-foreground">Balance Due</span>
                                    <span className="text-orange-600 font-mono">{formatCurrency(payTarget.balance_due, payTarget.currency)}</span>
                                </div>
                            </div>
                            <form onSubmit={submitPayment} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Amount *</label>
                                    <Input type="number" step="0.01" min="0.01" max={payTarget.balance_due}
                                        value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                    {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Payment Date *</label>
                                    <Input type="date" value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Payment Method *</label>
                                    <select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        {METHODS.map(m => (
                                            <option key={m} value={m}>{m.replace(/_/g, ' ').toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reference / Transaction ID</label>
                                    <Input placeholder="Cheque no., UTR, transaction ID…"
                                        value={data.reference} onChange={(e) => setData('reference', e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-3 pt-1">
                                    <Button type="button" variant="outline" onClick={() => setPayTarget(null)}>Cancel</Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Record Payment'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" /> Delete Invoice
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete invoice <strong className="font-mono">{deleteTarget?.invoice_number}</strong>?
                        This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={doDelete}>Delete Invoice</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Click-away to close dropdown */}
            {openMenuId && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            )}
        </AppLayout>
    )
}
