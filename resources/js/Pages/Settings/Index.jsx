import { useState } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Bell, Shield, CreditCard, Key, Smartphone, Clock, CheckCircle2, AlertCircle, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'

/* ── tiny toggle switch ───────────────────────────────────────────── */
function Toggle({ checked, onChange, label, description }) {
    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
                <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
                />
            </button>
        </div>
    )
}

/* ── Company tab ───────────────────────────────────────────────────── */
function CompanyTab({ company }) {
    const { data, setData, patch, processing } = useForm({
        name:                  company?.name ?? '',
        legal_name:            company?.legal_name ?? '',
        email:                 company?.email ?? '',
        phone:                 company?.phone ?? '',
        website:               company?.website ?? '',
        address_line1:         company?.address_line1 ?? '',
        city:                  company?.city ?? '',
        state:                 company?.state ?? '',
        country:               company?.country ?? 'India',
        pincode:               company?.pincode ?? '',
        currency:              company?.currency ?? 'INR',
        timezone:              company?.timezone ?? 'Asia/Kolkata',
        financial_year_start:  company?.financial_year_start ?? '04',
        gst_number:            company?.gst_number ?? '',
        pan_number:            company?.pan_number ?? '',
        invoice_prefix:        company?.invoice_prefix ?? 'INV',
    })

    const save = (e) => {
        e.preventDefault()
        patch('/settings/company', { onSuccess: () => toast.success('Settings saved!') })
    }

    return (
        <form onSubmit={save} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Company Name *</label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Legal Name</label>
                        <Input value={data.legal_name} onChange={(e) => setData('legal_name', e.target.value)} />
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
                        <label className="text-sm font-medium">Website</label>
                        <Input value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="https://example.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">City</label>
                        <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium">Address</label>
                        <Input value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">State</label>
                        <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Pincode</label>
                        <Input value={data.pincode} onChange={(e) => setData('pincode', e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Currency</label>
                        <select value={data.currency} onChange={(e) => setData('currency', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="INR">INR — Indian Rupee</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">GBP — British Pound</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Fiscal Year Start</label>
                        <select value={data.financial_year_start} onChange={(e) => setData('financial_year_start', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="01">January</option>
                            <option value="04">April (Indian FY)</option>
                            <option value="07">July</option>
                            <option value="10">October</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">GST Number</label>
                        <Input value={data.gst_number} onChange={(e) => setData('gst_number', e.target.value)}
                            placeholder="27AABCA1234Z1Z5" className="font-mono" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">PAN Number</label>
                        <Input value={data.pan_number} onChange={(e) => setData('pan_number', e.target.value)}
                            placeholder="AABCA1234Z" className="font-mono" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Invoice Prefix</label>
                        <Input value={data.invoice_prefix} onChange={(e) => setData('invoice_prefix', e.target.value)}
                            placeholder="INV" className="w-32" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Timezone</label>
                        <select value={data.timezone} onChange={(e) => setData('timezone', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" loading={processing}>Save Settings</Button>
            </div>
        </form>
    )
}

/* ── Notifications tab ─────────────────────────────────────────────── */
function NotificationsTab() {
    const [prefs, setPrefs] = useState({
        email_invoice_created:   true,
        email_payment_received:  true,
        email_expense_approved:  true,
        email_payroll_processed: false,
        email_leave_approved:    true,
        email_low_budget:        true,
        app_invoice_created:     true,
        app_payment_received:    true,
        app_expense_approved:    true,
        app_task_assigned:       true,
        app_leave_request:       true,
        app_system_alerts:       true,
    })

    const set = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }))

    const save = () => toast.success('Notification preferences saved!')

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Email Notifications
                    </CardTitle>
                    <CardDescription>Choose which events trigger email alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <Toggle checked={prefs.email_invoice_created}   onChange={set('email_invoice_created')}   label="Invoice Created"        description="When a new invoice is raised" />
                    <Toggle checked={prefs.email_payment_received}   onChange={set('email_payment_received')}  label="Payment Received"        description="When a payment is recorded" />
                    <Toggle checked={prefs.email_expense_approved}   onChange={set('email_expense_approved')}  label="Expense Approved/Rejected" description="On expense claim status change" />
                    <Toggle checked={prefs.email_payroll_processed}  onChange={set('email_payroll_processed')} label="Payroll Processed"      description="Monthly payroll run completion" />
                    <Toggle checked={prefs.email_leave_approved}     onChange={set('email_leave_approved')}    label="Leave Approved/Rejected" description="On leave request status change" />
                    <Toggle checked={prefs.email_low_budget}         onChange={set('email_low_budget')}        label="Budget Alert"            description="When budget utilisation exceeds 80%" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> In-App Notifications
                    </CardTitle>
                    <CardDescription>Real-time alerts in the notification bell</CardDescription>
                </CardHeader>
                <CardContent>
                    <Toggle checked={prefs.app_invoice_created}  onChange={set('app_invoice_created')}  label="Invoice & Payment"    description="Invoice and payment activity" />
                    <Toggle checked={prefs.app_expense_approved} onChange={set('app_expense_approved')} label="Expense Claims"        description="Claim approvals and rejections" />
                    <Toggle checked={prefs.app_task_assigned}    onChange={set('app_task_assigned')}    label="Task Assigned"        description="When a lifecycle task is assigned to you" />
                    <Toggle checked={prefs.app_leave_request}    onChange={set('app_leave_request')}    label="Leave Requests"       description="New leave requests requiring approval" />
                    <Toggle checked={prefs.app_system_alerts}    onChange={set('app_system_alerts')}    label="System Alerts"        description="Backup status and system events" />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={save}>Save Preferences</Button>
            </div>
        </div>
    )
}

/* ── Security tab ──────────────────────────────────────────────────── */
function SecurityTab() {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password:       '',
        password:               '',
        password_confirmation:  '',
    })

    const changePassword = (e) => {
        e.preventDefault()
        post('/profile/password', {
            onSuccess: () => {
                toast.success('Password changed successfully!')
                reset()
            },
            onError: () => toast.error('Failed to change password.'),
        })
    }

    const sessions = [
        { device: 'Chrome on Windows', location: 'Mumbai, IN', time: 'Active now', current: true },
        { device: 'Safari on iPhone', location: 'Delhi, IN', time: '2 hours ago', current: false },
    ]

    return (
        <div className="space-y-6">
            {/* Change password */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-4 h-4" /> Change Password
                    </CardTitle>
                    <CardDescription>Use a strong password of at least 8 characters</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={changePassword} className="space-y-4 max-w-sm">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Current Password *</label>
                            <Input
                                type="password"
                                value={data.current_password}
                                onChange={e => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                            />
                            {errors.current_password && <p className="text-xs text-destructive">{errors.current_password}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">New Password *</label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Confirm New Password *</label>
                            <Input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <Button type="submit" loading={processing}>Update Password</Button>
                    </form>
                </CardContent>
            </Card>

            {/* 2FA */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">2FA is not enabled</p>
                                <p className="text-xs text-muted-foreground">Protect your account with an authenticator app</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast('2FA setup coming soon')}>
                            Enable 2FA
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Active Sessions
                    </CardTitle>
                    <CardDescription>Devices currently logged into your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sessions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center gap-3">
                                <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        {s.device}
                                        {s.current && <Badge variant="success" className="text-[10px] px-1.5 py-0">Current</Badge>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                                </div>
                            </div>
                            {!s.current && (
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs"
                                    onClick={() => toast.success('Session revoked')}>
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => toast.success('All other sessions revoked')}>
                        Revoke All Other Sessions
                    </Button>
                </CardContent>
            </Card>

            {/* Login activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Login Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[
                            { action: 'Successful login', detail: 'Chrome · Mumbai, IN', time: 'Just now' },
                            { action: 'Successful login', detail: 'Safari · Delhi, IN', time: '2h ago' },
                            { action: 'Failed login attempt', detail: 'Unknown device', time: '1d ago', failed: true },
                            { action: 'Password changed', detail: 'Chrome · Mumbai, IN', time: '7d ago' },
                        ].map((ev, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                                {ev.failed
                                    ? <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                                    : <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                }
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${ev.failed ? 'text-destructive' : ''}`}>{ev.action}</p>
                                    <p className="text-xs text-muted-foreground truncate">{ev.detail}</p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{ev.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ── Billing tab ───────────────────────────────────────────────────── */
function BillingTab() {
    return (
        <div className="space-y-6">
            {/* Current plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Current Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">Enterprise</span>
                                <Badge className="bg-green-600 text-white">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Full-featured self-hosted plan — no subscription fees</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {[
                            ['Users', 'Unlimited'],
                            ['Companies', 'Unlimited'],
                            ['Storage', 'Disk-based'],
                            ['AI Features', 'OpenAI API key required'],
                            ['Support', 'Community / GitHub'],
                            ['Updates', 'Self-managed'],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between border-b pb-2 text-sm">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{val}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Usage */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                    <CardDescription>Based on current database records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { label: 'Employees', used: '—' },
                            { label: 'Invoices', used: '—' },
                            { label: 'Journal Entries', used: '—' },
                            { label: 'File Storage', used: 'Disk' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-mono font-medium">{item.used}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Self-hosted note */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium">Self-Hosted — No Billing Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            AI-FMS is open-source and self-hosted. There are no subscription fees.
                            The only paid component is the optional OpenAI API key for AI features.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* ── Main Settings page ────────────────────────────────────────────── */
export default function SettingsIndex({ company, settings = {} }) {
    return (
        <AppLayout>
            <Head title="Settings" />
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your company and system settings</p>
                </div>

                <Tabs defaultValue="company">
                    <TabsList className="mb-6">
                        <TabsTrigger value="company" className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Company
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Billing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="company">
                        <CompanyTab company={company} />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <NotificationsTab />
                    </TabsContent>

                    <TabsContent value="security">
                        <SecurityTab />
                    </TabsContent>

                    <TabsContent value="billing">
                        <BillingTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
