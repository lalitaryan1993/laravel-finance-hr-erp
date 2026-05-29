import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Building2, Shield } from 'lucide-react'

export default function ProfileIndex({ user }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name:  user.name ?? '',
        phone: user.phone ?? '',
    })

    const submit = (e) => {
        e.preventDefault()
        put('/profile')
    }

    const initials = (user.name ?? 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <AppLayout>
            <Head title="My Profile" />
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
                </div>

                {/* Avatar card */}
                <Card>
                    <CardContent className="p-6 flex items-center gap-5">
                        <Avatar className="w-20 h-20">
                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                            </div>
                            {user.company && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {user.company.name}
                                </div>
                            )}
                            {user.roles?.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                                    {user.roles.map(role => (
                                        <Badge key={role} variant="secondary" className="text-xs capitalize">
                                            {role.replace('-', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit form */}
                <Card>
                    <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name *
                                </label>
                                <Input value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Your full name" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                                </label>
                                <Input value={user.email} disabled
                                    className="bg-muted/50 cursor-not-allowed" />
                                <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact your administrator.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
                                </label>
                                <Input value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="+91 98765 43210" />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" loading={processing}>Save Changes</Button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-green-600 font-medium">Saved!</span>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Account info */}
                <Card>
                    <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {[
                            ['User ID', `#${user.id}`],
                            ['Member Since', user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
                            ['Last Login', user.last_login_at ? new Date(user.last_login_at).toLocaleString('en-IN') : '—'],
                            ['Timezone', user.timezone ?? 'Asia/Kolkata'],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium font-mono text-xs">{value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
