import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlayCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AssetDepreciation({ depreciations = {}, filters = {} }) {
    const list = depreciations.data ?? []
    const [runOpen, setRunOpen] = useState(false)
    const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])
    const [running, setRunning] = useState(false)

    const runDepreciation = () => {
        setRunning(true)
        router.post('/assets/run-depreciation', { as_of_date: asOf }, {
            onFinish: () => { setRunning(false); setRunOpen(false) },
        })
    }

    const filterByYear = (year) => router.get('/assets/depreciation', { year })

    return (
        <AppLayout>
            <Head title="Asset Depreciation" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Asset Depreciation</h1>
                        <p className="text-muted-foreground text-sm mt-1">Depreciation run history and calculations</p>
                    </div>
                    <Button onClick={() => setRunOpen(true)}>
                        <PlayCircle className="w-4 h-4 mr-2" /> Run Depreciation
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Book Value Before</TableHead>
                                    <TableHead className="text-right">Book Value After</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No depreciation records found. Run depreciation to generate entries.
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((d) => (
                                    <TableRow key={d.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="font-medium">{d.asset?.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{d.asset?.asset_code}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground capitalize">{d.method?.replace('_', ' ')}</TableCell>
                                        <TableCell>{formatDate(d.depreciation_date)}</TableCell>
                                        <TableCell className="text-right font-mono text-red-500">{formatCurrency(d.amount)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(d.book_value_before)}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(d.book_value_after)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={runOpen} onOpenChange={setRunOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Run Depreciation</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            This will calculate and record depreciation for all active assets up to the selected date.
                        </p>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">As of Date</label>
                            <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRunOpen(false)}>Cancel</Button>
                            <Button onClick={runDepreciation} loading={running}>Run</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
