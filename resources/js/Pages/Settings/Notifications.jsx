import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

const notifGroups = [
    {
        title: 'Invoices',
        items: [
            { key: 'invoice_created', label: 'Invoice Created' },
            { key: 'invoice_overdue', label: 'Invoice Overdue' },
            { key: 'payment_received', label: 'Payment Received' },
        ],
    },
    {
        title: 'Expenses',
        items: [
            { key: 'expense_submitted', label: 'Expense Submitted' },
            { key: 'expense_approved', label: 'Expense Approved / Rejected' },
        ],
    },
    {
        title: 'Payroll',
        items: [
            { key: 'payroll_processed', label: 'Payroll Processed' },
            { key: 'payslip_generated', label: 'Payslip Generated' },
        ],
    },
    {
        title: 'Budget',
        items: [
            { key: 'budget_exceeded', label: 'Budget Exceeded' },
            { key: 'budget_approved', label: 'Budget Approved' },
        ],
    },
]

export default function SettingsNotifications({ company }) {
    const settings = company?.notification_settings ?? {}
    const { data, setData, put, processing } = useForm(
        notifGroups.flatMap((g) => g.items).reduce((acc, item) => {
            acc[item.key] = settings[item.key] ?? true
            return acc
        }, {})
    )

    const submit = (e) => {
        e.preventDefault()
        put('/settings/notifications')
    }

    return (
        <AppLayout>
            <Head title="Notification Settings" />
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold">Notification Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">Choose which events trigger in-app notifications</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {notifGroups.map((group) => (
                        <Card key={group.title}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-muted-foreground" />
                                    {group.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {group.items.map((item) => (
                                    <label key={item.key} className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm">{item.label}</span>
                                        <input type="checkbox" checked={!!data[item.key]}
                                            onChange={(e) => setData(item.key, e.target.checked)}
                                            className="rounded" />
                                    </label>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                    <div className="flex justify-end">
                        <Button type="submit" loading={processing}>Save Preferences</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
