import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function AssetCreate({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        asset_code: '',
        asset_category_id: '',
        purchase_date: '',
        purchase_cost: '',
        useful_life_years: '',
        salvage_value: '',
        depreciation_method: 'straight_line',
        location: '',
        serial_number: '',
        description: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/assets')
    }

    return (
        <AppLayout>
            <Head title="Add Asset" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/assets')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Fixed Asset</h1>
                        <p className="text-muted-foreground text-sm">Register a new asset in the asset register</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Asset Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Asset Name *</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Dell Laptop i7" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Asset Code</label>
                                <Input value={data.asset_code} onChange={(e) => setData('asset_code', e.target.value)}
                                    placeholder="e.g. IT-0001" className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Category</label>
                                <select value={data.asset_category_id} onChange={(e) => setData('asset_category_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Serial Number</label>
                                <Input value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Location</label>
                                <Input value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="e.g. Head Office" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                                    rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Financial Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Purchase Date *</label>
                                <Input type="date" value={data.purchase_date} onChange={(e) => setData('purchase_date', e.target.value)} />
                                {errors.purchase_date && <p className="text-xs text-destructive">{errors.purchase_date}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Purchase Cost (₹) *</label>
                                <Input type="number" step="0.01" min="0" value={data.purchase_cost}
                                    onChange={(e) => setData('purchase_cost', e.target.value)} />
                                {errors.purchase_cost && <p className="text-xs text-destructive">{errors.purchase_cost}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Useful Life (Years) *</label>
                                <Input type="number" min="1" value={data.useful_life_years}
                                    onChange={(e) => setData('useful_life_years', e.target.value)} />
                                {errors.useful_life_years && <p className="text-xs text-destructive">{errors.useful_life_years}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Salvage Value (₹)</label>
                                <Input type="number" step="0.01" min="0" value={data.salvage_value}
                                    onChange={(e) => setData('salvage_value', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Depreciation Method *</label>
                                <select value={data.depreciation_method} onChange={(e) => setData('depreciation_method', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="straight_line">Straight Line</option>
                                    <option value="declining_balance">Declining Balance</option>
                                    <option value="units_of_production">Units of Production</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit('/assets')}>Cancel</Button>
                        <Button type="submit" loading={processing}>Add Asset</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
