import { Head, router, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function BankAccountEdit({ account }) {
    const { data, setData, put, processing, errors } = useForm({
        account_name: account.account_name ?? '',
        bank_name: account.bank_name ?? '',
        ifsc_code: account.ifsc_code ?? '',
        branch_name: account.branch_name ?? '',
        is_active: account.is_active ?? true,
    })

    const submit = (e) => {
        e.preventDefault()
        put(`/banking/accounts/${account.id}`)
    }

    return (
        <AppLayout>
            <Head title={`Edit ${account.account_name}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/banking/accounts/${account.id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Bank Account</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{account.bank_name} · ****{account.account_number?.slice(-4)}</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Account Name *</label>
                                <Input value={data.account_name} onChange={(e) => setData('account_name', e.target.value)} />
                                {errors.account_name && <p className="text-xs text-destructive">{errors.account_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Bank Name *</label>
                                <Input value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} />
                                {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">IFSC Code</label>
                                <Input value={data.ifsc_code} onChange={(e) => setData('ifsc_code', e.target.value)} className="font-mono uppercase" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Branch Name</label>
                                <Input value={data.branch_name} onChange={(e) => setData('branch_name', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)} />
                                    Account is Active
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.visit(`/banking/accounts/${account.id}`)}>Cancel</Button>
                        <Button type="submit" loading={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
