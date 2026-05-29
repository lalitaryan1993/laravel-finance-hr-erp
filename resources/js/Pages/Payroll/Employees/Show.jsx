import { useMemo, useState } from 'react'
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
    ArrowLeft, Briefcase, CalendarCheck, FileText, GraduationCap, HeartPulse,
    Laptop, Pencil, Plus, StickyNote, UserRound,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant = { active: 'success', inactive: 'secondary', terminated: 'destructive' }

const formDefaults = {
    contact: { name: '', relationship: '', phone: '', alternate_phone: '', email: '', address: '', is_primary: false },
    document: { document_type: 'pan', document_number: '', issue_date: '', expiry_date: '', status: 'pending', notes: '' },
    education: { qualification: '', institution: '', field_of_study: '', start_year: '', end_year: '', grade: '', notes: '' },
    experience: { employer_name: '', job_title: '', start_date: '', end_date: '', location: '', responsibilities: '', last_salary: '', reason_for_leaving: '' },
    dependent: { name: '', relationship: '', date_of_birth: '', phone: '', is_nominee: false, notes: '' },
    asset: { asset_name: '', asset_code: '', category: '', issued_on: '', return_due_on: '', returned_on: '', condition_issued: '', condition_returned: '', status: 'issued', notes: '' },
    lifecycle: { type: 'onboarding', title: '', description: '', due_date: '', status: 'pending', sort_order: 0 },
    note: { note_type: 'general', body: '', visibility: 'internal' },
}

const routeFor = (employeeId, type) => ({
    contact: `/payroll/employees/${employeeId}/emergency-contacts`,
    document: `/payroll/employees/${employeeId}/documents`,
    education: `/payroll/employees/${employeeId}/educations`,
    experience: `/payroll/employees/${employeeId}/experiences`,
    dependent: `/payroll/employees/${employeeId}/dependents`,
    asset: `/payroll/employees/${employeeId}/assets`,
    lifecycle: `/payroll/employees/${employeeId}/lifecycle-tasks`,
    note: `/payroll/employees/${employeeId}/notes`,
}[type])

function InfoRow({ label, value, mono = false }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm text-right ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    )
}

function EmptyState({ icon: Icon, title, action, onClick }) {
    return (
        <div className="py-10 text-center text-muted-foreground">
            <Icon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-foreground">{title}</p>
            {action && <Button size="sm" variant="outline" className="mt-3" onClick={onClick}><Plus className="h-4 w-4 mr-1.5" />{action}</Button>}
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
            {action && <Button size="sm" variant="outline" onClick={onClick}><Plus className="h-4 w-4 mr-1.5" />{action}</Button>}
        </CardHeader>
    )
}

function AddRecordDialog({ employeeId, type, open, onOpenChange, options }) {
    const defaults = formDefaults[type] ?? {}
    const { data, setData, post, processing, errors, reset } = useForm(defaults)

    const title = {
        contact: 'Add Emergency Contact',
        document: 'Add Document',
        education: 'Add Education',
        experience: 'Add Experience',
        dependent: 'Add Dependent',
        asset: 'Issue Asset',
        lifecycle: 'Add Lifecycle Task',
        note: 'Add HR Note',
    }[type]

    const submit = (e) => {
        e.preventDefault()
        post(routeFor(employeeId, type), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                onOpenChange(false)
            },
        })
    }

    const Field = ({ name, label, type: inputType = 'text', required = false, children }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium">{label}{required && ' *'}</label>
            {children ?? <Input type={inputType} value={data[name] ?? ''} onChange={(e) => setData(name, e.target.value)} />}
            {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    {type === 'contact' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="name" label="Name" required />
                            <Field name="relationship" label="Relationship" required />
                            <Field name="phone" label="Phone" required />
                            <Field name="alternate_phone" label="Alternate Phone" />
                            <Field name="email" label="Email" type="email" />
                            <Field name="address" label="Address" />
                            <label className="col-span-2 flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={!!data.is_primary} onChange={(e) => setData('is_primary', e.target.checked)} />
                                Primary emergency contact
                            </label>
                        </div>
                    )}

                    {type === 'document' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="document_type" label="Document Type" required>
                                <select value={data.document_type} onChange={(e) => setData('document_type', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {(options.documentTypes ?? []).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                </select>
                            </Field>
                            <Field name="document_number" label="Document Number" />
                            <Field name="issue_date" label="Issue Date" type="date" />
                            <Field name="expiry_date" label="Expiry Date" type="date" />
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {['pending', 'verified', 'rejected', 'expired'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field name="notes" label="Notes" />
                        </div>
                    )}

                    {type === 'education' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="qualification" label="Qualification" required />
                            <Field name="institution" label="Institution" />
                            <Field name="field_of_study" label="Field of Study" />
                            <Field name="grade" label="Grade" />
                            <Field name="start_year" label="Start Year" type="number" />
                            <Field name="end_year" label="End Year" type="number" />
                            <div className="col-span-2"><Field name="notes" label="Notes" /></div>
                        </div>
                    )}

                    {type === 'experience' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="employer_name" label="Employer" required />
                            <Field name="job_title" label="Job Title" />
                            <Field name="start_date" label="Start Date" type="date" />
                            <Field name="end_date" label="End Date" type="date" />
                            <Field name="location" label="Location" />
                            <Field name="last_salary" label="Last Salary" type="number" />
                            <div className="col-span-2"><Field name="responsibilities" label="Responsibilities" /></div>
                            <div className="col-span-2"><Field name="reason_for_leaving" label="Reason for Leaving" /></div>
                        </div>
                    )}

                    {type === 'dependent' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="name" label="Name" required />
                            <Field name="relationship" label="Relationship" required />
                            <Field name="date_of_birth" label="Date of Birth" type="date" />
                            <Field name="phone" label="Phone" />
                            <div className="col-span-2"><Field name="notes" label="Notes" /></div>
                            <label className="col-span-2 flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={!!data.is_nominee} onChange={(e) => setData('is_nominee', e.target.checked)} />
                                Mark as nominee
                            </label>
                        </div>
                    )}

                    {type === 'asset' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="asset_name" label="Asset Name" required />
                            <Field name="asset_code" label="Asset Code" />
                            <Field name="category" label="Category" />
                            <Field name="issued_on" label="Issued On" type="date" />
                            <Field name="return_due_on" label="Return Due" type="date" />
                            <Field name="returned_on" label="Returned On" type="date" />
                            <Field name="condition_issued" label="Condition Issued" />
                            <Field name="condition_returned" label="Condition Returned" />
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {(options.assetStatuses ?? []).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field name="notes" label="Notes" />
                        </div>
                    )}

                    {type === 'lifecycle' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="type" label="Type">
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {(options.lifecycleTypes ?? []).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field name="status" label="Status">
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {['pending', 'in_progress', 'completed', 'skipped'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field name="title" label="Title" required />
                            <Field name="due_date" label="Due Date" type="date" />
                            <Field name="sort_order" label="Sort Order" type="number" />
                            <div className="col-span-2"><Field name="description" label="Description" /></div>
                        </div>
                    )}

                    {type === 'note' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field name="note_type" label="Note Type" />
                            <Field name="visibility" label="Visibility">
                                <select value={data.visibility} onChange={(e) => setData('visibility', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {['internal', 'manager', 'employee'].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </Field>
                            <div className="col-span-2"><Field name="body" label="Note" required /></div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" loading={processing}>Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function EmployeeShow({ employee, hrOptions = {} }) {
    const [dialogType, setDialogType] = useState(null)
    const payslips = employee.payslips ?? []
    const docs = employee.documents ?? []
    const contacts = employee.emergency_contacts ?? []
    const assets = employee.assigned_assets ?? []
    const tasks = employee.lifecycle_tasks ?? []
    const notes = employee.notes ?? []
    const dept = employee.department ?? {}
    const structure = employee.salary_structure ?? {}

    const taskStats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
    }), [tasks])

    return (
        <AppLayout>
            <Head title={employee.full_name ?? `${employee.first_name} ${employee.last_name ?? ''}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/payroll/employees')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{employee.full_name ?? `${employee.first_name} ${employee.last_name ?? ''}`}</h1>
                        <p className="text-muted-foreground text-sm">{employee.designation ?? 'Employee'} | {dept.name ?? '-'}</p>
                    </div>
                    <Badge variant={statusVariant[employee.status] ?? 'secondary'} className="capitalize">{employee.status}</Badge>
                    <Button variant="outline" onClick={() => router.visit(`/payroll/employees/${employee.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Employee Code</p><p className="text-xl font-bold font-mono">{employee.employee_code ?? '-'}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Basic Salary</p><p className="text-xl font-bold font-mono">{formatCurrency(employee.basic_salary)}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Documents</p><p className="text-xl font-bold">{docs.length}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lifecycle</p><p className="text-xl font-bold">{taskStats.completed}/{taskStats.total}</p></CardContent></Card>
                </div>

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
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Identity" icon={UserRound} />
                                <CardContent>
                                    <InfoRow label="Email" value={employee.email} />
                                    <InfoRow label="Phone" value={employee.phone} />
                                    <InfoRow label="Personal Email" value={employee.personal_email} />
                                    <InfoRow label="PAN" value={employee.pan_number} mono />
                                    <InfoRow label="Aadhaar" value={employee.aadhar_number} mono />
                                </CardContent>
                            </Card>
                            <Card>
                                <SectionHeader title="Job Snapshot" icon={Briefcase} />
                                <CardContent>
                                    <InfoRow label="Department" value={dept.name} />
                                    <InfoRow label="Manager" value={employee.reporting_manager?.full_name ?? employee.reporting_manager?.first_name} />
                                    <InfoRow label="Employment Type" value={employee.employment_type?.replace('_', ' ')} />
                                    <InfoRow label="Work Location" value={employee.work_location} />
                                    <InfoRow label="Joining Date" value={formatDate(employee.date_of_joining)} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="personal">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Personal Details" icon={HeartPulse} />
                                <CardContent>
                                    <InfoRow label="Gender" value={employee.gender} />
                                    <InfoRow label="Marital Status" value={employee.marital_status} />
                                    <InfoRow label="Blood Group" value={employee.blood_group} />
                                    <InfoRow label="Current Address" value={employee.current_address} />
                                    <InfoRow label="Permanent Address" value={employee.permanent_address} />
                                </CardContent>
                            </Card>
                            <Card>
                                <SectionHeader title="Emergency Contacts" icon={UserRound} action="Add Contact" onClick={() => setDialogType('contact')} />
                                <CardContent>
                                    {contacts.length === 0 ? <EmptyState icon={UserRound} title="No emergency contacts" action="Add Contact" onClick={() => setDialogType('contact')} /> : (
                                        <div className="space-y-3">
                                            {contacts.map(c => (
                                                <div key={c.id} className="rounded-md border p-3">
                                                    <div className="flex items-center justify-between"><p className="font-medium">{c.name}</p>{c.is_primary && <Badge variant="success">Primary</Badge>}</div>
                                                    <p className="text-sm text-muted-foreground">{c.relationship} | {c.phone}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-2">
                                <SectionHeader title="Dependents" icon={HeartPulse} action="Add Dependent" onClick={() => setDialogType('dependent')} />
                                <CardContent>
                                    {(employee.dependents ?? []).length === 0 ? <EmptyState icon={HeartPulse} title="No dependents recorded" action="Add Dependent" onClick={() => setDialogType('dependent')} /> : (
                                        <Table><TableBody>{employee.dependents.map(d => <TableRow key={d.id}><TableCell>{d.name}</TableCell><TableCell>{d.relationship}</TableCell><TableCell>{formatDate(d.date_of_birth)}</TableCell><TableCell>{d.is_nominee ? 'Nominee' : '-'}</TableCell></TableRow>)}</TableBody></Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="job">
                        <Card>
                            <SectionHeader title="Job & Reporting" icon={Briefcase} />
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <InfoRow label="Department" value={dept.name} />
                                <InfoRow label="Designation" value={employee.designation} />
                                <InfoRow label="Reporting Manager" value={employee.reporting_manager?.full_name ?? employee.reporting_manager?.first_name} />
                                <InfoRow label="Work Location" value={employee.work_location} />
                                <InfoRow label="Probation End" value={formatDate(employee.probation_end_date)} />
                                <InfoRow label="Confirmation Date" value={formatDate(employee.confirmation_date)} />
                                <InfoRow label="Notice Period" value={employee.notice_period_days ? `${employee.notice_period_days} days` : '-'} />
                                <InfoRow label="Exit Date" value={formatDate(employee.exit_date)} />
                                <InfoRow label="Exit Reason" value={employee.exit_reason} />
                                <InfoRow label="Rehire Eligible" value={employee.rehire_eligible ? 'Yes' : 'No'} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card>
                            <SectionHeader title="Documents" icon={FileText} action="Add Document" onClick={() => setDialogType('document')} />
                            <CardContent className="p-0">
                                {docs.length === 0 ? <EmptyState icon={FileText} title="No documents uploaded" action="Add Document" onClick={() => setDialogType('document')} /> : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Number</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                        <TableBody>{docs.map(d => <TableRow key={d.id}><TableCell className="capitalize">{d.document_type?.replace('_', ' ')}</TableCell><TableCell className="font-mono">{d.document_number ?? '-'}</TableCell><TableCell>{formatDate(d.expiry_date)}</TableCell><TableCell><Badge variant={d.status === 'verified' ? 'success' : 'secondary'}>{d.status}</Badge></TableCell></TableRow>)}</TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <SectionHeader title="Education" icon={GraduationCap} action="Add Education" onClick={() => setDialogType('education')} />
                                <CardContent>
                                    {(employee.educations ?? []).length === 0 ? <EmptyState icon={GraduationCap} title="No education records" action="Add Education" onClick={() => setDialogType('education')} /> : employee.educations.map(e => <div key={e.id} className="border-b py-3 last:border-0"><p className="font-medium">{e.qualification}</p><p className="text-sm text-muted-foreground">{e.institution} | {e.field_of_study}</p></div>)}
                                </CardContent>
                            </Card>
                            <Card>
                                <SectionHeader title="Experience" icon={Briefcase} action="Add Experience" onClick={() => setDialogType('experience')} />
                                <CardContent>
                                    {(employee.experiences ?? []).length === 0 ? <EmptyState icon={Briefcase} title="No previous employment" action="Add Experience" onClick={() => setDialogType('experience')} /> : employee.experiences.map(e => <div key={e.id} className="border-b py-3 last:border-0"><p className="font-medium">{e.employer_name}</p><p className="text-sm text-muted-foreground">{e.job_title} | {formatDate(e.start_date)} - {formatDate(e.end_date)}</p></div>)}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="assets">
                        <Card>
                            <SectionHeader title="Issued Assets" icon={Laptop} action="Issue Asset" onClick={() => setDialogType('asset')} />
                            <CardContent className="p-0">
                                {assets.length === 0 ? <EmptyState icon={Laptop} title="No company assets issued" action="Issue Asset" onClick={() => setDialogType('asset')} /> : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Code</TableHead><TableHead>Issued</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                        <TableBody>{assets.map(a => <TableRow key={a.id}><TableCell>{a.asset_name}</TableCell><TableCell className="font-mono">{a.asset_code ?? '-'}</TableCell><TableCell>{formatDate(a.issued_on)}</TableCell><TableCell><Badge variant={a.status === 'issued' ? 'success' : 'secondary'}>{a.status}</Badge></TableCell></TableRow>)}</TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lifecycle">
                        <Card>
                            <SectionHeader title="Onboarding / Offboarding" icon={CalendarCheck} action="Add Task" onClick={() => setDialogType('lifecycle')} />
                            <CardContent>
                                {tasks.length === 0 ? <EmptyState icon={CalendarCheck} title="No lifecycle tasks" action="Add Task" onClick={() => setDialogType('lifecycle')} /> : (
                                    <div className="space-y-3">
                                        {tasks.map(t => <div key={t.id} className="flex items-center justify-between rounded-md border p-3"><div><p className="font-medium">{t.title}</p><p className="text-sm text-muted-foreground">{t.type} | due {formatDate(t.due_date)}</p></div><Badge variant={t.status === 'completed' ? 'success' : 'secondary'}>{t.status}</Badge></div>)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payroll">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Salary Structure</div><div className="text-xl font-semibold mt-1">{structure.name ?? '-'}</div></CardContent></Card>
                            <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Basic Salary</div><div className="text-xl font-bold font-mono mt-1">{formatCurrency(employee.basic_salary)}</div></CardContent></Card>
                            <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Tax Regime</div><div className="text-xl font-semibold capitalize mt-1">{employee.tax_regime ?? '-'}</div></CardContent></Card>
                        </div>
                        <Card>
                            <SectionHeader title="Recent Payslips" icon={FileText} />
                            <CardContent className="p-0">
                                {payslips.length === 0 ? <EmptyState icon={FileText} title="No payslips yet" /> : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Deductions</TableHead><TableHead className="text-right">Net Pay</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                        <TableBody>{payslips.map(slip => <TableRow key={slip.id}><TableCell className="font-mono">{slip.month}</TableCell><TableCell className="text-right font-mono">{formatCurrency(slip.gross_earnings)}</TableCell><TableCell className="text-right font-mono text-red-500">{formatCurrency(slip.total_deductions)}</TableCell><TableCell className="text-right font-mono font-bold text-green-600">{formatCurrency(slip.net_pay)}</TableCell><TableCell><Badge variant="secondary">{slip.status}</Badge></TableCell></TableRow>)}</TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notes">
                        <Card>
                            <SectionHeader title="HR Notes" icon={StickyNote} action="Add Note" onClick={() => setDialogType('note')} />
                            <CardContent>
                                {notes.length === 0 ? <EmptyState icon={StickyNote} title="No HR notes" action="Add Note" onClick={() => setDialogType('note')} /> : (
                                    <div className="space-y-3">{notes.map(n => <div key={n.id} className="rounded-md border p-3"><div className="flex items-center justify-between"><p className="font-medium capitalize">{n.note_type}</p><Badge variant="outline">{n.visibility}</Badge></div><p className="text-sm mt-2">{n.body}</p><p className="text-xs text-muted-foreground mt-2">{n.author?.name ?? 'HR'} | {formatDate(n.created_at)}</p></div>)}</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {dialogType && (
                <AddRecordDialog
                    employeeId={employee.id}
                    type={dialogType}
                    open={!!dialogType}
                    onOpenChange={(open) => !open && setDialogType(null)}
                    options={hrOptions}
                />
            )}
        </AppLayout>
    )
}

