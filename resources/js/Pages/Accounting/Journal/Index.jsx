import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusConfig = {
    draft:    { label: 'Draft',    variant: 'secondary', icon: Clock },
    posted:   { label: 'Posted',   variant: 'success',   icon: CheckCircle },
    voided:   { label: 'Voided',   variant: 'destructive', icon: XCircle },
    reversed: { label: 'Reversed', variant: 'warning',   icon: XCircle },
}

export default function JournalIndex({ journals = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const list = journals.data ?? []

    return (
        <AppLayout>
            <Head title="Journal Entries" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Journal Entries</h1>
                        <p className="text-muted-foreground text-sm mt-1">Double-entry bookkeeping records</p>
                    </div>
                    <Button onClick={() => router.visit('/accounting/journal/create')}>
                        <Plus className="w-4 h-4 mr-2" /> New Journal Entry
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search by number or reference..."
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.get('/accounting/journal', { search }, { preserveState: true })}
                                    className="pl-9" />
                            </div>
                            <select defaultValue={filters.status ?? ''}
                                onChange={(e) => router.get('/accounting/journal', { ...filters, status: e.target.value }, { preserveState: true })}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="posted">Posted</option>
                                <option value="voided">Voided</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Narration</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No journal entries found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((j) => {
                                    const cfg = statusConfig[j.status] ?? statusConfig.draft
                                    return (
                                        <TableRow key={j.id} className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/accounting/journal/${j.id}`)}>
                                            <TableCell className="font-mono font-medium">{j.journal_number}</TableCell>
                                            <TableCell>{formatDate(j.date)}</TableCell>
                                            <TableCell className="capitalize">{j.journal_type.replace('_', ' ')}</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{j.narration}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(j.total_debit)}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(j.total_credit)}</TableCell>
                                            <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                                            <TableCell>
                                                {j.status === 'draft' && (
                                                    <Button size="sm" variant="outline"
                                                        onClick={(e) => { e.stopPropagation(); router.post(`/accounting/journal/${j.id}/post`) }}>
                                                        Post
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {journals.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: journals.last_page }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={p === journals.current_page ? 'default' : 'outline'} size="sm"
                                onClick={() => router.get('/accounting/journal', { ...filters, page: p })}>
                                {p}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
