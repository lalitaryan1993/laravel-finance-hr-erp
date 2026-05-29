import { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

export default function Register({ errors = {} }) {
    const [showPassword, setShowPassword] = useState(false)
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/register')
    }

    return (
        <>
            <Head title="Create Account — AI-FMS" />
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold">AI-FMS</span>
                        </div>
                        <h2 className="text-3xl font-bold">Create your account</h2>
                        <p className="text-muted-foreground mt-2">Start your free enterprise trial</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input
                                        placeholder="Acme Corp Pvt Ltd"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                    />
                                    {errors.company_name && <p className="text-xs text-destructive">{errors.company_name}</p>}
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">Your Name</label>
                                    <Input
                                        placeholder="John Smith"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 8 characters"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Repeat password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" loading={processing}>
                                Create Account
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
