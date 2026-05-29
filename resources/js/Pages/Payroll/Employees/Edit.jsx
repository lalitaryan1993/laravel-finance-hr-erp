import { useRef } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowLeft, Camera, KeyRound, Link2Off, UserCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const selCls = 'w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'

function ResetPasswordInline({ employeeId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '', password_confirmation: '' })
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/payroll/employees/${employeeId}/account/reset-password`, { onSuccess: () => reset() }) }}
            className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium">New Password *</label>
                <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Min 8 characters" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Confirm Password *</label>
                <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
            </div>
            <div className="col-span-2">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing ? 'Resetting…' : 'Reset Password'}
                </Button>
            </div>
        </form>
    )
}

function CreateAccountInline({ employeeId, employee, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim(),
        email: employee.email ?? '',
        password: '',
        password_confirmation: '',
        role: 'employee',
    })
    return (
        <form onSubmit={(e) => { e.preventDefault(); post(`/payroll/employees/${employeeId}/account`) }}
            className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium">Full Name *</label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Login Email *</label>
                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Password *</label>
                <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Min 8 characters" />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Confirm Password *</label>
                <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Role</label>
                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className={selCls}>
                    {roles.map(r => (
                        <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                </select>
            </div>
            <div className="col-span-2">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing ? 'Creating…' : 'Create & Link Account'}
                </Button>
            </div>
        </form>
    )
}

export default function EmployeeEdit({ employee, departments = [], salaryStructures = [], managers = [], roles = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        first_name:           employee.first_name ?? '',
        last_name:            employee.last_name ?? '',
        email:                employee.email ?? '',
        phone:                employee.phone ?? '',
        department_id:        employee.department_id ?? '',
        salary_structure_id:  employee.salary_structure_id ?? '',
        designation:          employee.designation ?? '',
        basic_salary:         employee.basic_salary ?? '',
        status:               employee.status ?? 'active',
        date_of_joining:      employee.date_of_joining ?? '',
        date_of_birth:        employee.date_of_birth ?? '',
        bank_account_number:  employee.bank_account_number ?? '',
        bank_ifsc:            employee.bank_ifsc ?? '',
        gender:               employee.gender ?? '',
        marital_status:       employee.marital_status ?? '',
        blood_group:          employee.blood_group ?? '',
        personal_email:       employee.personal_email ?? '',
        current_address:      employee.current_address ?? '',
        permanent_address:    employee.permanent_address ?? '',
        reporting_manager_id: employee.reporting_manager_id ?? '',
        work_location:        employee.work_location ?? '',
        probation_end_date:   employee.probation_end_date ?? '',
        confirmation_date:    employee.confirmation_date ?? '',
        notice_period_days:   employee.notice_period_days ?? '',
        exit_date:            employee.exit_date ?? '',
        exit_reason:          employee.exit_reason ?? '',
        rehire_eligible:      employee.rehire_eligible ?? true,
        exit_notes:           employee.exit_notes ?? '',
    })

    const photoRef = useRef(null)

    const uploadPhoto = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const fd = new FormData()
        fd.append('photo', file)
        router.post(`/payroll/employees/${employee.id}/photo`, fd, { preserveScroll: true })
    }

    const submit = (e) => {
        e.preventDefault()
        put(`/payroll/employees/${employee.id}`)
    }

    const linkedUser = employee.user ?? null
    const fullName = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim()

    return (
        <AppLayout>
            <Head title={`Edit — ${employee.full_name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/payroll/employees/${employee.id}`)}>
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
                                    {fullName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">Edit Employee</h1>
                        <p className="text-muted-foreground text-sm">{fullName || employee.full_name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">First Name *</label>
                                <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
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
                                <label className="text-sm font-medium">Date of Joining</label>
                                <DatePicker value={data.date_of_joining} onChange={(v) => setData('date_of_joining', v)} placeholder="Select joining date" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date of Birth</label>
                                <DatePicker value={data.date_of_birth} onChange={(v) => setData('date_of_birth', v)} placeholder="Select DOB" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Department</label>
                                <select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)} className={selCls}>
                                    <option value="">Select department</option>
                                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Designation</label>
                                <Input value={data.designation} onChange={(e) => setData('designation', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Salary Structure</label>
                                <select value={data.salary_structure_id} onChange={(e) => setData('salary_structure_id', e.target.value)} className={selCls}>
                                    <option value="">Select structure</option>
                                    {salaryStructures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Basic Salary (₹)</label>
                                <Input type="number" step="0.01" min="0" value={data.basic_salary}
                                    onChange={(e) => setData('basic_salary', e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={selCls}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>HR Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Personal Email</label>
                                <Input type="email" value={data.personal_email} onChange={(e) => setData('personal_email', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Blood Group</label>
                                <Input value={data.blood_group} onChange={(e) => setData('blood_group', e.target.value.toUpperCase())} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Gender</label>
                                <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} className={selCls}>
                                    <option value="">Select gender</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="non_binary">Non-binary</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Marital Status</label>
                                <select value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)} className={selCls}>
                                    <option value="">Select status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium">Current Address</label>
                                <Input value={data.current_address} onChange={(e) => setData('current_address', e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium">Permanent Address</label>
                                <Input value={data.permanent_address} onChange={(e) => setData('permanent_address', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Job & Reporting</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Reporting Manager</label>
                                <select value={data.reporting_manager_id} onChange={(e) => setData('reporting_manager_id', e.target.value)} className={selCls}>
                                    <option value="">No manager</option>
                                    {managers.map((m) => <option key={m.id} value={m.id}>{m.first_name} {m.last_name ?? ''} ({m.employee_code})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Work Location</label>
                                <Input value={data.work_location} onChange={(e) => setData('work_location', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Probation End Date</label>
                                <Input type="date" value={data.probation_end_date} onChange={(e) => setData('probation_end_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Confirmation Date</label>
                                <Input type="date" value={data.confirmation_date} onChange={(e) => setData('confirmation_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Notice Period (Days)</label>
                                <Input type="number" min="0" max="365" value={data.notice_period_days} onChange={(e) => setData('notice_period_days', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Exit Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Exit Date</label>
                                <Input type="date" value={data.exit_date} onChange={(e) => setData('exit_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Exit Reason</label>
                                <Input value={data.exit_reason} onChange={(e) => setData('exit_reason', e.target.value)} />
                            </div>
                            <label className="col-span-2 flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={!!data.rehire_eligible} onChange={(e) => setData('rehire_eligible', e.target.checked)} />
                                Rehire eligible
                            </label>
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium">Exit Notes</label>
                                <Input value={data.exit_notes} onChange={(e) => setData('exit_notes', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Bank Account Number</label>
                                <Input value={data.bank_account_number}
                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                    placeholder="e.g. 1234567890" />
                                {errors.bank_account_number && <p className="text-xs text-destructive">{errors.bank_account_number}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">IFSC Code</label>
                                <Input value={data.bank_ifsc}
                                    onChange={(e) => setData('bank_ifsc', e.target.value.toUpperCase())}
                                    placeholder="e.g. HDFC0001234" />
                                {errors.bank_ifsc && <p className="text-xs text-destructive">{errors.bank_ifsc}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/payroll/employees/${employee.id}`)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</Button>
                    </div>
                </form>

                {/* ── Login Account (separate from main form) ── */}
                <Card className={linkedUser ? 'border-green-500/40' : ''}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <KeyRound className="h-4 w-4 text-muted-foreground" />
                                Login Account
                            </CardTitle>
                            {linkedUser && (
                                <Badge variant="success" className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" /> Linked
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {linkedUser ? (
                            <>
                                {/* Current account info */}
                                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium">{linkedUser.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-mono text-xs">{linkedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Login</span>
                                        <span>{linkedUser.last_login_at ? formatDate(linkedUser.last_login_at) : 'Never'}</span>
                                    </div>
                                </div>

                                {/* Reset password */}
                                <div>
                                    <p className="text-sm font-medium mb-3">Reset Password</p>
                                    <ResetPasswordInline employeeId={employee.id} />
                                </div>

                                {/* Unlink */}
                                <div className="pt-2 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive border-destructive/40 hover:bg-destructive/5"
                                        onClick={() => {
                                            if (window.confirm('Unlink user account? The employee will lose login access.')) {
                                                router.delete(`/payroll/employees/${employee.id}/account`, { preserveScroll: true })
                                            }
                                        }}
                                    >
                                        <Link2Off className="h-4 w-4 mr-2" /> Unlink Account
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    This employee has no login account yet. Create one to give them access to the system.
                                </p>
                                <CreateAccountInline employeeId={employee.id} employee={employee} roles={roles} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
