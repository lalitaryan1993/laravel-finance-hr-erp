import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Download, Shield, Clock } from 'lucide-react'

export default function SettingsBackup({ company }) {
    const runBackup = () => router.post('/settings/backup/run')

    return (
        <AppLayout>
            <Head title="Backup & Restore" />
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold">Backup & Restore</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your data backups and restore points</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Manual Backup</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Create an on-demand backup of all your financial data including invoices, accounts, journals, employees, and settings.
                        </p>
                        <Button onClick={runBackup} className="gap-2">
                            <Database className="w-4 h-4" />
                            Create Backup Now
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5 space-y-2">
                            <Shield className="w-6 h-6 text-green-500" />
                            <div className="font-medium text-sm">Encrypted</div>
                            <p className="text-xs text-muted-foreground">All backups are AES-256 encrypted</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 space-y-2">
                            <Clock className="w-6 h-6 text-blue-500" />
                            <div className="font-medium text-sm">Scheduled</div>
                            <p className="text-xs text-muted-foreground">Daily backups at 2 AM automatically</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 space-y-2">
                            <Download className="w-6 h-6 text-purple-500" />
                            <div className="font-medium text-sm">Downloadable</div>
                            <p className="text-xs text-muted-foreground">Download as JSON or SQL dump</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Recent Backups</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No backups created yet. Run your first backup above.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
