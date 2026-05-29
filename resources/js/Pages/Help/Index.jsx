import { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    HelpCircle, BookOpen, MessageSquare, Mail, ChevronDown, ChevronRight,
    Zap, Shield, FileText, DollarSign, BarChart3, Bot, Settings, Users,
} from 'lucide-react'

const faqs = [
    {
        category: 'Getting Started',
        icon: Zap,
        items: [
            {
                q: 'How do I set up my company?',
                a: 'Go to Settings → Company tab and fill in your company name, GST number, PAN, address, and financial year settings. Click "Save Settings" when done.',
            },
            {
                q: 'How do I invite team members?',
                a: 'Navigate to Settings → Users & Roles. Click "Add User", enter their email and assign a role. They will receive an email with login credentials.',
            },
            {
                q: 'What roles are available?',
                a: 'AI-FMS includes 12 pre-built roles: Super Admin, Company Owner, Admin, Finance Manager, Accountant, Auditor, HR Manager, Branch Manager, Tax Consultant, Employee, Vendor, and Customer. Each role has specific permissions.',
            },
        ],
    },
    {
        category: 'Accounting & Invoicing',
        icon: FileText,
        items: [
            {
                q: 'How do I create a sales invoice?',
                a: 'Go to Invoicing → Sales Invoices → New Invoice. Select a customer, add line items, apply GST/TDS if applicable, and click Save. You can preview a PDF before sending.',
            },
            {
                q: 'How do I record a journal entry?',
                a: 'Navigate to Accounting → Journal Entries → New Entry. Add debit and credit lines ensuring they balance to zero, then post the entry.',
            },
            {
                q: 'How does GST calculation work?',
                a: 'GST is automatically calculated on invoice line items based on the tax rate you set per item. CGST + SGST are applied for intra-state, IGST for inter-state transactions.',
            },
        ],
    },
    {
        category: 'Payroll & HR',
        icon: DollarSign,
        items: [
            {
                q: 'How do I process monthly payroll?',
                a: 'Go to Payroll & HR → Process Payroll. Select the month, verify attendance and leave deductions, review salary breakdowns, and click "Run Payroll". Payslips are generated automatically.',
            },
            {
                q: 'How do I add an employee?',
                a: 'Navigate to Payroll & HR → Employees → Add Employee. Fill in the 9-tab employee dossier including personal details, documents, education, experience, and banking info.',
            },
            {
                q: 'How do leave allocations work?',
                a: 'Set leave types under Leave Types, then allocate days per employee under Leave Allocations. Employees can apply for leave which goes through an approval workflow.',
            },
        ],
    },
    {
        category: 'Reports & AI',
        icon: BarChart3,
        items: [
            {
                q: 'What financial reports are available?',
                a: 'AI-FMS generates Profit & Loss, Balance Sheet, Cash Flow statements, Trial Balance, and General Ledger reports. All can be exported to Excel.',
            },
            {
                q: 'How does the AI Assistant work?',
                a: 'The AI Assistant (powered by OpenAI) can answer questions about your financial data, generate forecasts, detect anomalies, and help with analysis. Requires an OpenAI API key in settings.',
            },
            {
                q: 'Can I export data to Excel?',
                a: 'Yes. Most report pages have an "Export" button that downloads data as an Excel (.xlsx) file. Available for P&L, Balance Sheet, Cash Flow, and payroll reports.',
            },
        ],
    },
    {
        category: 'Security & Access',
        icon: Shield,
        items: [
            {
                q: 'How do I change my password?',
                a: 'Go to your Profile (click your name in the top right) and use the "Change Password" section. Enter your current password and set a new one.',
            },
            {
                q: 'How do I manage role permissions?',
                a: 'Go to Settings → Permissions. You can view and modify which permissions each role has. Changes take effect immediately on the next page load.',
            },
            {
                q: 'Is data isolated between companies?',
                a: 'Yes. AI-FMS is multi-tenant — all financial data, employees, and settings are scoped to the company. Users can only see data belonging to their assigned company.',
            },
        ],
    },
]

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border-b last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:text-primary transition-colors"
            >
                {q}
                {open
                    ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                }
            </button>
            {open && (
                <p className="pb-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            )}
        </div>
    )
}

const quickLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Zap, desc: 'Overview & KPIs' },
    { label: 'Employees', href: '/payroll/employees', icon: Users, desc: 'HR dossiers' },
    { label: 'Invoices', href: '/invoices/sales', icon: FileText, desc: 'Sales & purchases' },
    { label: 'Reports', href: '/reports/pnl', icon: BarChart3, desc: 'Financial statements' },
    { label: 'AI Assistant', href: '/ai', icon: Bot, desc: 'Ask anything' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Company config' },
]

export default function HelpIndex() {
    return (
        <AppLayout>
            <Head title="Help & Support" />
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            Help & Support
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Frequently asked questions and quick navigation
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">v1.0</Badge>
                </div>

                {/* Quick Links */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {quickLinks.map(link => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent hover:border-primary/30 transition-colors group"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <link.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{link.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ sections */}
                {faqs.map(section => (
                    <Card key={section.category}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <section.icon className="w-4 h-4 text-primary" />
                                {section.category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {section.items.map(item => (
                                <FaqItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {/* Contact */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Still need help?</p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Check the project README or open an issue on GitHub for bug reports and feature requests.
                                </p>
                            </div>
                            <a
                                href="mailto:support@ai-fms.com"
                                className="flex items-center gap-2 text-sm text-primary hover:underline shrink-0"
                            >
                                <Mail className="w-4 h-4" />
                                Contact Support
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
