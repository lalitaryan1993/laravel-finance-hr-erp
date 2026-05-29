import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    TrendingUp, BarChart3, PieChart, FileText, DollarSign,
    Building2, CreditCard, Users, Download, ArrowRight, Lock
} from 'lucide-react'

const REPORTS = [
    {
        group: 'Financial Statements',
        items: [
            { icon: TrendingUp,  label: 'Profit & Loss',  desc: 'Revenue, expenses and net profit', href: '/reports/pnl',           color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
            { icon: Building2,   label: 'Balance Sheet',  desc: 'Assets, liabilities and equity',  href: '/reports/balance-sheet',   color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
            { icon: DollarSign,  label: 'Cash Flow',      desc: 'Operating, investing and financing',href: '/reports/cash-flow',       color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
        ]
    },
    {
        group: 'Receivables & Payables',
        items: [
            { icon: FileText,    label: 'Accounts Receivable', desc: 'Outstanding customer payments', href: '/customers/outstanding',  color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
            { icon: CreditCard,  label: 'Accounts Payable',    desc: 'Outstanding vendor payments',   href: '/vendors/payments',       color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
            { icon: BarChart3,   label: 'Aging Report',        desc: 'Overdue invoice analysis',       soon: true,                      color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
        ]
    },
    {
        group: 'Tax & Compliance',
        items: [
            { icon: FileText, label: 'GST Report',     desc: 'GSTR-1 outward supplies',     href: '/tax/gst',     color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30' },
            { icon: FileText, label: 'TDS Report',     desc: 'Tax deducted at source',       href: '/tax/tds',     color: 'text-teal-500 bg-teal-100 dark:bg-teal-900/30' },
            { icon: FileText, label: 'Tax Reports',    desc: 'Consolidated tax overview',    href: '/tax/reports', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' },
        ]
    },
    {
        group: 'Payroll & Expenses',
        items: [
            { icon: Users,    label: 'Payroll Summary',   desc: 'Salary and deduction summary',        href: '/payroll/reports', color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30' },
            { icon: PieChart, label: 'Expense Analysis',  desc: 'Category-wise expense breakdown',     href: '/expenses',        color: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30' },
            { icon: BarChart3, label: 'Financial Reports', desc: 'Year-on-year financial comparison',  href: '/reports/financial', color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
        ]
    },
]

export default function ReportsIndex() {
    return (
        <AppLayout>
            <Head title="Reports" />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Reports</h1>
                        <p className="text-muted-foreground text-sm mt-1">Financial insights and compliance reports</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export All
                    </Button>
                </div>

                {REPORTS.map((group) => (
                    <div key={group.group}>
                        <h2 className="text-base font-semibold mb-3 text-foreground/70">{group.group}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.items.map((report) => (
                                <Card key={report.label}
                                    className={`transition-all ${report.soon ? 'opacity-60' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'}`}
                                    onClick={() => !report.soon && report.href && router.visit(report.href)}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${report.color}`}>
                                                <report.icon className="w-5 h-5" />
                                            </div>
                                            {report.soon
                                                ? <Badge variant="secondary" className="text-xs">Soon</Badge>
                                                : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                        </div>
                                        <div className="font-semibold">{report.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{report.desc}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    )
}
