import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowRight, Calculator, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_COLORS = {
    gst:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cgst: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    sgst: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    igst: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    tds:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    tcs:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

export default function TaxReports({ taxRates = [], filters = {} }) {
    const [from, setFrom] = useState(filters.from ?? '')
    const [to, setTo]     = useState(filters.to ?? '')
    const [type, setType] = useState(filters.type ?? '')

    function apply() {
        router.get('/tax/reports', { from, to, type }, { preserveState: true })
    }

    const filtered = taxRates.filter(tr => !type || tr.type?.toLowerCase() === type.toLowerCase())

    const quickLinks = [
        { label: 'GST Module',       desc: 'Output vs input GST reconciliation', href: '/tax/gst',      color: 'text-blue-600 dark:text-blue-400',   icon: FileText },
        { label: 'TDS Module',        desc: 'TDS deducted & collected summary',   href: '/tax/tds',      color: 'text-orange-600 dark:text-orange-400', icon: FileText },
        { label: 'Tax Configuration', desc: 'Manage GST, TDS & TCS rates',        href: '/tax/settings', color: 'text-muted-foreground',               icon: Settings },
    ]

    return (
        <AppLayout>
            <Head title="Tax Reports" />
            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold">Tax Reports</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Overview of configured tax rates and quick access to tax modules</p>
                </div>

                {/* Quick navigation */}
                <div className="grid grid-cols-3 gap-4">
                    {quickLinks.map(l => (
                        <Card key={l.href} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                            onClick={() => router.visit(l.href)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                        <l.icon className={cn('w-4 h-4', l.color)} />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="font-semibold">{l.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">{l.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter bar */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">From</label>
                                <DatePicker value={from} onChange={setFrom} placeholder="Start date" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">To</label>
                                <DatePicker value={to} onChange={setTo} placeholder="End date" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Type</label>
                                <select value={type} onChange={e => setType(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                    <option value="">All Types</option>
                                    {['gst', 'cgst', 'sgst', 'igst', 'tds', 'tcs'].map(t => (
                                        <option key={t} value={t}>{t.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={apply}>Apply</Button>
                            {(from || to || type) && (
                                <Button variant="ghost" onClick={() => { setFrom(''); setTo(''); setType('') }}>Clear</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Active tax rates table */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-muted-foreground" />
                                Active Tax Rates
                                {type && <Badge variant="outline" className="text-xs ml-1">{type.toUpperCase()}</Badge>}
                            </CardTitle>
                            <Badge variant="secondary">{filtered.length} rate{filtered.length !== 1 ? 's' : ''}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/30 border-b">
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Name</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Type</th>
                                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">Rate</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">HSN / SAC</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase">GST Split</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(tr => {
                                    const t = tr.type?.toLowerCase()
                                    return (
                                        <tr key={tr.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{tr.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                                    TYPE_COLORS[t] ?? 'bg-muted text-muted-foreground')}>
                                                    {tr.type?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold">
                                                {parseFloat(tr.rate).toFixed(2)}<span className="text-muted-foreground text-xs font-normal ml-0.5">%</span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tr.hsn_sac_code || '—'}</td>
                                            <td className="px-4 py-3">
                                                {t === 'gst' ? (
                                                    <div className="flex gap-1.5 text-xs">
                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-mono">
                                                            CGST {(parseFloat(tr.rate) / 2).toFixed(2)}%
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 font-mono">
                                                            SGST {(parseFloat(tr.rate) / 2).toFixed(2)}%
                                                        </span>
                                                    </div>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                            No active tax rates{type ? ` of type ${type.toUpperCase()}` : ''}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
