import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    ClipboardList, CheckCircle2, XCircle, Clock, Filter,
    User, Calendar, DollarSign, ChevronRight, AlertTriangle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MODULE_LABELS = {
    expense:        'Expense',
    invoice:        'Invoice',
    purchase_order: 'Purchase Order',
    payroll:        'Payroll',
    journal:        'Journal',
    budget:         'Budget',
}

const STATUS_CFG = {
    pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    approved:  { label: 'Approved',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    rejected:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600' },
}

const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'mine',      label: 'Assigned to Me' },
    { key: 'pending',   label: 'Pending' },
    { key: 'completed', label: 'Completed' },
]

const MODULES = ['expense', 'invoice', 'purchase_order', 'payroll', 'journal', 'budget']

export default function ApprovalsIndex({ approvals, stats, filters }) {
    const { auth } = usePage().props
    const [approveTarget, setApproveTarget] = useState(null)
    const [rejectTarget,  setRejectTarget]  = useState(null)
    const [comment,       setComment]       = useState('')
    const [processing,    setProcessing]    = useState(false)

    const tab    = filters?.tab    ?? 'all'
    const module = filters?.module ?? ''

    function applyFilter(overrides) {
        const params = { tab, module, ...overrides }
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
        router.get('/approvals', params, { preserveScroll: true })
    }

    function submitApprove() {
        if (!approveTarget) return
        setProcessing(true)
        router.post(`/approvals/${approveTarget.id}/approve`, { comment }, {
            onFinish: () => { setProcessing(false); setApproveTarget(null); setComment('') },
        })
    }

    function submitReject() {
        if (!rejectTarget || !comment.trim()) return
        setProcessing(true)
        router.post(`/approvals/${rejectTarget.id}/reject`, { comment }, {
            onFinish: () => { setProcessing(false); setRejectTarget(null); setComment('') },
        })
    }

    const statCards = [
        { label: 'Pending',         value: stats.pending,  icon: Clock,        color: 'text-yellow-500' },
        { label: 'Assigned to Me',  value: stats.mine,     icon: AlertTriangle, color: 'text-blue-500' },
        { label: 'Approved',        value: stats.approved, icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Rejected',        value: stats.rejected, icon: XCircle,      color: 'text-red-500' },
    ]

    const list = approvals?.data ?? []

    return (
        <AppLayout>
            <Head title="Approvals" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Approvals</h1>
                        <p className="text-muted-foreground text-sm mt-1">Review and action pending approval requests</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(s => (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <s.icon className={cn('w-8 h-8 shrink-0', s.color)} />
                                <div>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-xs text-muted-foreground">{s.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => applyFilter({ tab: t.key })}
                                className={cn(
                                    'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                                    tab === t.key
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={module}
                        onChange={e => applyFilter({ module: e.target.value })}
                        className="text-sm border border-border rounded-md px-3 py-1.5 bg-background h-9"
                    >
                        <option value="">All Modules</option>
                        {MODULES.map(m => (
                            <option key={m} value={m}>{MODULE_LABELS[m] ?? m}</option>
                        ))}
                    </select>
                </div>

                {/* List */}
                {list.length === 0 ? (
                    <Card>
                        <CardContent className="py-20 flex flex-col items-center text-muted-foreground">
                            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
                            <p className="font-medium">No approval requests found</p>
                            <p className="text-sm mt-1">Requests submitted for approval will appear here</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {list.map(approval => {
                            const statusCfg = STATUS_CFG[approval.status] ?? STATUS_CFG.pending
                            const isAssignedToMe = approval.current_approver_id === auth?.user?.id
                            return (
                                <Card key={approval.id} className={cn(
                                    'transition-shadow hover:shadow-md',
                                    approval.status === 'pending' && isAssignedToMe && 'border-blue-200 dark:border-blue-800'
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold truncate">{approval.title}</span>
                                                    <Badge variant="outline" className="text-xs shrink-0">
                                                        {MODULE_LABELS[approval.module] ?? approval.module}
                                                    </Badge>
                                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusCfg.cls)}>
                                                        {statusCfg.label}
                                                    </span>
                                                    {isAssignedToMe && approval.status === 'pending' && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                            Awaiting your action
                                                        </span>
                                                    )}
                                                </div>

                                                {approval.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 truncate">{approval.description}</p>
                                                )}

                                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                                    {approval.requester && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {approval.requester.name}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(approval.created_at)}
                                                    </span>
                                                    {approval.amount && (
                                                        <span className="flex items-center gap-1 font-medium text-foreground">
                                                            <DollarSign className="w-3 h-3" />
                                                            {formatCurrency(approval.amount)}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        Step {approval.current_step} of {approval.total_steps}
                                                    </span>
                                                </div>

                                                {approval.rejection_reason && (
                                                    <p className="text-xs text-red-500 mt-1 italic">
                                                        Reason: {approval.rejection_reason}
                                                    </p>
                                                )}
                                            </div>

                                            {approval.status === 'pending' && (
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => { setApproveTarget(approval); setComment('') }}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => { setRejectTarget(approval); setComment('') }}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {approvals?.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {approvals.links?.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={cn(
                                    'px-3 py-1.5 text-sm rounded-md border transition-colors',
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Approve Dialog */}
            <Dialog open={!!approveTarget} onOpenChange={open => !open && setApproveTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            Approve Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                            You are approving: <span className="font-medium text-foreground">{approveTarget?.title}</span>
                        </p>
                        <div className="space-y-1.5">
                            <Label>Comment (optional)</Label>
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Add an approval note..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={submitApprove}
                                disabled={processing}
                            >
                                Confirm Approve
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={open => !open && setRejectTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            Reject Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                            You are rejecting: <span className="font-medium text-foreground">{rejectTarget?.title}</span>
                        </p>
                        <div className="space-y-1.5">
                            <Label>Reason <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={submitReject}
                                disabled={processing || !comment.trim()}
                            >
                                Confirm Reject
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
