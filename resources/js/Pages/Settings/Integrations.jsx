import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
    CreditCard, Mail, MessageCircle, Cloud, BookOpen, FileCheck, Users,
    Phone, Zap, Building2, Search, CheckCircle2, XCircle, ExternalLink,
    FlaskConical, Loader2, ShoppingBag, Truck, Globe, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Integration catalogue ────────────────────────────────────────────────── */
const INTEGRATIONS = [
    // ── Payments ──────────────────────────────────────────────────────────────
    {
        key: 'razorpay',
        name: 'Razorpay',
        description: 'Accept payments via UPI, cards, netbanking and wallets. Auto-sync payment status with invoices.',
        category: 'Payments',
        icon: CreditCard,
        iconBg: 'bg-blue-500',
        available: true,
        docs: 'https://razorpay.com/docs/payments/payment-gateway/web-integration/',
        fields: [
            { key: 'mode',           label: 'Mode',           type: 'select',   options: ['test', 'live'],  required: true  },
            { key: 'key_id',         label: 'Key ID',         type: 'text',     placeholder: 'rzp_test_…', required: true  },
            { key: 'key_secret',     label: 'Key Secret',     type: 'password', placeholder: '••••••••',   required: true  },
            { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'optional'                    },
        ],
    },
    {
        key: 'stripe',
        name: 'Stripe',
        description: 'International payment processing — cards, bank transfers, and subscriptions in 135+ currencies.',
        category: 'Payments',
        icon: CreditCard,
        iconBg: 'bg-indigo-500',
        available: true,
        docs: 'https://stripe.com/docs/api',
        fields: [
            { key: 'mode',              label: 'Mode',             type: 'select',   options: ['test', 'live'], required: true },
            { key: 'publishable_key',   label: 'Publishable Key',  type: 'text',     placeholder: 'pk_test_…', required: true },
            { key: 'secret_key',        label: 'Secret Key',       type: 'password', placeholder: 'sk_test_…', required: true },
            { key: 'webhook_secret',    label: 'Webhook Secret',   type: 'password', placeholder: 'whsec_…'                  },
        ],
    },
    {
        key: 'paypal',
        name: 'PayPal',
        description: 'Accept PayPal payments from customers worldwide. Supports sandbox and live environments.',
        category: 'Payments',
        icon: Globe,
        iconBg: 'bg-sky-500',
        available: true,
        docs: 'https://developer.paypal.com/docs/api/overview/',
        fields: [
            { key: 'mode',          label: 'Mode',          type: 'select',   options: ['sandbox', 'live'], required: true },
            { key: 'client_id',     label: 'Client ID',     type: 'text',     placeholder: 'AV…',          required: true },
            { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••',     required: true },
        ],
    },

    // ── Communication ──────────────────────────────────────────────────────────
    {
        key: 'smtp',
        name: 'SMTP Email',
        description: 'Send invoices, reminders and notifications via your own email server or provider.',
        category: 'Communication',
        icon: Mail,
        iconBg: 'bg-emerald-500',
        available: true,
        docs: null,
        fields: [
            { key: 'host',        label: 'SMTP Host',       type: 'text',     placeholder: 'smtp.gmail.com',  required: true  },
            { key: 'port',        label: 'Port',            type: 'number',   placeholder: '587',             required: true  },
            { key: 'encryption',  label: 'Encryption',      type: 'select',   options: ['tls', 'ssl', 'none']               },
            { key: 'username',    label: 'Username',        type: 'text',     placeholder: 'you@example.com', required: true  },
            { key: 'password',    label: 'Password',        type: 'password', placeholder: '••••••••',        required: true  },
            { key: 'from_name',   label: 'From Name',       type: 'text',     placeholder: 'ACME Finance'                   },
            { key: 'from_email',  label: 'From Email',      type: 'email',    placeholder: 'finance@acme.com'               },
        ],
    },
    {
        key: 'sendgrid',
        name: 'SendGrid',
        description: 'Deliver transactional emails at scale with detailed delivery analytics and templates.',
        category: 'Communication',
        icon: Mail,
        iconBg: 'bg-teal-500',
        available: true,
        docs: 'https://docs.sendgrid.com/',
        fields: [
            { key: 'api_key',     label: 'API Key',     type: 'password', placeholder: 'SG.…',            required: true },
            { key: 'from_name',   label: 'From Name',   type: 'text',     placeholder: 'ACME Finance'                  },
            { key: 'from_email',  label: 'From Email',  type: 'email',    placeholder: 'finance@acme.com'              },
        ],
    },
    {
        key: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Send invoice PDFs, payment reminders and approval requests via WhatsApp Business API.',
        category: 'Communication',
        icon: MessageCircle,
        iconBg: 'bg-green-500',
        available: true,
        docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api/',
        fields: [
            { key: 'phone_number_id',       label: 'Phone Number ID',        type: 'text',     placeholder: '1234567890', required: true },
            { key: 'business_account_id',   label: 'Business Account ID',    type: 'text',     placeholder: '9876543210'               },
            { key: 'access_token',          label: 'Permanent Access Token', type: 'password', placeholder: 'EAA…',       required: true },
        ],
    },
    {
        key: 'twilio',
        name: 'Twilio SMS',
        description: 'Send SMS alerts for payment due, invoice creation, and expense approvals.',
        category: 'Communication',
        icon: Phone,
        iconBg: 'bg-red-500',
        available: true,
        docs: 'https://www.twilio.com/docs/sms',
        fields: [
            { key: 'account_sid', label: 'Account SID',  type: 'text',     placeholder: 'AC…',           required: true },
            { key: 'auth_token',  label: 'Auth Token',   type: 'password', placeholder: '••••••••',      required: true },
            { key: 'from_number', label: 'From Number',  type: 'text',     placeholder: '+1234567890',   required: true },
        ],
    },

    // ── Banking ───────────────────────────────────────────────────────────────
    {
        key: 'bank_aggregator',
        name: 'Account Aggregator',
        description: "Auto-import bank statements via India's RBI-regulated Account Aggregator framework.",
        category: 'Banking',
        icon: Building2,
        iconBg: 'bg-violet-500',
        available: false,
        comingSoon: true,
    },
    {
        key: 'plaid',
        name: 'Plaid',
        description: 'Connect US/Canada bank accounts for automatic transaction imports and reconciliation.',
        category: 'Banking',
        icon: Building2,
        iconBg: 'bg-amber-500',
        available: false,
        comingSoon: true,
    },

    // ── Storage ───────────────────────────────────────────────────────────────
    {
        key: 's3',
        name: 'Amazon S3',
        description: 'Store invoice PDFs, expense attachments and exports in your own S3 bucket.',
        category: 'Storage',
        icon: Cloud,
        iconBg: 'bg-orange-500',
        available: true,
        docs: 'https://docs.aws.amazon.com/s3/',
        fields: [
            { key: 'access_key',  label: 'Access Key ID',       type: 'text',     placeholder: 'AKIA…',        required: true },
            { key: 'secret_key',  label: 'Secret Access Key',   type: 'password', placeholder: '••••••••',     required: true },
            { key: 'region',      label: 'Region',              type: 'text',     placeholder: 'ap-south-1',   required: true },
            { key: 'bucket',      label: 'Bucket Name',         type: 'text',     placeholder: 'my-fms-bucket', required: true },
            { key: 'url',         label: 'Custom CDN URL',      type: 'url',      placeholder: 'https://cdn.example.com'     },
        ],
    },
    {
        key: 'gcs',
        name: 'Google Cloud Storage',
        description: 'Use Google Cloud Storage buckets for document storage and backups.',
        category: 'Storage',
        icon: Cloud,
        iconBg: 'bg-blue-400',
        available: true,
        docs: 'https://cloud.google.com/storage/docs',
        fields: [
            { key: 'project_id',       label: 'Project ID',         type: 'text',     placeholder: 'my-gcp-project', required: true },
            { key: 'bucket',           label: 'Bucket Name',        type: 'text',     placeholder: 'my-fms-bucket',  required: true },
            { key: 'credentials_json', label: 'Service Account JSON', type: 'textarea', placeholder: '{ "type": "service_account", … }', required: true },
        ],
    },

    // ── Accounting / ERP ──────────────────────────────────────────────────────
    {
        key: 'tally',
        name: 'Tally Prime',
        description: 'Export journals, vouchers and accounts to Tally via XML. Supports Tally Prime 3.x+.',
        category: 'Accounting',
        icon: BookOpen,
        iconBg: 'bg-yellow-500',
        available: true,
        docs: null,
        fields: [
            { key: 'host', label: 'Tally Host', type: 'text',   placeholder: 'localhost or 192.168.x.x', required: true },
            { key: 'port', label: 'Port',       type: 'number', placeholder: '9000',                     required: true },
            { key: 'company_name', label: 'Tally Company Name', type: 'text', placeholder: 'My Company Pvt Ltd' },
        ],
    },
    {
        key: 'zoho_books',
        name: 'Zoho Books',
        description: 'Sync contacts, invoices and payments with Zoho Books for cross-platform accounting.',
        category: 'Accounting',
        icon: BookOpen,
        iconBg: 'bg-red-400',
        available: false,
        comingSoon: true,
    },

    // ── Tax / Compliance ──────────────────────────────────────────────────────
    {
        key: 'gst_portal',
        name: 'GST Portal (GSTN)',
        description: 'File GSTR-1, GSTR-3B returns and generate e-invoices directly via GSTN API.',
        category: 'Compliance',
        icon: FileCheck,
        iconBg: 'bg-rose-500',
        available: false,
        comingSoon: true,
    },
    {
        key: 'eway_bill',
        name: 'E-Way Bill',
        description: 'Generate and cancel e-Way bills for goods movement above ₹50,000.',
        category: 'Compliance',
        icon: Truck,
        iconBg: 'bg-pink-500',
        available: false,
        comingSoon: true,
    },

    // ── HR / Payroll ──────────────────────────────────────────────────────────
    {
        key: 'greythr',
        name: 'greytHR',
        description: 'Sync employee data, attendance and leave balances from greytHR for payroll processing.',
        category: 'HR',
        icon: Users,
        iconBg: 'bg-cyan-500',
        available: false,
        comingSoon: true,
    },
]

const CATEGORIES = ['All', 'Payments', 'Communication', 'Banking', 'Storage', 'Accounting', 'Compliance', 'HR']

/* ─── Config dialog ─────────────────────────────────────────────────────────── */
function ConfigDialog({ integration, config, open, onClose }) {
    const [form,    setForm]    = useState(() => buildForm(integration, config))
    const [saving,  setSaving]  = useState(false)
    const [testing, setTesting] = useState(false)

    function buildForm(intg, cfg) {
        if (!intg) return {}
        return Object.fromEntries(
            (intg.fields ?? []).map(f => [f.key, cfg?.[f.key] ?? ''])
        )
    }

    // Reset form when integration changes
    useMemo(() => {
        setForm(buildForm(integration, config))
    }, [integration?.key, config])

    const save = () => {
        setSaving(true)
        router.put(`/settings/integrations/${integration.key}`, form, {
            preserveScroll: true,
            onFinish: () => { setSaving(false); onClose() },
        })
    }

    const test = () => {
        setTesting(true)
        router.post(`/settings/integrations/${integration.key}/test`, form, {
            preserveScroll: true,
            onFinish: () => setTesting(false),
        })
    }

    if (!integration) return null

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', integration.iconBg)}>
                            <integration.icon className="w-4 h-4 text-white" />
                        </div>
                        Configure {integration.name}
                    </DialogTitle>
                    <DialogDescription>{integration.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {(integration.fields ?? []).map(field => (
                        <div key={field.key} className="space-y-1.5">
                            <label className="text-sm font-medium">
                                {field.label}
                                {field.required && <span className="text-destructive ml-0.5">*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    value={form[field.key] ?? ''}
                                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    {(field.options ?? []).map(opt => (
                                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={form[field.key] ?? ''}
                                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                    rows={4} placeholder={field.placeholder}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                            ) : (
                                <Input
                                    type={field.type}
                                    value={form[field.key] ?? ''}
                                    placeholder={field.placeholder}
                                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
                            )}
                        </div>
                    ))}
                </div>

                {integration.docs && (
                    <a href={integration.docs} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View API documentation
                    </a>
                )}

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={test} disabled={testing || saving}>
                        {testing
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Testing…</>
                            : <><FlaskConical className="w-3.5 h-3.5 mr-1.5" />Test Connection</>
                        }
                    </Button>
                    <Button type="button" size="sm" onClick={save} disabled={saving || testing}>
                        {saving
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                            : 'Save Configuration'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ─── Integration card ──────────────────────────────────────────────────────── */
function IntegrationCard({ integration, config, onConfigure }) {
    const enabled = config?.enabled === true
    const isConfigured = config && Object.keys(config).some(k => k !== 'enabled' && config[k])

    const toggleEnabled = () => {
        router.put(`/settings/integrations/${integration.key}`, { enabled: !enabled }, {
            preserveScroll: true,
        })
    }

    return (
        <Card className={cn(
            'transition-all duration-200',
            enabled && 'ring-1 ring-primary/20 border-primary/30',
        )}>
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        integration.iconBg,
                        !integration.available && 'opacity-50',
                    )}>
                        <integration.icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{integration.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                {integration.category}
                            </Badge>
                            {integration.comingSoon && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Coming Soon</Badge>
                            )}
                            {isConfigured && !integration.comingSoon && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Configured
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{integration.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col items-end gap-3">
                        {integration.comingSoon ? (
                            <Badge variant="secondary" className="text-xs">Soon</Badge>
                        ) : (
                            <>
                                <Switch
                                    checked={enabled}
                                    onCheckedChange={toggleEnabled}
                                    aria-label={`Toggle ${integration.name}`} />
                                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5"
                                    onClick={() => onConfigure(integration)}>
                                    Configure
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status bar */}
                {!integration.comingSoon && (
                    <div className={cn(
                        'mt-4 flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5',
                        enabled
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-muted/60 text-muted-foreground',
                    )}>
                        {enabled
                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                            : <XCircle className="w-3.5 h-3.5" />
                        }
                        {enabled ? 'Active — receiving data and events' : 'Disabled — not processing any events'}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function SettingsIntegrations({ configs = {} }) {
    const [search,   setSearch]   = useState('')
    const [category, setCategory] = useState('All')
    const [dialogIntg, setDialogIntg] = useState(null)

    const filtered = useMemo(() => {
        return INTEGRATIONS.filter(intg => {
            const matchCat  = category === 'All' || intg.category === category
            const matchSrch = !search ||
                intg.name.toLowerCase().includes(search.toLowerCase()) ||
                intg.description.toLowerCase().includes(search.toLowerCase())
            return matchCat && matchSrch
        })
    }, [search, category])

    const connected = INTEGRATIONS.filter(i => configs[i.key]?.enabled).length
    const total     = INTEGRATIONS.filter(i => !i.comingSoon).length

    return (
        <AppLayout>
            <Head title="Integrations" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Integrations</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Connect third-party services to extend functionality
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold tabular-nums">{connected}<span className="text-muted-foreground text-base font-normal">/{total}</span></p>
                        <p className="text-xs text-muted-foreground">active integrations</p>
                    </div>
                </div>

                {/* Search + Category tabs */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input placeholder="Search integrations…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9" />
                    </div>
                    <Tabs value={category} onValueChange={setCategory}>
                        <TabsList className="h-9 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <TabsTrigger key={cat} value={cat} className="text-xs px-2.5">
                                    {cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No integrations found</p>
                        <p className="text-xs mt-1">Try a different search term or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map(intg => (
                            <IntegrationCard
                                key={intg.key}
                                integration={intg}
                                config={configs[intg.key]}
                                onConfigure={setDialogIntg} />
                        ))}
                    </div>
                )}

                {/* Config dialog */}
                <ConfigDialog
                    integration={dialogIntg}
                    config={dialogIntg ? configs[dialogIntg.key] : null}
                    open={!!dialogIntg}
                    onClose={() => setDialogIntg(null)} />

            </div>
        </AppLayout>
    )
}
