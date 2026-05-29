import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Building2, Users } from 'lucide-react';

function DeptForm({ values, onChange, errors }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Department Name <span className="text-destructive">*</span></Label>
                    <Input value={values.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Engineering" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Code</Label>
                    <Input value={values.code} onChange={e => onChange('code', e.target.value.toUpperCase())} placeholder="e.g. ENG" maxLength={20} />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={values.description} onChange={e => onChange('description', e.target.value)}
                    placeholder="Optional description..." rows={2} />
            </div>
            <div className="flex items-center gap-2">
                <Switch checked={values.is_active} onCheckedChange={v => onChange('is_active', v)} id="dept_active" />
                <Label htmlFor="dept_active" className="cursor-pointer">Active</Label>
            </div>
        </div>
    );
}

export default function Departments({ departments }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const emptyForm = { name: '', code: '', description: '', is_active: true };

    const createForm = useForm(emptyForm);
    const editForm   = useForm(emptyForm);

    function openEdit(dept) {
        setEditTarget(dept);
        editForm.setData({
            name:        dept.name,
            code:        dept.code ?? '',
            description: dept.description ?? '',
            is_active:   dept.is_active,
        });
    }

    function submitCreate(e) {
        e.preventDefault();
        createForm.post('/payroll/departments', {
            onSuccess: () => { setShowCreate(false); createForm.reset(); },
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/payroll/departments/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        router.delete(`/payroll/departments/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const active   = departments.filter(d => d.is_active);
    const inactive = departments.filter(d => !d.is_active);
    const total    = departments.reduce((s, d) => s + (d.total_employees ?? 0), 0);

    return (
        <AppLayout>
            <Head title="Departments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Organise your workforce by department</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                    </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Departments', value: departments.length, icon: Building2 },
                        { label: 'Active', value: active.length, icon: Building2, color: 'text-emerald-600' },
                        { label: 'Total Employees', value: total, icon: Users },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${color ?? 'text-primary'}`} />
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-2xl font-bold tabular-nums">{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Department Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {departments.map(dept => (
                        <Card key={dept.id} className={!dept.is_active ? 'opacity-60' : ''}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">{dept.name}</h3>
                                                {dept.code && (
                                                    <Badge variant="outline" className="font-mono text-xs">{dept.code}</Badge>
                                                )}
                                            </div>
                                            {dept.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{dept.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(dept)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(dept)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{dept.total_employees ?? 0} employees</span>
                                    </div>
                                    <Badge variant={dept.is_active ? 'default' : 'outline'} className="text-xs">
                                        {dept.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {departments.length === 0 && (
                        <div className="col-span-3">
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No departments yet</p>
                                    <p className="text-sm mt-1">Create your first department to get started</p>
                                    <Button className="mt-4" onClick={() => setShowCreate(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Department
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate}>
                        <div className="py-4">
                            <DeptForm values={createForm.data} onChange={(k, v) => createForm.setData(k, v)} errors={createForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="py-4">
                            <DeptForm values={editForm.data} onChange={(k, v) => editForm.setData(k, v)} errors={editForm.errors} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Delete Department?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <span className="font-semibold">{deleteTarget?.name}</span>?
                        {(deleteTarget?.total_employees ?? 0) > 0 && (
                            <span className="block mt-1 text-destructive">
                                This department has {deleteTarget.total_employees} active employees. Reassign them first.
                            </span>
                        )}
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}
                            disabled={(deleteTarget?.total_employees ?? 0) > 0}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
