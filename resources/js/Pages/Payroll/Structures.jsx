import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, Settings2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Normalise legacy seeder format { earnings:[...], deductions:[...] }
// into the flat-array format the new UI expects
function normalizeComponents(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const earnings   = (raw.earnings   ?? []).map(e => ({
        type: 'earning',   name: e.name, calc_type: e.flat !== undefined ? 'fixed' : 'percentage',
        value: e.flat ?? e.percent ?? 0, taxable: true,  is_active: true,
    }));
    const deductions = (raw.deductions ?? []).map(d => ({
        type: 'deduction', name: d.name, calc_type: d.flat !== undefined ? 'fixed' : 'percentage',
        value: d.flat ?? d.percent ?? 0, taxable: false, is_active: true,
    }));
    return [...earnings, ...deductions];
}

const EMPTY_COMPONENT = () => ({
    type: 'earning', name: '', calc_type: 'fixed', value: 0, taxable: false, is_active: true,
});

const TYPE_STYLE = {
    earning:   { chip: 'bg-emerald-100 text-emerald-700', row: 'hover:bg-emerald-50/40' },
    deduction: { chip: 'bg-red-100 text-red-700',         row: 'hover:bg-red-50/40' },
};

function ComponentRow({ comp, idx, onChange, onRemove }) {
    return (
        <tr className={cn('border-b group transition-colors', TYPE_STYLE[comp.type]?.row)}>
            <td className="px-3 py-2">
                <Select value={comp.type} onValueChange={v => onChange(idx, 'type', v)}>
                    <SelectTrigger className={cn('h-8 text-xs w-28', comp.type === 'earning' ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700')}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="earning">Earning</SelectItem>
                        <SelectItem value="deduction">Deduction</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="px-3 py-2">
                <Input className="h-8 text-xs" placeholder="e.g. Basic Salary" value={comp.name}
                    onChange={e => onChange(idx, 'name', e.target.value)} />
            </td>
            <td className="px-3 py-2">
                <Select value={comp.calc_type} onValueChange={v => onChange(idx, 'calc_type', v)}>
                    <SelectTrigger className="h-8 text-xs w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fixed">Fixed ₹</SelectItem>
                        <SelectItem value="percentage">% of Basic</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="px-3 py-2 w-28">
                <div className="relative">
                    <Input type="number" min="0" step="0.01" className="h-8 text-xs pr-6 tabular-nums"
                        value={comp.value} onChange={e => onChange(idx, 'value', e.target.value)} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] pointer-events-none font-medium">
                        {comp.calc_type === 'percentage' ? '%' : '₹'}
                    </span>
                </div>
            </td>
            <td className="px-3 py-2 text-center">
                <Switch checked={!!comp.taxable} onCheckedChange={v => onChange(idx, 'taxable', v)} />
            </td>
            <td className="px-3 py-2 text-center">
                <Switch checked={comp.is_active !== false} onCheckedChange={v => onChange(idx, 'is_active', v)} />
            </td>
            <td className="px-3 py-2 text-center">
                <Button type="button" variant="ghost" size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </td>
        </tr>
    );
}

function StructureForm({ values, setValues, errors }) {
    function updateComp(idx, field, value) {
        const components = [...values.components];
        components[idx] = { ...components[idx], [field]: value };
        setValues('components', components);
    }
    function addComp(type) {
        setValues('components', [...values.components, { ...EMPTY_COMPONENT(), type }]);
    }
    function removeComp(idx) {
        setValues('components', values.components.filter((_, i) => i !== idx));
    }

    const earnings   = values.components.filter(c => c.type === 'earning');
    const deductions = values.components.filter(c => c.type === 'deduction');

    return (
        <div className="space-y-5">
            <div className="space-y-1.5">
                <Label>Structure Name <span className="text-destructive">*</span></Label>
                <Input value={values.name} onChange={e => setValues('name', e.target.value)}
                    placeholder="e.g. Standard Monthly" className={errors.name && 'border-destructive'} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <Label>Salary Components</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {earnings.length} earning{earnings.length !== 1 ? 's' : ''} · {deductions.length} deduction{deductions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline"
                            className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => addComp('earning')}>
                            <Plus className="h-3 w-3 mr-1" /> Earning
                        </Button>
                        <Button type="button" size="sm" variant="outline"
                            className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => addComp('deduction')}>
                            <Plus className="h-3 w-3 mr-1" /> Deduction
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b">
                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Type</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Component Name</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Calculation</th>
                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-28">Value</th>
                                <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Taxable</th>
                                <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Active</th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {values.components.map((comp, idx) => (
                                <ComponentRow key={idx} comp={comp} idx={idx}
                                    onChange={updateComp} onRemove={removeComp} />
                            ))}
                        </tbody>
                    </table>
                    {values.components.length === 0 && (
                        <div className="py-10 text-center text-muted-foreground text-sm">
                            <Settings2 className="h-6 w-6 mx-auto mb-2 opacity-30" />
                            Add earnings and deductions using the buttons above
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PayrollStructures({ structures = [] }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const defaultComponents = [
        { type: 'earning',   name: 'Basic Salary',      calc_type: 'fixed',      value: 0,   taxable: true,  is_active: true },
        { type: 'earning',   name: 'HRA',               calc_type: 'percentage', value: 40,  taxable: false, is_active: true },
        { type: 'earning',   name: 'Special Allowance', calc_type: 'percentage', value: 20,  taxable: true,  is_active: true },
        { type: 'deduction', name: 'PF (Employee)',      calc_type: 'percentage', value: 12,  taxable: false, is_active: true },
        { type: 'deduction', name: 'Professional Tax',  calc_type: 'fixed',      value: 200, taxable: false, is_active: true },
    ];

    const createForm = useForm({ name: '', components: defaultComponents });
    const editForm   = useForm({ name: '', components: [] });

    function openEdit(s) {
        setEditTarget(s);
        editForm.setData({ name: s.name, components: normalizeComponents(s.components) });
    }

    function submitCreate(e) {
        e.preventDefault();
        createForm.post('/payroll/structures', {
            onSuccess: () => { setShowCreate(false); createForm.reset(); createForm.setData('components', defaultComponents); },
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/payroll/structures/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        router.delete(`/payroll/structures/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const isLegacy = s => !Array.isArray(s.components) && s.components !== null;

    return (
        <AppLayout>
            <Head title="Salary Structures" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Salary Structures</h1>
                        <p className="text-muted-foreground text-sm mt-1">Define earnings and deductions for each pay structure</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-2" /> New Structure
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Settings2 className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Structures</p>
                                <p className="text-2xl font-bold tabular-nums">{structures.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Earning Components</p>
                                <p className="text-2xl font-bold tabular-nums text-emerald-600">
                                    {structures.reduce((s, st) => s + normalizeComponents(st.components).filter(c => c.type === 'earning').length, 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Deduction Components</p>
                                <p className="text-2xl font-bold tabular-nums text-red-600">
                                    {structures.reduce((s, st) => s + normalizeComponents(st.components).filter(c => c.type === 'deduction').length, 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Structure Cards */}
                <div className="grid gap-4">
                    {structures.map(s => {
                        const comps      = normalizeComponents(s.components);
                        const earnings   = comps.filter(c => c.type === 'earning');
                        const deductions = comps.filter(c => c.type === 'deduction');
                        const legacy     = isLegacy(s);

                        return (
                            <Card key={s.id} className="overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-primary/60 to-primary/20" />
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Settings2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                                                    {legacy && (
                                                        <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                                                            <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                                            Legacy format — edit to upgrade
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Component summary row */}
                                                <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                        <TrendingUp className="h-3 w-3" /> {earnings.length} earning{earnings.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-red-500 font-medium">
                                                        <TrendingDown className="h-3 w-3" /> {deductions.length} deduction{deductions.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {/* Component chips */}
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {comps.filter(c => c.is_active !== false).slice(0, 8).map((c, i) => (
                                                        <span key={i} className={cn(
                                                            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
                                                            c.type === 'earning'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-red-100 text-red-600'
                                                        )}>
                                                            {c.name}
                                                            <span className="ml-1.5 opacity-60 font-mono">
                                                                {c.calc_type === 'percentage' ? `${c.value}%` : `₹${Number(c.value).toLocaleString()}`}
                                                            </span>
                                                        </span>
                                                    ))}
                                                    {comps.length > 8 && (
                                                        <span className="text-[11px] text-muted-foreground self-center">+{comps.length - 8} more</span>
                                                    )}
                                                    {comps.length === 0 && (
                                                        <span className="text-xs text-muted-foreground italic">No components — click Edit to add</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openEdit(s)}>
                                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeleteTarget(s)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {structures.length === 0 && (
                        <Card>
                            <CardContent className="py-20 text-center text-muted-foreground">
                                <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-semibold text-foreground">No salary structures yet</p>
                                <p className="text-sm mt-1">Create a structure to define how salaries are calculated</p>
                                <Button className="mt-5" onClick={() => setShowCreate(true)}>
                                    <Plus className="h-4 w-4 mr-2" /> Create Structure
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create Salary Structure</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate}>
                        <div className="py-4">
                            <StructureForm values={createForm.data} setValues={(k, v) => createForm.setData(k, v)} errors={createForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Create Structure</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit — {editTarget?.name}</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="py-4">
                            <StructureForm values={editForm.data} setValues={(k, v) => editForm.setData(k, v)} errors={editForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Delete Structure?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete <span className="font-semibold">{deleteTarget?.name}</span>? This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
