import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Wrench } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AssetMaintenance({ maintenances = {}, filters = {} }) {
    const list = maintenances.data ?? []
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, reset, errors } = useForm({
        asset_id: '',
        maintenance_date: '',
        description: '',
        cost: '',
        status: 'scheduled',
        vendor_name: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/assets/maintenance', { onSuccess: () => { reset(); setOpen(false) } })
    }

    const statusVariant = { scheduled: 'secondary', in_progress: 'warning', completed: 'success', cancelled: 'destructive' }

    return (
        <AppLayout>
            <Head title="Asset Maintenance" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Asset Maintenance</h1>
                        <p className="text-muted-foreground text-sm mt-1">Schedule and track maintenance activities</p>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Log Maintenance
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No maintenance records
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((m) => (
                                    <TableRow key={m.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="font-medium">{m.asset?.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{m.asset?.asset_code}</div>
                                        </TableCell>
                                        <TableCell>{formatDate(m.maintenance_date)}</TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground">{m.description}</TableCell>
                                        <TableCell>{m.vendor_name ?? '—'}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(m.cost)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[m.status] ?? 'secondary'} className="capitalize">
                                                {m.status?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Log Maintenance</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description *</label>
                            <Input value={data.description} onChange={(e) => setData('description', e.target.value)}
                                placeholder="e.g. Annual servicing" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" value={data.maintenance_date} onChange={(e) => setData('maintenance_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Cost (₹)</label>
                                <Input type="number" step="0.01" min="0" value={data.cost}
                                    onChange={(e) => setData('cost', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Vendor</label>
                                <Input value={data.vendor_name} onChange={(e) => setData('vendor_name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
