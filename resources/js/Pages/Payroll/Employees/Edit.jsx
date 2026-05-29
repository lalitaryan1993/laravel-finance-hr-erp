import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowLeft } from 'lucide-react'

export default function EmployeeEdit({ employee, departments = [], salaryStructures = [], managers = [] }) {
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

    const submit = (e) => {
        e.preventDefault()
        put(`/payroll/employees/${employee.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit — ${employee.full_name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/payroll/employees/${employee.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Employee</h1>
                        <p className="text-muted-foreground text-sm">{employee.full_name}</p>
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
                                <select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
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
                                <select value={data.salary_structure_id} onChange={(e) => setData('salary_structure_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
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
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
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
                                <select value={data.gender} onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select gender</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="non_binary">Non-binary</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Marital Status</label>
                                <select value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
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
                                <select value={data.reporting_manager_id} onChange={(e) => setData('reporting_manager_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
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
                        <Button type="submit" loading={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
