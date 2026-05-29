import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Bell, Shield, Users, CreditCard, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsIndex({ company, settings = {} }) {
    const { data, setData, patch, processing } = useForm({
        name:            company?.name ?? '',
        legal_name:      company?.legal_name ?? '',
        email:           company?.email ?? '',
        phone:           company?.phone ?? '',
        website:         company?.website ?? '',
        address_line1:   company?.address_line1 ?? '',
        city:            company?.city ?? '',
        state:           company?.state ?? '',
        country:         company?.country ?? 'India',
        pincode:         company?.pincode ?? '',
        currency:        company?.currency ?? 'INR',
        timezone:        company?.timezone ?? 'Asia/Kolkata',
        financial_year_start: company?.financial_year_start ?? '04',
        gst_number:      company?.gst_number ?? '',
        pan_number:      company?.pan_number ?? '',
        invoice_prefix:  company?.invoice_prefix ?? 'INV',
    })

    const save = (e) => {
        e.preventDefault()
        patch('/settings/company', { onSuccess: () => toast.success('Settings saved!') })
    }

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
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-sm font-medium">Address</label>
                                        <Input value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">City</label>
                                        <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">State</label>
                                        <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
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
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" loading={processing}>Save Settings</Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <div className="font-medium">Notification Settings</div>
                                <div className="text-sm mt-1">Configure email and in-app notifications</div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <div className="font-medium">Security Settings</div>
                                <div className="text-sm mt-1">2FA, session management, IP restrictions</div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <div className="font-medium">Billing & Subscription</div>
                                <div className="text-sm mt-1">Manage your enterprise plan</div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
