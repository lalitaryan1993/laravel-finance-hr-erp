import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowLeft, KeyRound } from 'lucide-react'

const selCls = 'w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'

export default function EmployeeCreate({ departments = [], salaryStructures = [], roles = [] }) {
    const [createAccount, setCreateAccount] = useState(false)

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        employee_code: '',
        department_id: '',
        salary_structure_id: '',
        designation: '',
        date_of_joining: '',
        date_of_birth: '',
        basic_salary: '',
        pan_number: '',
        bank_account_number: '',
        bank_ifsc: '',
        employment_type: 'full_time',
        status: 'active',
        // login account
        create_account: false,
        account_email: '',
        account_password: '',
        account_role: 'employee',
    })

    const toggleAccount = (checked) => {
        setCreateAccount(checked)
        setData('create_account', checked)
        // pre-fill account email from employee email when toggling on
        if (checked && !data.account_email) {
            setData('account_email', data.email)
        }
    }

    const submit = (e) => {
        e.preventDefault()
        post('/payroll/employees')
    }

    return (
        <AppLayout>
            <Head title="Add Employee" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/payroll/employees')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Employee</h1>
                        <p className="text-muted-foreground text-sm">Create a new employee record</p>
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
                                <label className="text-sm font-medium">Date of Birth</label>
                                <DatePicker value={data.date_of_birth} onChange={(v) => setData('date_of_birth', v)} placeholder="Select DOB" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">PAN Number</label>
                                <Input value={data.pan_number} onChange={(e) => setData('pan_number', e.target.value)} className="font-mono uppercase" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Employment Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Employee Code</label>
                                <Input value={data.employee_code} onChange={(e) => setData('employee_code', e.target.value)} className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Date of Joining</label>
                                <DatePicker value={data.date_of_joining} onChange={(v) => setData('date_of_joining', v)} placeholder="Select joining date" />
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Number</label>
                                <Input value={data.bank_account_number} onChange={(e) => setData('bank_account_number', e.target.value)} className="font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">IFSC Code</label>
                                <Input value={data.bank_ifsc} onChange={(e) => setData('bank_ifsc', e.target.value)} className="font-mono uppercase" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Login Access */}
                    <Card className={createAccount ? 'ring-2 ring-primary/30' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                                    Login Access
                                </CardTitle>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={createAccount}
                                        onChange={(e) => toggleAccount(e.target.checked)}
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <span className="text-sm font-medium">Create login account now</span>
                                </label>
                            </div>
                            {!createAccount && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enable to set up login credentials immediately. You can also do this later from the employee's Account tab.
                                </p>
                            )}
                        </CardHeader>

                        {createAccount && (
                            <CardContent className="grid grid-cols-2 gap-4 pt-0">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Login Email *</label>
                                    <Input
                                        type="email"
                                        value={data.account_email}
                                        onChange={(e) => setData('account_email', e.target.value)}
                                        placeholder="Used to log in"
                                    />
                                    {errors.account_email && <p className="text-xs text-destructive">{errors.account_email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Role *</label>
                                    <select value={data.account_role} onChange={(e) => setData('account_role', e.target.value)} className={selCls}>
                                        {roles.map(r => (
                                            <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                        ))}
                                    </select>
                                    {errors.account_role && <p className="text-xs text-destructive">{errors.account_role}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Password *</label>
                                    <Input
                                        type="password"
                                        value={data.account_password}
                                        onChange={(e) => setData('account_password', e.target.value)}
                                        placeholder="Min 8 characters"
                                    />
                                    {errors.account_password && <p className="text-xs text-destructive">{errors.account_password}</p>}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit('/payroll/employees')}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Add Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
