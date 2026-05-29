import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    ArrowLeft, Briefcase, CalendarCheck, Camera, CheckCircle2, ExternalLink,
    FileText, GraduationCap, HeartPulse, KeyRound, Laptop, Link2, Link2Off,
    Pencil, Plus, StickyNote, Trash2, UserCheck, UserRound,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant = { active: 'success', inactive: 'secondary', terminated: 'destructive' }
const taskVariant = { pending: 'secondary', in_progress: 'warning', completed: 'success', skipped: 'outline' }

const formDefaults = {
    contact:    { name: '', relationship: '', phone: '', alternate_phone: '', email: '', address: '', is_primary: false },
    document:   { document_type: 'pan', document_number: '', issue_date: '', expiry_date: '', status: 'pending', notes: '', file: null },
    education:  { qualification: '', institution: '', field_of_study: '', start_year: '', end_year: '', grade: '', notes: '' },
    experience: { employer_name: '', job_title: '', start_date: '', end_date: '', location: '', responsibilities: '', last_salary: '', reason_for_leaving: '' },
    dependent:  { name: '', relationship: '', date_of_birth: '', phone: '', is_nominee: false, notes: '' },
    asset:      { asset_name: '', asset_code: '', category: '', issued_on: '', return_due_on: '', returned_on: '', condition_issued: '', condition_returned: '', status: 'issued', notes: '' },
    lifecycle:  { type: 'onboarding', title: '', description: '', due_date: '', status: 'pending', sort_order: 0 },
    note:       { note_type: 'general', body: '', visibility: 'internal' },
}

const routeFor = (employeeId, type) => ({
    contact:    `/payroll/employees/${employeeId}/emergency-contacts`,
    document:   `/payroll/employees/${employeeId}/documents`,
    education:  `/payroll/employees/${employeeId}/educations`,
    experience: `/payroll/employees/${employeeId}/experiences`,
    dependent:  `/payroll/employees/${employeeId}/dependents`,
    asset:      `/payroll/employees/${employeeId}/assets`,
    lifecycle:  `/payroll/employees/${employeeId}/lifecycle-tasks`,
    note:       `/payroll/employees/${employeeId}/notes`,
}[type])

function getInitData(type, record) {
    const defaults = { ...formDefaults[type] }
    if (!record) return defaults
    const data = {}
    for (const key of Object.keys(defaults)) {
        data[key] = record[key] !== undefined ? record[key] : defaults[key]
    }
    if (type === 'document') data.file = null
    return data
}

function InfoRow({ label, value, mono = false }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2 last:border-0">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
            <span className={`text-sm text-right break-words max-w-xs ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    )
}

function EmptyState({ icon: Icon, title, action, onClick }) {
    return (
        <div className="py-10 text-center text-muted-foreground">
            <Icon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-foreground">{title}</p>
            {action && (
                <Button size="sm" variant="outline" className="mt-3" onClick={onClick}>
                    <Plus className="h-4 w-4 mr-1.5" />{action}
                </Button>
            )}
        </div>
    )
}

function SectionHeader({ title, icon: Icon, action, onClick }) {
    return (
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {title}
            </CardTitle>
            {action && (
                <Button size="sm" variant="outline" onClick={onClick}>
                    <Plus className="h-4 w-4 mr-1.5" />{action}
                </Button>
            )}
        </CardHeader>
    )
}

const selCls = 'w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
const taCls  = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-y'

/* Context so Field can read form state without being defined inside RecordDialog.
   Defining Field inside RecordDialog gives it a new reference each render,
   which makes React unmount+remount the input on every keystroke (focus lost). */
const FieldCtx = createContext(null)

function Field({ name, label, inputType = 'text', required = false, children }) {
    const { data, setData, errors } = useContext(FieldCtx)
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium">
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            {children ?? (
                <Input type={inputType} value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} />
            )}
            {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
        </div>
    )
}

function RecordDialog({ employeeId, type, record, open, onOpenChange, options }) {
    const isEdit = !!record
    const { data, setData, post, put, processing, errors, reset } = useForm(getInitData(type, record))

    const dialogTitle = {
        contact:    isEdit ? 'Edit Emergency Contact'  : 'Add Emergency Contact',
        document:   isEdit ? 'Edit Document'            : 'Add Document',
        education:  isEdit ? 'Edit Education'           : 'Add Education',
        experience: isEdit ? 'Edit Work Experience'     : 'Add Work Experience',
        dependent:  isEdit ? 'Edit Dependent'           : 'Add Dependent',
        asset:      isEdit ? 'Edit Asset'               : 'Issue Asset',
        lifecycle:  isEdit ? 'Edit Task'                : 'Add Lifecycle Task',
        note:       isEdit ? 'Edit HR Note'             : 'Add HR Note',
    }[type]

    const submit = (e) => {
        e.preventDefault()
        const base = routeFor(employeeId, type)
        const url  = isEdit ? `${base}/${record.id}` : base
        const opts = {
            preserveScroll: true,
            forceFormData:  type === 'document',
            onSuccess: () => { reset(); onOpenChange(false) },
        }
        isEdit ? put(url, opts) : post(url, opts)
    }

    return (
        <FieldCtx.Provider value={{ data, setData, errors }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-2">

                    {type === 'contact' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="name"            label="Name"            required />
                            <Field name="relationship"    label="Relationship"    required />
                            <Field name="phone"           label="Phone"           required />
                            <Field name="alternate_phone" label="Alternate Phone" />
                            <Field name="email"           label="Email"           inputType="email" />
                            <Field name="address"         label="Address" />
                            <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={!!data.is_primary}
                                    onChange={(e) => setData('is_primary', e.target.checked)} className="rounded" />
                                Primary emergency contact
                            </label>
                        </div>
                    )}

                    {type === 'document' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="document_type" label="Document Type" required>
                                <select value={data.document_type} onChange={(e) => setData('document_type', e.target.value)} className={selCls}>
                                    {(options.documentTypes ?? []).map(t => (
                                        <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field name="document_number" label="Document Number" />
                            <Field name="issue_date"  label="Issue Date"  inputType="date" />
                            <Field name="expiry_date" label="Expiry Date" inputType="date" />
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={selCls}>
                                    {['pending', 'verified', 'rejected', 'expired'].map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field name="notes" label="Notes" />
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">
                                    {isEdit ? 'Replace File' : 'Upload File'}
                                    <span className="text-muted-foreground text-xs ml-2">(PDF, JPG, PNG, DOC — max 5 MB)</span>
                                </label>
                                {isEdit && record.file_path && (
                                    <a href={`/storage/${record.file_path}`} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-2">
                                        <ExternalLink className="h-3.5 w-3.5" /> View current file
                                    </a>
                                )}
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => setData('file', e.target.files[0] ?? null)}
                                    className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer" />
                                {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
                            </div>
                        </div>
                    )}

                    {type === 'education' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="qualification"  label="Qualification"  required />
                            <Field name="institution"    label="Institution" />
                            <Field name="field_of_study" label="Field of Study" />
                            <Field name="grade"          label="Grade / Percentage" />
                            <Field name="start_year"     label="Start Year"  inputType="number" />
                            <Field name="end_year"       label="End Year"    inputType="number" />
                            <div className="col-span-2">
                                <Field name="notes" label="Notes">
                                    <textarea className={taCls} value={data.notes ?? ''}
                                        onChange={(e) => setData('notes', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {type === 'experience' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="employer_name" label="Employer"   required />
                            <Field name="job_title"     label="Job Title" />
                            <Field name="start_date"    label="Start Date" inputType="date" />
                            <Field name="end_date"      label="End Date"   inputType="date" />
                            <Field name="location"      label="Location" />
                            <Field name="last_salary"   label="Last Salary" inputType="number" />
                            <div className="col-span-2">
                                <Field name="responsibilities" label="Responsibilities">
                                    <textarea className={taCls} value={data.responsibilities ?? ''}
                                        onChange={(e) => setData('responsibilities', e.target.value)} />
                                </Field>
                            </div>
                            <div className="col-span-2">
                                <Field name="reason_for_leaving" label="Reason for Leaving">
                                    <textarea className={`${taCls} min-h-[60px]`} value={data.reason_for_leaving ?? ''}
                                        onChange={(e) => setData('reason_for_leaving', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {type === 'dependent' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="name"          label="Name"          required />
                            <Field name="relationship"  label="Relationship"  required />
                            <Field name="date_of_birth" label="Date of Birth" inputType="date" />
                            <Field name="phone"         label="Phone" />
                            <div className="col-span-2">
                                <Field name="notes" label="Notes">
                                    <textarea className={`${taCls} min-h-[60px]`} value={data.notes ?? ''}
                                        onChange={(e) => setData('notes', e.target.value)} />
                                </Field>
                            </div>
                            <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={!!data.is_nominee}
                                    onChange={(e) => setData('is_nominee', e.target.checked)} className="rounded" />
                                Mark as nominee
                            </label>
                        </div>
                    )}

                    {type === 'asset' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="asset_name"         label="Asset Name"         required />
                            <Field name="asset_code"         label="Asset Code" />
                            <Field name="category"           label="Category" />
                            <Field name="issued_on"          label="Issued On"          inputType="date" />
                            <Field name="return_due_on"      label="Return Due"         inputType="date" />
                            <Field name="returned_on"        label="Returned On"        inputType="date" />
                            <Field name="condition_issued"   label="Condition (Issued)" />
                            <Field name="condition_returned" label="Condition (Returned)" />
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={selCls}>
                                    {(options.assetStatuses ?? []).map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="col-span-2">
                                <Field name="notes" label="Notes">
                                    <textarea className={`${taCls} min-h-[60px]`} value={data.notes ?? ''}
                                        onChange={(e) => setData('notes', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {type === 'lifecycle' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="type" label="Type">
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={selCls}>
                                    {(options.lifecycleTypes ?? []).map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={selCls}>
                                    {['pending', 'in_progress', 'completed', 'skipped'].map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field name="title"      label="Title"      required />
                            <Field name="due_date"   label="Due Date"   inputType="date" />
                            <Field name="sort_order" label="Sort Order" inputType="number" />
                            <div className="col-span-2">
                                <Field name="description" label="Description">
                                    <textarea className={taCls} value={data.description ?? ''}
                                        onChange={(e) => setData('description', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {type === 'note' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="note_type" label="Note Type">
                                <select value={data.note_type} onChange={(e) => setData('note_type', e.target.value)} className={selCls}>
                                    {['general', 'performance', 'disciplinary', 'warning', 'commendation'].map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field name="visibility" label="Visibility">
                                <select value={data.visibility} onChange={(e) => setData('visibility', e.target.value)} className={selCls}>
                                    {['internal', 'manager', 'employee'].map(v => (
                                        <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="col-span-2">
                                <Field name="body" label="Note" required>
                                    <textarea className={`${taCls} min-h-[120px]`} value={data.body ?? ''}
                                        onChange={(e) => setData('body', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : isEdit ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        </FieldCtx.Provider>
    )
}

function ActionBtns({ onEdit, onDelete }) {
    return (
        <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
}

function CreateAccountForm({ employeeId, roles, employee }) {
    const { data, setData, post, processing, errors } = useForm({
        name: `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim(),
        email: employee.email ?? '',
        password: '',
        password_confirmation: '',
        role: 'employee',
    })
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/payroll/employees/${employeeId}/account`) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
                    <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium">Role <span className="text-destructive">*</span></label>
                    <select value={data.role} onChange={(e) => setData('role', e.target.value)} className={selCls}>
                        {roles.map(r => (
                            <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                        ))}
                    </select>
                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                </div>
            </div>
            <Button type="submit" disabled={processing}>{processing ? 'Creating…' : 'Create Account'}</Button>
        </form>
    )
}

function LinkAccountForm({ employeeId }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' })
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/payroll/employees/${employeeId}/account/link`) }} className="space-y-3">
            <p className="text-sm text-muted-foreground">Link an existing user in this company by their email address.</p>
            <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                    <Input type="email" placeholder="user@company.com" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" variant="outline" disabled={processing}>{processing ? 'Linking…' : 'Link Account'}</Button>
            </div>
        </form>
    )
}

function ResetPasswordForm({ employeeId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '', password_confirmation: '' })
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/payroll/employees/${employeeId}/account/reset-password`, { onSuccess: () => reset() }) }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">New Password <span className="text-destructive">*</span></label>
                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
                    <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                </div>
            </div>
            <Button type="submit" disabled={processing}>{processing ? 'Resetting…' : 'Reset Password'}</Button>
        </form>
    )
}

export default function EmployeeShow({ employee, hrOptions = {}, roles = [] }) {
    const [dialogType, setDialogType]     = useState(null)
    const [dialogRecord, setDialogRecord] = useState(null)
    const photoRef = useRef(null)

    const uploadPhoto = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const fd = new FormData()
        fd.append('photo', file)
        router.post(`/payroll/employees/${employee.id}/photo`, fd, { preserveScroll: true })
    }

    const payslips = employee.payslips   ?? []
    const docs     = employee.documents  ?? []
    const contacts = employee.emergency_contacts ?? []
    const assets   = employee.assigned_assets    ?? []
    const tasks    = employee.lifecycle_tasks    ?? []
    const notes    = employee.notes    ?? []
    const dept     = employee.department         ?? {}
    const structure = employee.salary_structure  ?? {}

    const taskStats = useMemo(() => ({
        total:     tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
    }), [tasks])

    const openAdd  = (type)         => { setDialogRecord(null);   setDialogType(type) }
    const openEdit = (type, record) => { setDialogRecord(record); setDialogType(type) }
    const close    = ()             => { setDialogType(null); setDialogRecord(null) }

    const del = (type, id, label = 'this record') => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
        router.delete(`${routeFor(employee.id, type)}/${id}`, { preserveScroll: true })
    }

    const completeTask = (taskId) => {
        router.post(`/payroll/employees/${employee.id}/lifecycle-tasks/${taskId}/complete`, {}, { preserveScroll: true })
    }

    const fullName = `${employee.first_name} ${employee.last_name ?? ''}`.trim()

    return (
        <AppLayout>
            <Head title={fullName} />
            <div className="space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/payroll/employees')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    {/* Photo avatar */}
                    <div className="relative group cursor-pointer shrink-0" onClick={() => photoRef.current?.click()}>
                        {employee.photo ? (
                            <img src={`/storage/${employee.photo}`} alt={fullName}
                                className="h-14 w-14 rounded-full object-cover border-2 border-border" />
                        ) : (
                            <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center">
                                <span className="text-lg font-bold text-primary">
                                    {fullName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{fullName}</h1>
                        <p className="text-muted-foreground text-sm">{employee.designation ?? 'Employee'} · {dept.name ?? '-'}</p>
                    </div>
                    <Badge variant={statusVariant[employee.status] ?? 'secondary'} className="capitalize">{employee.status}</Badge>
                    <Button variant="outline" onClick={() => router.visit(`/payroll/employees/${employee.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Employee Code</p>
                        <p className="text-xl font-bold font-mono">{employee.employee_code ?? '-'}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Basic Salary</p>
                        <p className="text-xl font-bold font-mono">{formatCurrency(employee.basic_salary)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="text-xl font-bold">{docs.length}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Lifecycle</p>
                        <p className="text-xl font-bold">{taskStats.completed}/{taskStats.total}</p>
                    </CardContent></Card>
                </div>

                {/* ── Tabs ── */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="flex h-auto flex-wrap justify-start">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="job">Job</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="history">Education & Experience</TabsTrigger>
                        <TabsTrigger value="assets">Assets</TabsTrigger>
                        <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>

                    {/* ─ Overview ─ */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Identity" icon={UserRound} />
                                <CardContent>
                                    <InfoRow label="Email"          value={employee.email} />
                                    <InfoRow label="Phone"          value={employee.phone} />
                                    <InfoRow label="Personal Email" value={employee.personal_email} />
                                    <InfoRow label="PAN"            value={employee.pan_number}    mono />
                                    <InfoRow label="Aadhaar"        value={employee.aadhar_number} mono />
                                </CardContent>
                            </Card>
                            <Card>
                                <SectionHeader title="Job Snapshot" icon={Briefcase} />
                                <CardContent>
                                    <InfoRow label="Department"      value={dept.name} />
                                    <InfoRow label="Manager"         value={employee.reporting_manager
                                        ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name ?? ''}`.trim()
                                        : null} />
                                    <InfoRow label="Employment Type" value={employee.employment_type?.replace(/_/g, ' ')} />
                                    <InfoRow label="Work Location"   value={employee.work_location} />
                                    <InfoRow label="Joining Date"    value={formatDate(employee.date_of_joining)} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─ Personal ─ */}
                    <TabsContent value="personal">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Personal Details" icon={HeartPulse} />
                                <CardContent>
                                    <InfoRow label="Date of Birth"     value={formatDate(employee.date_of_birth)} />
                                    <InfoRow label="Gender"            value={employee.gender} />
                                    <InfoRow label="Marital Status"    value={employee.marital_status} />
                                    <InfoRow label="Blood Group"       value={employee.blood_group} />
                                    <InfoRow label="Current Address"   value={employee.current_address} />
                                    <InfoRow label="Permanent Address" value={employee.permanent_address} />
                                </CardContent>
                            </Card>

                            <Card>
                                <SectionHeader title="Emergency Contacts" icon={HeartPulse} action="Add Contact" onClick={() => openAdd('contact')} />
                                <CardContent>
                                    {contacts.length === 0
                                        ? <EmptyState icon={UserRound} title="No emergency contacts" action="Add Contact" onClick={() => openAdd('contact')} />
                                        : (
                                            <div className="space-y-3">
                                                {contacts.map(c => (
                                                    <div key={c.id} className="rounded-md border p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium">{c.name}</p>
                                                                <p className="text-sm text-muted-foreground">{c.relationship} · {c.phone}</p>
                                                                {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {c.is_primary && <Badge variant="success">Primary</Badge>}
                                                                <ActionBtns
                                                                    onEdit={() => openEdit('contact', c)}
                                                                    onDelete={() => del('contact', c.id, c.name)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <SectionHeader title="Dependents" icon={HeartPulse} action="Add Dependent" onClick={() => openAdd('dependent')} />
                                <CardContent className="p-0">
                                    {(employee.dependents ?? []).length === 0
                                        ? <EmptyState icon={HeartPulse} title="No dependents recorded" action="Add Dependent" onClick={() => openAdd('dependent')} />
                                        : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Relationship</TableHead>
                                                        <TableHead>Date of Birth</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>Nominee</TableHead>
                                                        <TableHead className="w-20"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {employee.dependents.map(d => (
                                                        <TableRow key={d.id}>
                                                            <TableCell className="font-medium">{d.name}</TableCell>
                                                            <TableCell>{d.relationship}</TableCell>
                                                            <TableCell>{formatDate(d.date_of_birth)}</TableCell>
                                                            <TableCell>{d.phone ?? '-'}</TableCell>
                                                            <TableCell>{d.is_nominee ? <Badge variant="success">Yes</Badge> : '-'}</TableCell>
                                                            <TableCell>
                                                                <ActionBtns
                                                                    onEdit={() => openEdit('dependent', d)}
                                                                    onDelete={() => del('dependent', d.id, d.name)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )
                                    }
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─ Job ─ */}
                    <TabsContent value="job">
                        <Card>
                            <SectionHeader title="Job & Reporting" icon={Briefcase} />
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <InfoRow label="Department"      value={dept.name} />
                                <InfoRow label="Designation"     value={employee.designation} />
                                <InfoRow label="Manager"         value={employee.reporting_manager
                                    ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name ?? ''}`.trim()
                                    : null} />
                                <InfoRow label="Work Location"   value={employee.work_location} />
                                <InfoRow label="Employment Type" value={employee.employment_type?.replace(/_/g, ' ')} />
                                <InfoRow label="Date of Joining" value={formatDate(employee.date_of_joining)} />
                                <InfoRow label="Probation End"   value={formatDate(employee.probation_end_date)} />
                                <InfoRow label="Confirmation"    value={formatDate(employee.confirmation_date)} />
                                <InfoRow label="Notice Period"   value={employee.notice_period_days ? `${employee.notice_period_days} days` : null} />
                                <InfoRow label="Exit Date"       value={formatDate(employee.exit_date)} />
                                <InfoRow label="Exit Reason"     value={employee.exit_reason} />
                                <InfoRow label="Rehire Eligible" value={employee.rehire_eligible ? 'Yes' : 'No'} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─ Documents ─ */}
                    <TabsContent value="documents">
                        <Card>
                            <SectionHeader title="Documents" icon={FileText} action="Add Document" onClick={() => openAdd('document')} />
                            <CardContent className="p-0">
                                {docs.length === 0
                                    ? <EmptyState icon={FileText} title="No documents uploaded" action="Add Document" onClick={() => openAdd('document')} />
                                    : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Number</TableHead>
                                                    <TableHead>Issue Date</TableHead>
                                                    <TableHead>Expiry</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>File</TableHead>
                                                    <TableHead className="w-20"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {docs.map(d => (
                                                    <TableRow key={d.id}>
                                                        <TableCell className="capitalize font-medium">{d.document_type?.replace(/_/g, ' ')}</TableCell>
                                                        <TableCell className="font-mono text-sm">{d.document_number ?? '-'}</TableCell>
                                                        <TableCell>{formatDate(d.issue_date)}</TableCell>
                                                        <TableCell>{formatDate(d.expiry_date)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={d.status === 'verified' ? 'success' : d.status === 'expired' ? 'destructive' : 'secondary'}>
                                                                {d.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {d.file_path
                                                                ? (
                                                                    <a href={`/storage/${d.file_path}`} target="_blank" rel="noreferrer"
                                                                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                                                        <ExternalLink className="h-3.5 w-3.5" /> View
                                                                    </a>
                                                                )
                                                                : <span className="text-muted-foreground text-xs">—</span>
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <ActionBtns
                                                                onEdit={() => openEdit('document', d)}
                                                                onDelete={() => del('document', d.id, d.document_type)}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─ Education & Experience ─ */}
                    <TabsContent value="history">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Education" icon={GraduationCap} action="Add Education" onClick={() => openAdd('education')} />
                                <CardContent className="divide-y p-0 px-6">
                                    {(employee.educations ?? []).length === 0
                                        ? <EmptyState icon={GraduationCap} title="No education records" action="Add Education" onClick={() => openAdd('education')} />
                                        : employee.educations.map(e => (
                                            <div key={e.id} className="py-3 flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium">{e.qualification}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {[e.institution, e.field_of_study].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {e.start_year}{e.end_year ? ` – ${e.end_year}` : ''}{e.grade ? ` · ${e.grade}` : ''}
                                                    </p>
                                                </div>
                                                <ActionBtns
                                                    onEdit={() => openEdit('education', e)}
                                                    onDelete={() => del('education', e.id, e.qualification)}
                                                />
                                            </div>
                                        ))
                                    }
                                </CardContent>
                            </Card>

                            <Card>
                                <SectionHeader title="Work Experience" icon={Briefcase} action="Add Experience" onClick={() => openAdd('experience')} />
                                <CardContent className="divide-y p-0 px-6">
                                    {(employee.experiences ?? []).length === 0
                                        ? <EmptyState icon={Briefcase} title="No previous employment" action="Add Experience" onClick={() => openAdd('experience')} />
                                        : employee.experiences.map(e => (
                                            <div key={e.id} className="py-3 flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium">{e.employer_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {[e.job_title, e.location].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(e.start_date)} – {e.end_date ? formatDate(e.end_date) : 'Present'}
                                                        {e.last_salary ? ` · Last: ${formatCurrency(e.last_salary)}` : ''}
                                                    </p>
                                                </div>
                                                <ActionBtns
                                                    onEdit={() => openEdit('experience', e)}
                                                    onDelete={() => del('experience', e.id, e.employer_name)}
                                                />
                                            </div>
                                        ))
                                    }
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─ Assets ─ */}
                    <TabsContent value="assets">
                        <Card>
                            <SectionHeader title="Issued Assets" icon={Laptop} action="Issue Asset" onClick={() => openAdd('asset')} />
                            <CardContent className="p-0">
                                {assets.length === 0
                                    ? <EmptyState icon={Laptop} title="No company assets issued" action="Issue Asset" onClick={() => openAdd('asset')} />
                                    : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Asset</TableHead>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Issued On</TableHead>
                                                    <TableHead>Return Due</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-20"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {assets.map(a => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">{a.asset_name}</TableCell>
                                                        <TableCell className="font-mono text-sm">{a.asset_code ?? '-'}</TableCell>
                                                        <TableCell>{a.category ?? '-'}</TableCell>
                                                        <TableCell>{formatDate(a.issued_on)}</TableCell>
                                                        <TableCell>{formatDate(a.return_due_on)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={a.status === 'issued' ? 'success' : a.status === 'lost' || a.status === 'damaged' ? 'destructive' : 'secondary'}>
                                                                {a.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <ActionBtns
                                                                onEdit={() => openEdit('asset', a)}
                                                                onDelete={() => del('asset', a.id, a.asset_name)}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─ Lifecycle ─ */}
                    <TabsContent value="lifecycle">
                        <Card>
                            <SectionHeader title="Onboarding / Offboarding Tasks" icon={CalendarCheck} action="Add Task" onClick={() => openAdd('lifecycle')} />
                            <CardContent>
                                {tasks.length === 0
                                    ? <EmptyState icon={CalendarCheck} title="No lifecycle tasks" action="Add Task" onClick={() => openAdd('lifecycle')} />
                                    : (
                                        <div className="space-y-2">
                                            {tasks.map(t => (
                                                <div key={t.id} className="flex items-center gap-3 rounded-md border p-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-medium truncate">{t.title}</p>
                                                            <Badge variant="outline" className="text-xs shrink-0">{t.type}</Badge>
                                                        </div>
                                                        {t.description && <p className="text-sm text-muted-foreground truncate">{t.description}</p>}
                                                        <p className="text-xs text-muted-foreground">Due: {formatDate(t.due_date)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Badge variant={taskVariant[t.status] ?? 'secondary'}>{t.status?.replace('_', ' ')}</Badge>
                                                        {t.status !== 'completed' && (
                                                            <Button size="sm" variant="outline"
                                                                className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                                                                onClick={() => completeTask(t.id)}>
                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                                                            </Button>
                                                        )}
                                                        <ActionBtns
                                                            onEdit={() => openEdit('lifecycle', t)}
                                                            onDelete={() => del('lifecycle', t.id, t.title)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─ Payroll ─ */}
                    <TabsContent value="payroll">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <Card><CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Salary Structure</div>
                                <div className="text-xl font-semibold mt-1">{structure.name ?? '-'}</div>
                            </CardContent></Card>
                            <Card><CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Basic Salary</div>
                                <div className="text-xl font-bold font-mono mt-1">{formatCurrency(employee.basic_salary)}</div>
                            </CardContent></Card>
                            <Card><CardContent className="p-5">
                                <div className="text-sm text-muted-foreground">Tax Regime</div>
                                <div className="text-xl font-semibold capitalize mt-1">{employee.tax_regime ?? '-'}</div>
                            </CardContent></Card>
                        </div>
                        <Card>
                            <SectionHeader title="Recent Payslips" icon={FileText} />
                            <CardContent className="p-0">
                                {payslips.length === 0
                                    ? <EmptyState icon={FileText} title="No payslips yet" />
                                    : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Month</TableHead>
                                                    <TableHead className="text-right">Gross</TableHead>
                                                    <TableHead className="text-right">Deductions</TableHead>
                                                    <TableHead className="text-right">Net Pay</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payslips.map(slip => (
                                                    <TableRow key={slip.id} className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => router.visit(`/payroll/payslips/${slip.id}/pdf`)}>
                                                        <TableCell className="font-mono">{slip.month}</TableCell>
                                                        <TableCell className="text-right font-mono">{formatCurrency(slip.gross_earnings)}</TableCell>
                                                        <TableCell className="text-right font-mono text-red-500">{formatCurrency(slip.total_deductions)}</TableCell>
                                                        <TableCell className="text-right font-mono font-bold text-green-600">{formatCurrency(slip.net_pay)}</TableCell>
                                                        <TableCell><Badge variant="secondary">{slip.status}</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─ Notes ─ */}
                    <TabsContent value="notes">
                        <Card>
                            <SectionHeader title="HR Notes" icon={StickyNote} action="Add Note" onClick={() => openAdd('note')} />
                            <CardContent>
                                {notes.length === 0
                                    ? <EmptyState icon={StickyNote} title="No HR notes" action="Add Note" onClick={() => openAdd('note')} />
                                    : (
                                        <div className="space-y-3">
                                            {notes.map(n => (
                                                <div key={n.id} className="rounded-md border p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant="outline" className="capitalize">{n.note_type?.replace('_', ' ')}</Badge>
                                                            <Badge variant="secondary" className="text-xs">{n.visibility}</Badge>
                                                        </div>
                                                        <ActionBtns
                                                            onEdit={() => openEdit('note', n)}
                                                            onDelete={() => del('note', n.id, 'this note')}
                                                        />
                                                    </div>
                                                    <p className="text-sm mt-2 leading-relaxed">{n.body}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {n.author?.name ?? 'HR'} · {formatDate(n.created_at)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* ─ Account ─ */}
                    <TabsContent value="account">
                        <div className="space-y-6 max-w-2xl">
                            {employee.user ? (
                                <>
                                    {/* Linked user details */}
                                    <Card>
                                        <SectionHeader title="Linked User Account" icon={UserCheck} />
                                        <CardContent>
                                            <InfoRow label="Name"           value={employee.user.name} />
                                            <InfoRow label="Email"          value={employee.user.email} />
                                            <InfoRow label="Last Login"     value={employee.user.last_login_at ? formatDate(employee.user.last_login_at) : 'Never'} />
                                            <InfoRow label="Email Verified" value={employee.user.email_verified_at ? 'Yes' : 'Not verified'} />
                                        </CardContent>
                                    </Card>

                                    {/* Reset password */}
                                    <Card>
                                        <SectionHeader title="Reset Password" icon={KeyRound} />
                                        <CardContent>
                                            <ResetPasswordForm employeeId={employee.id} />
                                        </CardContent>
                                    </Card>

                                    {/* Danger zone */}
                                    <Card className="border-destructive/40">
                                        <CardHeader>
                                            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">Unlink User Account</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Remove login access for this employee. The user account is not deleted.
                                                    </p>
                                                </div>
                                                <Button variant="destructive" size="sm" className="shrink-0" onClick={() => {
                                                    if (window.confirm('Unlink user account? The employee will lose login access.')) {
                                                        router.delete(`/payroll/employees/${employee.id}/account`, { preserveScroll: true })
                                                    }
                                                }}>
                                                    <Link2Off className="h-4 w-4 mr-2" /> Unlink
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <>
                                    {/* Create new account */}
                                    <Card>
                                        <SectionHeader title="Create Login Account" icon={UserCheck} />
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a new user account and link it to this employee so they can log in to the system.
                                            </p>
                                            <CreateAccountForm employeeId={employee.id} roles={roles} employee={employee} />
                                        </CardContent>
                                    </Card>

                                    {/* Link existing account */}
                                    <Card>
                                        <SectionHeader title="Link Existing Account" icon={Link2} />
                                        <CardContent>
                                            <LinkAccountForm employeeId={employee.id} />
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {dialogType && (
                <RecordDialog
                    key={`${dialogType}-${dialogRecord?.id ?? 'new'}`}
                    employeeId={employee.id}
                    type={dialogType}
                    record={dialogRecord}
                    open={!!dialogType}
                    onOpenChange={(isOpen) => { if (!isOpen) close() }}
                    options={hrOptions}
                />
            )}
        </AppLayout>
    )
}
