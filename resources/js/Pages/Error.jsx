import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'

const errorConfig = {
    403: {
        code: '403',
        title: 'Access Denied',
        message: "You don't have permission to view this page. Contact your administrator if you believe this is a mistake.",
        icon: (
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-primary/20" />
                <circle cx="40" cy="40" r="26" fill="currentColor" className="text-primary/10" />
                <path d="M28 40a12 12 0 0 1 12-12v-4a16 16 0 0 0-16 16h4zm12-12a12 12 0 0 1 12 12h4a16 16 0 0 0-16-16v4zm12 12a12 12 0 0 1-12 12v4a16 16 0 0 0 16-16h-4zm-12 12a12 12 0 0 1-12-12h-4a16 16 0 0 0 16 16v-4z" fill="currentColor" className="text-primary/40" />
                <path d="M33 33l14 14M47 33L33 47" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-destructive" />
                <rect x="30" y="46" width="20" height="3" rx="1.5" fill="currentColor" className="text-primary/30" />
            </svg>
        ),
        actions: [
            { href: '/dashboard', label: 'Go to Dashboard', primary: true },
            { href: -1, label: 'Go Back', primary: false },
        ],
    },
    404: {
        code: '404',
        title: 'Page Not Found',
        message: "The page you're looking for doesn't exist or has been moved. Check the URL or navigate to a known page.",
        icon: (
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-primary/20" />
                <path d="M22 54l10-28h2l-10 28h-2zm16-28h2l10 28h-2L38 26z" fill="currentColor" className="text-primary/30" />
                <circle cx="40" cy="44" r="8" stroke="currentColor" strokeWidth="2" className="text-primary/40" />
                <path d="M46 50l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary/60" />
                <circle cx="40" cy="44" r="3" fill="currentColor" className="text-primary/40" />
            </svg>
        ),
        actions: [
            { href: '/dashboard', label: 'Go to Dashboard', primary: true },
            { href: -1, label: 'Go Back', primary: false },
        ],
    },
    419: {
        code: '419',
        title: 'Session Expired',
        message: 'Your session has timed out for security reasons. Please log in again to continue.',
        icon: (
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-primary/20" />
                <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <path d="M40 28v13l8 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60" />
                <path d="M54 26l-3 3m3 0l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning" />
            </svg>
        ),
        actions: [
            { href: '/login', label: 'Log In Again', primary: true },
        ],
    },
    500: {
        code: '500',
        title: 'Server Error',
        message: 'Something went wrong on our end. Our team has been notified. Please try again in a few moments.',
        icon: (
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-destructive/20" />
                <path d="M40 24v20M40 52v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-destructive" />
                <path d="M22 58l18-34 18 34H22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-destructive/40" fill="currentColor" fillOpacity="0.06" />
            </svg>
        ),
        actions: [
            { href: '/dashboard', label: 'Try Dashboard', primary: true },
            { href: -1, label: 'Go Back', primary: false },
        ],
    },
    503: {
        code: '503',
        title: 'Service Unavailable',
        message: 'The application is temporarily down for maintenance. We will be back shortly.',
        icon: (
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" className="text-warning/30" />
                <rect x="24" y="32" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="2" className="text-warning/50" />
                <path d="M32 32V28a8 8 0 0 1 16 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning/60" />
                <circle cx="40" cy="42" r="3" fill="currentColor" className="text-warning" />
                <path d="M40 45v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning" />
            </svg>
        ),
        actions: [
            { href: '/', label: 'Try Again', primary: true },
        ],
    },
}

const fallback = {
    code: '???',
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Please try navigating back or going to the dashboard.',
    icon: null,
    actions: [
        { href: '/dashboard', label: 'Go to Dashboard', primary: true },
        { href: -1, label: 'Go Back', primary: false },
    ],
}

/* Animated dots for the background grid */
function GridDots() {
    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden
        >
            <svg width="100%" height="100%" className="opacity-[0.04] dark:opacity-[0.07]">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="currentColor" className="text-foreground" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    )
}

function ActionButton({ action, index }) {
    const base = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    const primary = 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]'
    const secondary = 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]'

    const handleClick = () => {
        if (action.href === -1) window.history.back()
    }

    if (action.href === -1) {
        return (
            <button onClick={handleClick} className={`${base} ${action.primary ? primary : secondary}`}>
                {action.label}
            </button>
        )
    }

    return (
        <Link href={action.href} className={`${base} ${action.primary ? primary : secondary}`}>
            {action.label}
        </Link>
    )
}

export default function Error({ status }) {
    const config = errorConfig[status] ?? fallback

    /* sync dark mode from localStorage */
    useEffect(() => {
        const saved = localStorage.getItem('theme')
        if (saved === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [])

    /* floating animation counter */
    const [tick, setTick] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 50)
        return () => clearInterval(id)
    }, [])
    const y = Math.sin(tick * 0.05) * 8

    return (
        <>
            <Head title={`${config.code} — ${config.title}`} />

            <div className="relative min-h-dvh bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
                <GridDots />

                {/* Gradient blob */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.08] dark:opacity-[0.12] blur-3xl pointer-events-none"
                    style={{ background: 'hsl(var(--primary))' }}
                    aria-hidden
                />

                {/* Card */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Status code — big decorative number */}
                    <div className="mb-2 text-center select-none">
                        <span
                            className="font-black tracking-tighter leading-none"
                            style={{
                                fontSize: 'clamp(80px, 18vw, 140px)',
                                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                opacity: 0.15,
                            }}
                        >
                            {config.code}
                        </span>
                    </div>

                    {/* Icon — floats */}
                    <div
                        className="mx-auto mb-6 w-20 h-20 drop-shadow-sm"
                        style={{ transform: `translateY(${y}px)`, transition: 'transform 0.05s linear' }}
                    >
                        {config.icon}
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">{config.title}</h1>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                            {config.message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {config.actions.map((action, i) => (
                            <ActionButton key={i} action={action} index={i} />
                        ))}
                    </div>

                    {/* Status code pill */}
                    <p className="mt-8 text-center text-[11px] text-muted-foreground/50 font-mono tracking-widest uppercase">
                        HTTP {config.code}
                    </p>
                </div>

                {/* Footer */}
                <p className="absolute bottom-6 text-[11px] text-muted-foreground/40 select-none">
                    AI-FMS &mdash; Enterprise Finance &amp; HR
                </p>
            </div>
        </>
    )
}
