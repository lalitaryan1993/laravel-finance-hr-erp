import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword({ token, email, errors = {} }) {
    const [showPassword, setShowPassword] = useState(false)
    const { data, setData, post, processing } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post('/reset-password')
    }

    return (
        <>
            <Head title="Set New Password — AI-FMS" />
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-bold">AI-FMS</span>
                        </div>
                        <h2 className="text-3xl font-bold">Set new password</h2>
                        <p className="text-muted-foreground mt-2">Choose a strong password for your account</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email address</label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">New password</label>
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
                                <label className="text-sm font-medium">Confirm password</label>
                                <Input
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" loading={processing}>
                                Reset Password
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
