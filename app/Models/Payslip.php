<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payslip extends Model
{
    protected $fillable = [
        'uuid', 'payroll_run_id', 'employee_id', 'company_id', 'payslip_number',
        'month', 'pay_period_start', 'pay_period_end', 'working_days', 'present_days',
        'lop_days', 'basic_salary', 'hra', 'earnings', 'deductions', 'gross_earnings',
        'total_deductions', 'net_pay', 'employee_pf', 'employer_pf', 'employee_esi',
        'employer_esi', 'professional_tax', 'tds', 'bonus', 'status', 'pdf_path', 'sent_at',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end'   => 'date',
        'basic_salary'     => 'decimal:4',
        'gross_earnings'   => 'decimal:4',
        'total_deductions' => 'decimal:4',
        'net_pay'          => 'decimal:4',
        'earnings'         => 'array',
        'deductions'       => 'array',
        'sent_at'          => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function payrollRun() { return $this->belongsTo(PayrollRun::class); }
    public function employee()   { return $this->belongsTo(Employee::class); }
    public function company()    { return $this->belongsTo(Company::class); }
}
