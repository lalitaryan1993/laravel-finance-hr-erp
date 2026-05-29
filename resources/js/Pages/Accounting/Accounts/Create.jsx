import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function AccountCreate({ groups = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        account_group_id: '',
        type: 'asset',
        nature: 'debit',
        opening_balance: '',
        description: '',
        is_active: true,
    })

    const typeNatureMap = {
        asset: 'debit', liability: 'credit', equity: 'credit',
        income: 'credit', expense: 'debit',
    }

    const handleTypeChange = (val) => {
        setData((prev) => ({ ...prev, type: val, nature: typeNatureMap[val] ?? 'debit' }))
    }

    const submit = (e) => {
        e.preventDefault()
        post('/accounting/accounts')
    }

    return (
        <AppLayout>
            <Head title="New Account" />
            <div className="space-y-6 max-w-xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/accounting/accounts')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">New Account</h1>
                        <p className="text-muted-foreground text-sm">Add a chart of accounts entry</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Code *</label>
                                <Input value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. 1001" className="font-mono" />
                                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Type *</label>
                                <select value={data.type} onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm capitalize">
                                    {['asset', 'liability', 'equity', 'income', 'expense'].map((t) =>
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Account Name *</label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Cash in Hand" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Group *</label>
                                <select value={data.account_group_id} onChange={(e) => setData('account_group_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="">Select group</option>
                                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                {errors.account_group_id && <p className="text-xs text-destructive">{errors.account_group_id}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Nature</label>
                                <select value={data.nature} onChange={(e) => setData('nature', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="debit">Debit</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Opening Balance (₹)</label>
                                <Input type="number" step="0.01" value={data.opening_balance}
                                    onChange={(e) => setData('opening_balance', e.target.value)} />
                            </div>
                            <div className="space-y-1 flex items-end pb-1">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)} />
                                    Active account
                                </label>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                                    rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit('/accounting/accounts')}>Cancel</Button>
                        <Button type="submit" loading={processing}>Create Account</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
