import { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, TrendingUp, Lock, Mail } from 'lucide-react'

export default function Login({ errors = {} }) {
    const [showPassword, setShowPassword] = useState(false)
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    })

    const submit = (e) => {
        e.preventDefault()
        post('/login')
    }

    return (
        <>
            <Head title="Sign In — AI-FMS" />
            <div className="min-h-screen flex">
                {/* Left Panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">AI-FMS</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            Enterprise Financial<br />Management, Powered by AI
                        </h1>
                        <p className="text-green-100 text-lg leading-relaxed">
                            Automate accounting, streamline payroll, manage invoices, and get intelligent financial insights — all in one platform.
                        </p>
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Modules', value: '25+' },
                                { label: 'Automation', value: '90%' },
                                { label: 'Reports', value: 'Real-time' },
                            ].map((s) => (
                                <div key={s.label} className="bg-white/10 rounded-xl p-4">
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-green-200 text-sm">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-green-300 text-sm">© 2024 AI-FMS. Enterprise Edition.</p>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex items-center justify-center p-8 bg-background">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <span className="text-2xl font-bold">AI-FMS</span>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
                            <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {errors.email && (
                                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                                    {errors.email}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pl-10"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground">Password</label>
                                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-border"
                                />
                                <label htmlFor="remember" className="text-sm text-muted-foreground">
                                    Remember me for 30 days
                                </label>
                            </div>

                            <Button type="submit" className="w-full" size="lg" loading={processing}>
                                Sign in
                            </Button>
                        </form>

                        <div className="border-t border-border pt-6">
                            <p className="text-center text-sm text-muted-foreground mb-3">Demo accounts:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                    { label: 'Super Admin', email: 'super@aifms.com' },
                                    { label: 'Finance Mgr', email: 'finance@aifms.com' },
                                    { label: 'Accountant', email: 'accountant@aifms.com' },
                                    { label: 'Analyst', email: 'analyst@aifms.com' },
                                ].map((d) => (
                                    <button
                                        key={d.email}
                                        type="button"
                                        onClick={() => { setData('email', d.email); setData('password', 'Admin@123') }}
                                        className="text-left p-2 rounded-lg border border-border hover:bg-accent hover:border-primary/30 transition-colors"
                                    >
                                        <div className="font-medium text-foreground">{d.label}</div>
                                        <div className="text-muted-foreground truncate">{d.email}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
