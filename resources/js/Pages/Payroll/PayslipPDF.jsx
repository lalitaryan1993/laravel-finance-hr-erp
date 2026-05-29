import { Head } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, ArrowLeft } from 'lucide-react'
import { router } from '@inertiajs/react'
import { formatCurrency } from '@/lib/utils'

export default function PayslipPDF({ payslip }) {
    const emp = payslip.employee ?? {}
    const dept = emp.department ?? {}

    return (
        <AppLayout>
            <Head title={`Payslip — ${emp.full_name} — ${payslip.month}`} />
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center gap-3 print:hidden">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/payroll/payslips')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">Salary Slip</h2>
                                <p className="text-muted-foreground text-sm">For the month of {payslip.month}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <p>Payslip ID: #{payslip.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                            <div>
                                <p className="text-xs text-muted-foreground">Employee Name</p>
                                <p className="font-semibold">{emp.full_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Employee Code</p>
                                <p className="font-mono">{emp.employee_code ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Department</p>
                                <p>{dept.name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Designation</p>
                                <p>{emp.designation ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">PAN Number</p>
                                <p className="font-mono">{emp.pan_number ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Bank Account</p>
                                <p className="font-mono">{emp.bank_account_number ? `****${emp.bank_account_number.slice(-4)}` : '—'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Earnings</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Basic Salary</span>
                                        <span className="font-mono">{formatCurrency(payslip.basic_salary)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Gross Salary</span>
                                        <span className="font-mono">{formatCurrency(payslip.gross_earnings)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Deductions</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Provident Fund (12%)</span>
                                        <span className="font-mono text-red-500">{formatCurrency(payslip.employee_pf)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Professional Tax</span>
                                        <span className="font-mono text-red-500">{formatCurrency(payslip.professional_tax)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-semibold">
                                        <span>Total Deductions</span>
                                        <span className="font-mono text-red-500">{formatCurrency(payslip.total_deductions)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-primary text-primary-foreground rounded-lg p-4">
                            <span className="text-lg font-bold">Net Pay</span>
                            <span className="text-2xl font-bold font-mono">{formatCurrency(payslip.net_pay)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
