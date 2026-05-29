import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Edit2, Trash2, ToggleLeft, Calculator, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_META = {
    gst:  { label: 'GST',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',    desc: 'Goods & Services Tax (combined)' },
    cgst: { label: 'CGST', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', desc: 'Central GST component' },
    sgst: { label: 'SGST', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', desc: 'State GST component' },
    igst: { label: 'IGST', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', desc: 'Integrated GST (interstate)' },
    tds:  { label: 'TDS',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', desc: 'Tax Deducted at Source' },
    tcs:  { label: 'TCS',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',  desc: 'Tax Collected at Source' },
}

const emptyForm = { name: '', type: 'gst', rate: '', hsn_sac_code: '', is_active: true }

function TypeBadge({ type }) {
    const meta = TYPE_META[type?.toLowerCase()] ?? { label: type ?? '—', color: 'bg-muted text-muted-foreground' }
    return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', meta.color)}>
            {meta.label}
        </span>
    )
}

function TaxRateForm({ data, setData, errors, onSubmit, processing, onClose, isEdit }) {
    const selected = TYPE_META[data.type] ?? {}

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
                <Label>Tax Rate Name *</Label>
                <Input value={data.name} onChange={e => setData('name', e.target.value)}
                    placeholder="e.g. GST 18%, TDS @ 10%" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Type + Rate side by side */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Tax Type *</Label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                        {Object.entries(TYPE_META).map(([k, v]) => (
                            <option key={k} value={k}>{v.label} — {v.desc}</option>
                        ))}
                    </select>
                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Rate (%) *</Label>
                    <div className="relative">
                        <Input type="number" step="0.01" min="0" max="100"
                            value={data.rate} onChange={e => setData('rate', e.target.value)}
                            className="pr-10" placeholder="0.00" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                    </div>
                    {errors.rate && <p className="text-xs text-destructive">{errors.rate}</p>}
                </div>
            </div>

            {/* Type info hint */}
            {selected.desc && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span><strong>{selected.label}:</strong> {selected.desc}</span>
                </div>
            )}

            {/* HSN / SAC Code */}
            <div className="space-y-1.5">
                <Label>HSN / SAC Code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={data.hsn_sac_code} onChange={e => setData('hsn_sac_code', e.target.value)}
                    placeholder="e.g. 9983, 8471" className="font-mono" />
                <p className="text-xs text-muted-foreground">Harmonised System / Service Accounting Code for GST filing</p>
            </div>

            {/* GST components auto-fill hint */}
            {(data.type === 'gst') && data.rate && (
                <div className="rounded-lg border border-dashed p-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">GST Component Breakdown</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 rounded bg-indigo-50 dark:bg-indigo-900/20">
                            <p className="text-indigo-600 dark:text-indigo-300 font-semibold">CGST</p>
                            <p className="font-bold">{(parseFloat(data.rate || 0) / 2).toFixed(2)}%</p>
                        </div>
                        <div className="text-center p-2 rounded bg-violet-50 dark:bg-violet-900/20">
                            <p className="text-violet-600 dark:text-violet-300 font-semibold">SGST</p>
                            <p className="font-bold">{(parseFloat(data.rate || 0) / 2).toFixed(2)}%</p>
                        </div>
                        <div className="text-center p-2 rounded bg-purple-50 dark:bg-purple-900/20">
                            <p className="text-purple-600 dark:text-purple-300 font-semibold">IGST</p>
                            <p className="font-bold">{parseFloat(data.rate || 0).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center gap-3 pt-1">
                <Switch id="is_active" checked={data.is_active} onCheckedChange={v => setData('is_active', v)} />
                <Label htmlFor="is_active">Active — available for invoices and expenses</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={processing}>
                    {isEdit ? 'Save Changes' : 'Create Tax Rate'}
                </Button>
            </div>
        </form>
    )
}

export default function TaxSettings({ taxRates = [] }) {
    const [createOpen, setCreateOpen] = useState(false)
    const [editRate, setEditRate]     = useState(null)
    const [deleteRate, setDeleteRate] = useState(null)

    const createForm = useForm({ ...emptyForm })
    const editForm   = useForm({ ...emptyForm })

    function openCreate() { createForm.reset(); setCreateOpen(true) }
    function openEdit(tr) {
        editForm.setData({
            name:         tr.name,
            type:         tr.type?.toLowerCase() ?? 'gst',
            rate:         tr.rate,
            hsn_sac_code: tr.hsn_sac_code ?? '',
            is_active:    tr.is_active,
        })
        setEditRate(tr)
    }

    function submitCreate(e) {
        e.preventDefault()
        createForm.post('/tax/rates', { onSuccess: () => { setCreateOpen(false); createForm.reset() } })
    }

    function submitEdit(e) {
        e.preventDefault()
        editForm.put(`/tax/rates/${editRate.id}`, { onSuccess: () => setEditRate(null) })
    }

    function confirmDelete() {
        router.delete(`/tax/rates/${deleteRate.id}`, { onSuccess: () => setDeleteRate(null) })
    }

    function toggleActive(tr) {
        router.post(`/tax/rates/${tr.id}/toggle`)
    }

    // Group by type for display
    const grouped = taxRates.reduce((acc, tr) => {
        const t = tr.type?.toLowerCase() ?? 'other'
        if (!acc[t]) acc[t] = []
        acc[t].push(tr)
        return acc
    }, {})

    const typeOrder = ['gst', 'cgst', 'sgst', 'igst', 'tds', 'tcs']
    const sortedTypes = [...typeOrder.filter(t => grouped[t]),
                         ...Object.keys(grouped).filter(t => !typeOrder.includes(t))]

    const activeCount   = taxRates.filter(t => t.is_active).length
    const inactiveCount = taxRates.length - activeCount

    return (
        <AppLayout>
            <Head title="Tax Settings" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tax Settings</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Configure GST, TDS, TCS and other tax rates</p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" /> Add Tax Rate
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Rates',    value: taxRates.length,  color: 'text-foreground',    icon: Calculator, bg: 'bg-muted/40' },
                        { label: 'Active',         value: activeCount,       color: 'text-green-600',     icon: Calculator, bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Inactive',       value: inactiveCount,     color: 'text-muted-foreground', icon: Calculator, bg: 'bg-muted/40' },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className={cn('flex items-center gap-4 pt-4 pb-4 rounded-xl', s.bg)}>
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                                    <s.icon className={cn('w-5 h-5', s.color)} />
                                </div>
                                <div>
                                    <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Grouped tables */}
                {taxRates.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Calculator className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="font-medium">No tax rates configured</p>
                            <p className="text-sm text-muted-foreground mt-1">Add GST, TDS, or other tax rates to use them on invoices.</p>
                            <Button className="mt-4" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add First Rate</Button>
                        </CardContent>
                    </Card>
                ) : sortedTypes.map(type => {
                    const meta = TYPE_META[type] ?? { label: type.toUpperCase(), color: 'bg-muted text-muted-foreground', desc: '' }
                    const rates = grouped[type] ?? []
                    return (
                        <Card key={type}>
                            <CardHeader className="pb-0">
                                <div className="flex items-center gap-3">
                                    <TypeBadge type={type} />
                                    <CardTitle className="text-base">{meta.label} Rates</CardTitle>
                                    <span className="text-xs text-muted-foreground">— {meta.desc}</span>
                                    <Badge variant="outline" className="ml-auto text-xs">{rates.length} rate{rates.length !== 1 ? 's' : ''}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 mt-3">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                                            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Rate</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">HSN / SAC</th>
                                            {type === 'gst' && (
                                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Components</th>
                                            )}
                                            <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Active</th>
                                            <th className="px-4 py-2.5" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rates.map(tr => (
                                            <tr key={tr.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-medium">{tr.name}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-mono font-bold text-base">{parseFloat(tr.rate).toFixed(2)}<span className="text-muted-foreground text-xs font-normal ml-0.5">%</span></span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                    {tr.hsn_sac_code || '—'}
                                                </td>
                                                {type === 'gst' && (
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-mono">
                                                                C {(parseFloat(tr.rate) / 2).toFixed(2)}%
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 font-mono">
                                                                S {(parseFloat(tr.rate) / 2).toFixed(2)}%
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 font-mono">
                                                                I {parseFloat(tr.rate).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    <Switch
                                                        checked={tr.is_active}
                                                        onCheckedChange={() => toggleActive(tr)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"
                                                            onClick={() => openEdit(tr)}>
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() => setDeleteRate(tr)}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Add Tax Rate
                        </DialogTitle>
                    </DialogHeader>
                    <TaxRateForm
                        data={createForm.data} setData={createForm.setData}
                        errors={createForm.errors} processing={createForm.processing}
                        onSubmit={submitCreate} onClose={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editRate} onOpenChange={o => !o && setEditRate(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit — {editRate?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <TaxRateForm isEdit
                        data={editForm.data} setData={editForm.setData}
                        errors={editForm.errors} processing={editForm.processing}
                        onSubmit={submitEdit} onClose={() => setEditRate(null)} />
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteRate}
                onOpenChange={o => !o && setDeleteRate(null)}
                title="Delete Tax Rate"
                description={`Delete "${deleteRate?.name}"? This cannot be undone. Existing invoices using this rate will not be affected.`}
                onConfirm={confirmDelete}
                confirmLabel="Delete"
                variant="destructive"
            />
        </AppLayout>
    )
}
