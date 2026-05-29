import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Shield } from 'lucide-react'

export default function TwoFactor({ errors = {} }) {
    const { data, setData, post, processing } = useForm({ code: '' })

    const submit = (e) => {
        e.preventDefault()
        post('/two-factor/verify')
    }

    return (
        <>
            <Head title="Two-Factor Authentication — AI-FMS" />
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold">AI-FMS</span>
                        </div>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Two-Factor Auth</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Enter the 6-digit code from your authenticator app
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Authentication Code</label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="text-center text-2xl tracking-[0.5em] font-mono"
                                    autoFocus
                                />
                                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                            </div>
                            <Button type="submit" className="w-full" loading={processing}>
                                Verify Code
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
