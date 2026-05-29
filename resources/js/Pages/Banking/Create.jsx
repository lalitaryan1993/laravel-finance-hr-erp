import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function BankAccountCreate() {
    const { data, setData, post, processing, errors } = useForm({
        account_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: '',
        account_type: 'current',
        opening_balance: '0',
        currency: 'INR',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/banking/accounts')
    }

    return (
        <AppLayout>
            <Head title="Add Bank Account" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/banking')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Bank Account</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Connect a new bank account</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Name *</label>
                                <Input placeholder="e.g. HDFC Current Account"
                                    value={data.account_name} onChange={(e) => setData('account_name', e.target.value)} />
                                {errors.account_name && <p className="text-xs text-destructive">{errors.account_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Bank Name *</label>
                                <Input placeholder="e.g. HDFC Bank"
                                    value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} />
                                {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Number *</label>
                                <Input placeholder="Account number"
                                    value={data.account_number} onChange={(e) => setData('account_number', e.target.value)} />
                                {errors.account_number && <p className="text-xs text-destructive">{errors.account_number}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Type *</label>
                                <select value={data.account_type} onChange={(e) => setData('account_type', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="savings">Savings</option>
                                    <option value="current">Current</option>
                                    <option value="overdraft">Overdraft</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">IFSC Code</label>
                                <Input placeholder="e.g. HDFC0001234" className="font-mono uppercase"
                                    value={data.ifsc_code} onChange={(e) => setData('ifsc_code', e.target.value.toUpperCase())} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Branch Name</label>
                                <Input placeholder="Branch name"
                                    value={data.branch_name} onChange={(e) => setData('branch_name', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Opening Balance (₹)</label>
                                <Input type="number" step="0.01" min="0" placeholder="0.00"
                                    value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Currency</label>
                                <select value={data.currency} onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="INR">INR — Indian Rupee</option>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit('/banking')}>Cancel</Button>
                        <Button type="submit" loading={processing}>Add Account</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
