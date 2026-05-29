import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileBarChart, TrendingUp, Scale, ArrowRightLeft } from 'lucide-react'

export default function FinancialReports({ year, filters = {} }) {
    const reports = [
        {
            icon: TrendingUp,
            title: 'Profit & Loss',
            description: 'Income, expenses, and net profit for the period',
            href: '/reports/pnl',
            color: 'text-green-500',
        },
        {
            icon: Scale,
            title: 'Balance Sheet',
            description: 'Assets, liabilities, and equity as of a date',
            href: '/reports/balance-sheet',
            color: 'text-blue-500',
        },
        {
            icon: ArrowRightLeft,
            title: 'Cash Flow',
            description: 'Cash inflows and outflows for the period',
            href: '/reports/cash-flow',
            color: 'text-purple-500',
        },
    ]

    return (
        <AppLayout>
            <Head title="Financial Reports" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Financial Reports</h1>
                    <p className="text-muted-foreground text-sm mt-1">Standard financial statements for FY {year}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {reports.map((r) => (
                        <Card key={r.title} className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => router.visit(r.href)}>
                            <CardContent className="p-6 space-y-3">
                                <r.icon className={`w-8 h-8 ${r.color}`} />
                                <div>
                                    <h3 className="font-semibold">{r.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                                </div>
                                <Button variant="outline" size="sm" className="mt-2">View Report</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Trial Balance', href: '/accounting/trial-balance' },
                            { label: 'General Ledger', href: '/accounting/ledger' },
                            { label: 'GST Summary', href: '/tax/gst' },
                            { label: 'TDS Summary', href: '/tax/tds' },
                        ].map((link) => (
                            <Button key={link.label} variant="outline" className="justify-start"
                                onClick={() => router.visit(link.href)}>
                                <FileBarChart className="w-4 h-4 mr-2 text-muted-foreground" />
                                {link.label}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
