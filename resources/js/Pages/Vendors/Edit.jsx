import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function VendorEdit({ vendor }) {
    const { data, setData, put, processing, errors } = useForm({
        name: vendor.name ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        gst_number: vendor.gst_number ?? '',
        pan_number: vendor.pan_number ?? '',
        address: vendor.address ?? '',
        city: vendor.city ?? '',
        state: vendor.state ?? '',
        payment_days: vendor.payment_days ?? 30,
        credit_limit: vendor.credit_limit ?? '',
    })

    const submit = (e) => {
        e.preventDefault()
        put(`/vendors/${vendor.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit ${vendor.name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/vendors/${vendor.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Vendor</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{vendor.name}</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Vendor Name *</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Phone</label>
                                <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">GST Number</label>
                                <Input value={data.gst_number} onChange={(e) => setData('gst_number', e.target.value)} className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">PAN Number</label>
                                <Input value={data.pan_number} onChange={(e) => setData('pan_number', e.target.value)} className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">City</label>
                                <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">State</label>
                                <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Payment Terms (days)</label>
                                <Input type="number" min="0" value={data.payment_days}
                                    onChange={(e) => setData('payment_days', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Credit Limit (₹)</label>
                                <Input type="number" step="0.01" min="0" value={data.credit_limit}
                                    onChange={(e) => setData('credit_limit', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/vendors/${vendor.id}`)}>Cancel</Button>
                        <Button type="submit" loading={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
