import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardList } from 'lucide-react'

export default function SettingsAudit({ logs = {}, filters = {} }) {
    const list = logs.data ?? []

    const actionVariant = {
        create: 'success',
        update: 'warning',
        delete: 'destructive',
        login: 'default',
        logout: 'secondary',
    }

    return (
        <AppLayout>
            <Head title="Audit Log" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Audit Log</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track all significant actions performed in the system</p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="text-sm font-medium">{log.user?.name ?? 'System'}</div>
                                            <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={actionVariant[log.action] ?? 'secondary'} className="capitalize text-xs">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground capitalize">{log.module}</TableCell>
                                        <TableCell className="max-w-xs truncate text-sm">{log.description}</TableCell>
                                        <TableCell className="font-mono text-sm">{log.ip_address ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
