import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, ChevronRight, Building2, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const typeColors = {
    asset:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    liability: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    equity:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    income:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expense:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function AccountsIndex({ accounts = {}, groups = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const [showCreate, setShowCreate] = useState(false)
    const list = accounts.data ?? (Array.isArray(accounts) ? accounts : [])

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', code: '', type: 'asset', nature: 'debit',
        account_group_id: '', description: '',
        is_bank_account: false, is_cash_account: false,
    })

    const doSearch = () => router.get('/accounting/accounts', { search }, { preserveState: true })

    const submit = (e) => {
        e.preventDefault()
        post('/accounting/accounts', { onSuccess: () => { reset(); setShowCreate(false) } })
    }

    const stats = {
        total: accounts.total ?? list.length,
        active: list.filter(a => a.is_active).length,
        banks: list.filter(a => a.is_bank_account).length,
    }

    return (
        <AppLayout>
            <Head title="Chart of Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your company's account structure</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Account
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Accounts', value: stats.total, icon: Building2, color: 'text-blue-500' },
                        { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-green-500' },
                        { label: 'Bank Accounts', value: stats.banks, icon: Building2, color: 'text-purple-500' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={cn('w-10 h-10 rounded-xl bg-muted flex items-center justify-center', s.color)}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-sm text-muted-foreground">{s.label}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search accounts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" onClick={doSearch}>Search</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Nature</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No accounts found. Add your first account.
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((acc) => (
                                    <TableRow key={acc.id} className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/accounting/accounts/${acc.id}`)}>
                                        <TableCell className="font-mono text-sm font-medium">{acc.code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{acc.name}</div>
                                            {acc.description && <div className="text-xs text-muted-foreground">{acc.description}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn('text-xs px-2 py-1 rounded-full font-medium', typeColors[acc.type] ?? '')}>
                                                {acc.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                {acc.nature === 'debit'
                                                    ? <ArrowUpRight className="w-3 h-3 text-green-500" />
                                                    : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                                                {acc.nature}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(acc.current_balance ?? 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={acc.is_active ? 'success' : 'secondary'}>
                                                {acc.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create New Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Code *</label>
                                <Input placeholder="e.g. 1001" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Name *</label>
                                <Input placeholder="e.g. Cash in Hand" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Type *</label>
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    {['asset', 'liability', 'equity', 'income', 'expense'].map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Nature *</label>
                                <select value={data.nature} onChange={(e) => setData('nature', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="debit">Debit (increases with Dr)</option>
                                    <option value="credit">Credit (increases with Cr)</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Account Group</label>
                                <select value={data.account_group_id} onChange={(e) => setData('account_group_id', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select group...</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={data.is_bank_account}
                                        onChange={(e) => setData('is_bank_account', e.target.checked)} />
                                    Bank Account
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={data.is_cash_account}
                                        onChange={(e) => setData('is_cash_account', e.target.checked)} />
                                    Cash Account
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button type="submit" loading={processing}>Create Account</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
