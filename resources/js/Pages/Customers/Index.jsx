import { useRef, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LocationSelect } from '@/components/ui/location-select'
import {
    Plus, Search, Users, Building2, Mail, Phone, MapPin,
    Upload, X, Globe, CreditCard, FileText, MoreVertical,
    Edit, Trash2, Eye, CheckCircle2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CURRENCIES = ['INR','USD','EUR','GBP','AED','SGD','AUD','CAD','JPY']

function LogoAvatar({ logo, name, size = 'md' }) {
    const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    if (logo) {
        return (
            <img src={`/storage/${logo}`} alt={name}
                className={cn('rounded-full object-cover shrink-0 border border-border', sz)} />
        )
    }
    return (
        <div className={cn('rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center font-bold shrink-0', sz)}>
            {initials}
        </div>
    )
}

function LogoUpload({ value, onChange, label = 'Logo / Photo' }) {
    const ref = useRef()
    const [preview, setPreview] = useState(null)

    function pick(e) {
        const file = e.target.files?.[0]
        if (!file) return
        onChange(file)
        setPreview(URL.createObjectURL(file))
    }
    function clear() {
        onChange(null)
        setPreview(null)
        if (ref.current) ref.current.value = ''
    }
    const src = preview

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex items-center gap-3">
                {src ? (
                    <div className="relative">
                        <img src={src} alt="preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                        <button type="button" onClick={clear}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
                <div>
                    <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} className="gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> {src ? 'Change' : 'Upload'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF — max 2 MB</p>
                </div>
            </div>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
        </div>
    )
}

export default function CustomersIndex({ customers = {}, filters = {} }) {
    const list = customers.data ?? []
    const [showCreate, setShowCreate] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [search, setSearch] = useState(filters.search ?? '')

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', company_name: '', contact_person: '', customer_type: 'company',
        email: '', phone: '', mobile: '', website: '',
        gst_number: '', pan_number: '',
        billing_address: '', billing_pincode: '',
        billing_city: '', billing_state: '', billing_state_code: '',
        billing_country: 'India', billing_country_code: 'IN',
        currency: 'INR', credit_limit: '', credit_days: 30,
        payment_terms: '', notes: '',
        logo: null,
    })

    function submit(e) {
        e.preventDefault()
        post('/customers', {
            forceFormData: true,
            onSuccess: () => { reset(); setShowCreate(false) },
        })
    }

    function applySearch(e) {
        e.preventDefault()
        router.get('/customers', { search }, { preserveState: true })
    }

    return (
        <AppLayout>
            <Head title="Customers" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Customers</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {customers.total ?? list.length} customer{(customers.total ?? list.length) !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Customer
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <div className="flex flex-wrap gap-3 items-center">
                            <form onSubmit={applySearch} className="relative flex-1 min-w-[220px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search by name, email, GST or city…"
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="pl-9 h-9 max-w-sm" />
                            </form>
                            <div className="flex gap-1">
                                {['', 'active', 'inactive'].map(s => (
                                    <button key={s}
                                        onClick={() => router.get('/customers', { ...filters, status: s, search }, { preserveState: true })}
                                        className={cn('h-8 px-3 rounded-md text-xs font-medium transition-colors',
                                            (filters.status ?? '') === s
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted')}>
                                        {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/30 border-b">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Contact</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Location</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">GST / PAN</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Outstanding</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Credit</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {list.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users className="w-12 h-12 text-muted-foreground/30" />
                                                <p className="text-muted-foreground font-medium">No customers yet</p>
                                                <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 mt-1">
                                                    <Plus className="w-4 h-4" /> Add First Customer
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : list.map(c => (
                                    <tr key={c.id}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => router.visit(`/customers/${c.id}`)}>

                                        {/* Customer name + logo */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <LogoAvatar logo={c.logo} name={c.name} />
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate max-w-[180px]">{c.name}</p>
                                                    {c.company_name && c.company_name !== c.name && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{c.company_name}</p>
                                                    )}
                                                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium',
                                                        c.customer_type === 'company'
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                            : 'bg-muted text-muted-foreground')}>
                                                        {c.customer_type === 'company' ? 'Company' : 'Individual'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-0.5 min-w-0">
                                                {c.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="w-3 h-3 shrink-0" />
                                                        <span className="truncate max-w-[160px]">{c.email}</span>
                                                    </div>
                                                )}
                                                {(c.mobile ?? c.phone) && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3 shrink-0" />
                                                        <span>{c.mobile ?? c.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-3.5">
                                            {(c.billing_city || c.billing_state || c.billing_country) ? (
                                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                                    <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                                    <span>
                                                        {[c.billing_city, c.billing_state, c.billing_country].filter(Boolean).join(', ')}
                                                    </span>
                                                </div>
                                            ) : <span className="text-muted-foreground">—</span>}
                                        </td>

                                        {/* GST / PAN */}
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-0.5">
                                                {c.gst_number ? (
                                                    <p className="font-mono text-xs">{c.gst_number}</p>
                                                ) : null}
                                                {c.pan_number ? (
                                                    <p className="font-mono text-xs text-muted-foreground">{c.pan_number}</p>
                                                ) : null}
                                                {!c.gst_number && !c.pan_number && <span className="text-muted-foreground">—</span>}
                                            </div>
                                        </td>

                                        {/* Outstanding */}
                                        <td className="px-4 py-3.5 text-right">
                                            {parseFloat(c.outstanding_balance ?? 0) > 0 ? (
                                                <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                                                    {formatCurrency(c.outstanding_balance)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Clear
                                                </span>
                                            )}
                                        </td>

                                        {/* Credit */}
                                        <td className="px-4 py-3.5">
                                            {c.credit_days ? (
                                                <span className="text-sm">Net {c.credit_days}d</span>
                                            ) : <span className="text-muted-foreground">—</span>}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                                c.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-muted text-muted-foreground')}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                            <div className="relative">
                                                <Button size="icon" variant="ghost" className="h-8 w-8"
                                                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}>
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                                {openMenuId === c.id && (
                                                    <div className="absolute right-0 top-9 z-50 w-44 rounded-lg border border-border bg-popover shadow-lg py-1">
                                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                            onClick={() => { router.visit(`/customers/${c.id}`); setOpenMenuId(null) }}>
                                                            <Eye className="w-3.5 h-3.5 text-muted-foreground" /> View
                                                        </button>
                                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                            onClick={() => { router.visit(`/customers/${c.id}/edit`); setOpenMenuId(null) }}>
                                                            <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Edit
                                                        </button>
                                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                            onClick={() => { router.visit(`/customers/${c.id}/statement`); setOpenMenuId(null) }}>
                                                            <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Statement
                                                        </button>
                                                        <div className="border-t border-border my-1" />
                                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            onClick={() => { setDeleteTarget(c); setOpenMenuId(null) }}>
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {customers.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Showing {customers.from}–{customers.to} of {customers.total}
                                </p>
                                <div className="flex gap-1">
                                    {customers.links?.map((link, i) => (
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

            {/* Click-away */}
            {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}

            {/* Create Customer Dialog */}
            <Dialog open={showCreate} onOpenChange={o => { if (!o) { reset(); setShowCreate(false) } else setShowCreate(true) }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Add New Customer
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-5 mt-1" encType="multipart/form-data">

                        {/* Logo */}
                        <LogoUpload value={data.logo} onChange={v => setData('logo', v)} />

                        {/* Basic Info */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Basic Information</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">Customer / Business Name *</label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Full name or business name" />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)} placeholder="Legal company name" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Contact Person</label>
                                    <Input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} placeholder="Primary contact" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Customer Type</label>
                                    <select value={data.customer_type} onChange={e => setData('customer_type', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="company">Company / Business</option>
                                        <option value="individual">Individual</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Currency</label>
                                    <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Information</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@company.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+91 …" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Mobile</label>
                                    <Input value={data.mobile} onChange={e => setData('mobile', e.target.value)} placeholder="+91 …" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Website</label>
                                    <Input value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://…" />
                                </div>
                            </div>
                        </div>

                        {/* Tax Numbers */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tax & Compliance</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">GSTIN</label>
                                    <Input value={data.gst_number} onChange={e => setData('gst_number', e.target.value.toUpperCase())}
                                        className="font-mono" placeholder="22AAAAA0000A1Z5" maxLength={15} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">PAN</label>
                                    <Input value={data.pan_number} onChange={e => setData('pan_number', e.target.value.toUpperCase())}
                                        className="font-mono" placeholder="AAAAA0000A" maxLength={10} />
                                </div>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Billing Address</p>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Street Address</label>
                                    <textarea value={data.billing_address} onChange={e => setData('billing_address', e.target.value)}
                                        rows={2} placeholder="Street address, building, floor…"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                                <LocationSelect
                                    country={data.billing_country_code}
                                    onCountryChange={v => setData('billing_country_code', v)}
                                    onCountryNameChange={v => setData('billing_country', v)}
                                    state={data.billing_state_code}
                                    onStateChange={v => setData('billing_state_code', v)}
                                    onStateNameChange={v => setData('billing_state', v)}
                                    city={data.billing_city}
                                    onCityChange={v => setData('billing_city', v)}
                                />
                                <div className="space-y-1 max-w-[180px]">
                                    <label className="text-sm font-medium">Pincode / ZIP</label>
                                    <Input value={data.billing_pincode} onChange={e => setData('billing_pincode', e.target.value)} placeholder="400001" />
                                </div>
                            </div>
                        </div>

                        {/* Credit Terms */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Credit &amp; Payment</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Credit Days</label>
                                    <Input type="number" min="0" value={data.credit_days}
                                        onChange={e => setData('credit_days', e.target.value)} placeholder="30" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Credit Limit</label>
                                    <Input type="number" step="0.01" min="0" value={data.credit_limit}
                                        onChange={e => setData('credit_limit', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Payment Terms</label>
                                    <select value={data.payment_terms} onChange={e => setData('payment_terms', e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">None</option>
                                        <option value="Net 7">Net 7</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 45">Net 45</option>
                                        <option value="Net 60">Net 60</option>
                                        <option value="Due on Receipt">Due on Receipt</option>
                                        <option value="Advance">Advance</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Internal Notes</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                rows={2} placeholder="Any notes about this customer…"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false) }}>Cancel</Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Plus className="w-4 h-4" /> {processing ? 'Saving…' : 'Add Customer'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Customer</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleteTarget?.name}</strong>? This will remove the customer and cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive"
                            onClick={() => router.delete(`/customers/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) })}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
