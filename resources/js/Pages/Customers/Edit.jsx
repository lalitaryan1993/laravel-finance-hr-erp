import { useRef, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationSelect } from '@/components/ui/location-select'
import { ArrowLeft, Upload, X, Save } from 'lucide-react'

const CURRENCIES = ['INR','USD','EUR','GBP','AED','SGD','AUD','CAD','JPY']

function LogoUpload({ existing, value, onChange }) {
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

    const src = preview || (existing ? `/storage/${existing}` : null)

    return (
        <div className="flex items-center gap-4">
            {src ? (
                <div className="relative shrink-0">
                    <img src={src} alt="logo" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
                    <button type="button" onClick={clear}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <div>
                <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} className="gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> {src ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, GIF or WebP · max 2 MB</p>
            </div>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
        </div>
    )
}

export default function CustomerEdit({ customer }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name:                 customer.name ?? '',
        company_name:         customer.company_name ?? '',
        contact_person:       customer.contact_person ?? '',
        customer_type:        customer.customer_type ?? 'company',
        email:                customer.email ?? '',
        phone:                customer.phone ?? '',
        mobile:               customer.mobile ?? '',
        website:              customer.website ?? '',
        gst_number:           customer.gst_number ?? '',
        pan_number:           customer.pan_number ?? '',
        billing_address:      customer.billing_address ?? '',
        billing_pincode:      customer.billing_pincode ?? '',
        billing_city:         customer.billing_city ?? '',
        billing_state:        customer.billing_state ?? '',
        billing_state_code:   customer.billing_state_code ?? '',
        billing_country:      customer.billing_country ?? 'India',
        billing_country_code: customer.billing_country_code ?? 'IN',
        currency:             customer.currency ?? 'INR',
        credit_limit:         customer.credit_limit ?? '',
        credit_days:          customer.credit_days ?? 30,
        payment_terms:        customer.payment_terms ?? '',
        notes:                customer.notes ?? '',
        is_active:            customer.is_active ?? true,
        logo:                 null,
    })

    function submit(e) {
        e.preventDefault()
        post(`/customers/${customer.id}`, { forceFormData: true })
    }

    return (
        <AppLayout>
            <Head title={`Edit ${customer.name}`} />
            <div className="space-y-6 max-w-3xl">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/customers/${customer.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Customer</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{customer.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5" encType="multipart/form-data">

                    {/* Logo */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Logo / Photo</CardTitle></CardHeader>
                        <CardContent className="pt-4">
                            <LogoUpload existing={customer.logo} value={data.logo}
                                onChange={v => setData('logo', v)} />
                        </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Customer / Business Name *</label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Company Name</label>
                                <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Contact Person</label>
                                <Input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} />
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
                                <label className="text-sm font-medium">Status</label>
                                <select value={data.is_active ? '1' : '0'} onChange={e => setData('is_active', e.target.value === '1')}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Phone</label>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mobile</label>
                                <Input value={data.mobile} onChange={e => setData('mobile', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Website</label>
                                <Input value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://…" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tax */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Tax &amp; Compliance</CardTitle></CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
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
                        </CardContent>
                    </Card>

                    {/* Billing Address */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Billing Address</CardTitle></CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Street Address</label>
                                <textarea value={data.billing_address} onChange={e => setData('billing_address', e.target.value)}
                                    rows={2} placeholder="Street, building, floor…"
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
                            <div className="space-y-1 max-w-[200px]">
                                <label className="text-sm font-medium">Pincode / ZIP</label>
                                <Input value={data.billing_pincode} onChange={e => setData('billing_pincode', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit & Payment */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Credit &amp; Payment</CardTitle></CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Currency</label>
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
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
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Credit Days</label>
                                <Input type="number" min="0" value={data.credit_days} onChange={e => setData('credit_days', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Credit Limit</label>
                                <Input type="number" step="0.01" min="0" value={data.credit_limit} onChange={e => setData('credit_limit', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader className="border-b pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                        <CardContent className="pt-4">
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                rows={3} placeholder="Internal notes about this customer…"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/customers/${customer.id}`)}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="w-4 h-4" /> {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
