import { Head, useForm, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, ArrowLeft } from 'lucide-react'

export default function ForgotPassword({ status, errors = {} }) {
    const { data, setData, post, processing } = useForm({ email: '' })

    const submit = (e) => {
        e.preventDefault()
        post('/forgot-password')
    }

    return (
        <>
            <Head title="Reset Password — AI-FMS" />
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold">AI-FMS</span>
                        </div>
                        <h2 className="text-3xl font-bold">Forgot password?</h2>
                        <p className="text-muted-foreground mt-2">Enter your email and we'll send a reset link</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        {status && (
                            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg p-3 text-sm">
                                {status}
                            </div>
                        )}
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email address</label>
                                <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoFocus
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>
                            <Button type="submit" className="w-full" loading={processing}>
                                Send Reset Link
                            </Button>
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" /> Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
