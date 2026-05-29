import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, Building2 } from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'

export default function VendorsIndex({ vendors = {}, filters = {} }) {
    const [showCreate, setShowCreate] = useState(false)
    const [search, setSearch] = useState(filters.search ?? '')
    const list = vendors.data ?? []

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', email: '', phone: '', gst_number: '', pan_number: '',
        address: '', city: '', state: '', payment_days: 30,
        credit_limit: '', currency: 'INR',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/vendors', { onSuccess: () => { reset(); setShowCreate(false) } })
    }

    return (
        <AppLayout>
            <Head title="Vendors" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Vendors</h1>
                        <p className="text-muted-foreground text-sm mt-1">{vendors.total ?? 0} vendors</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Vendor
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search vendors by name, email, or GST..."
                                value={search} onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get('/vendors', { search }, { preserveState: true })}
                                className="pl-9 max-w-md" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>GST Number</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead className="text-right">Outstanding</TableHead>
                                    <TableHead>Payment Terms</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No vendors yet
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((v) => (
                                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/vendors/${v.id}`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                                        {getInitials(v.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{v.name}</div>
                                                    <div className="text-xs text-muted-foreground">{v.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{v.gst_number ?? '—'}</TableCell>
                                        <TableCell>{v.city ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {parseFloat(v.outstanding_balance ?? 0) > 0
                                                ? <span className="text-red-500">{formatCurrency(v.outstanding_balance)}</span>
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{v.payment_days ? `${v.payment_days} days` : '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={v.is_active ? 'success' : 'secondary'}>
                                                {v.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
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
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Add Vendor</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
