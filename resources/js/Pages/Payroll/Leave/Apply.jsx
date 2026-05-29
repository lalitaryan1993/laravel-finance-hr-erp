import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAY_BADGE = {
    paid:      'bg-emerald-100 text-emerald-700',
    unpaid:    'bg-red-100 text-red-700',
    half_paid: 'bg-yellow-100 text-yellow-700',
};

function calcWeekdays(from, to) {
    if (!from || !to) return 0;
    let count = 0;
    const d = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    while (d <= end) {
        if (d.getDay() !== 0 && d.getDay() !== 6) count++;
        d.setDate(d.getDate() + 1);
    }
    return count;
}

export default function LeaveApply({ employees, types }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:   '',
        leave_type_id: '',
        from_date:     '',
        to_date:       '',
        reason:        '',
    });

    const selectedType = types.find(t => String(t.id) === String(data.leave_type_id));
    const days = calcWeekdays(data.from_date, data.to_date);

    function submit(e) {
        e.preventDefault();
        post('/payroll/leave');
    }

    return (
        <AppLayout>
            <Head title="Apply Leave" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Apply for Leave</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Submit a new leave request</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Leave Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Employee <span className="text-destructive">*</span></Label>
                                <Select value={data.employee_id} onValueChange={v => setData('employee_id', v)}>
                                    <SelectTrigger className={errors.employee_id && 'border-destructive'}>
                                        <SelectValue placeholder="Select employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(e => (
                                            <SelectItem key={e.id} value={String(e.id)}>
                                                {e.first_name} {e.last_name}
                                                <span className="text-muted-foreground ml-2 text-xs">({e.employee_code})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && <p className="text-xs text-destructive">{errors.employee_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Leave Type <span className="text-destructive">*</span></Label>
                                <Select value={data.leave_type_id} onValueChange={v => setData('leave_type_id', v)}>
                                    <SelectTrigger className={errors.leave_type_id && 'border-destructive'}>
                                        <SelectValue placeholder="Select leave type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                <div className="flex items-center gap-2">
                                                    <span>{t.name}</span>
                                                    <span className="font-mono text-xs text-muted-foreground">({t.code})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.leave_type_id && <p className="text-xs text-destructive">{errors.leave_type_id}</p>}
                            </div>

                            {/* Selected type info card */}
                            {selectedType && (
                                <div className="rounded-lg bg-muted/50 border p-3 text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-medium">{selectedType.name}</span>
                                        <Badge className={PAY_BADGE[selectedType.pay_status]}>
                                            {selectedType.pay_status.replace('_', ' ')}
                                        </Badge>
                                        {selectedType.requires_approval && (
                                            <Badge variant="outline" className="text-xs">Requires approval</Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-xs">
                                        {selectedType.days_per_year} days/year
                                        {selectedType.carry_forward && ` · Carry forward: ${selectedType.carry_forward_max ?? 'unlimited'} days`}
                                    </p>
                                    {selectedType.description && (
                                        <p className="text-muted-foreground text-xs mt-1">{selectedType.description}</p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>From Date <span className="text-destructive">*</span></Label>
                                    <Input type="date" value={data.from_date}
                                        onChange={e => setData('from_date', e.target.value)}
                                        className={errors.from_date && 'border-destructive'} />
                                    {errors.from_date && <p className="text-xs text-destructive">{errors.from_date}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>To Date <span className="text-destructive">*</span></Label>
                                    <Input type="date" value={data.to_date} min={data.from_date}
                                        onChange={e => setData('to_date', e.target.value)}
                                        className={errors.to_date && 'border-destructive'} />
                                    {errors.to_date && <p className="text-xs text-destructive">{errors.to_date}</p>}
                                </div>
                            </div>

                            {/* Days preview */}
                            {days > 0 && (
                                <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{days} working day{days !== 1 ? 's' : ''}</p>
                                        <p className="text-xs text-muted-foreground">Weekends excluded</p>
                                    </div>
                                </div>
                            )}

                            {errors.days && (
                                <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {errors.days}
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <Label>Reason</Label>
                                <Textarea
                                    placeholder="Optional reason for leave..."
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <Link href="/payroll/leave">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Leave Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
