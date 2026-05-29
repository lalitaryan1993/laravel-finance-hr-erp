<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PayrollRun extends Model
{
    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'run_number', 'month',
        'pay_period_start', 'pay_period_end', 'payment_date', 'status',
        'total_gross', 'total_deductions', 'total_net', 'total_employer_pf',
        'total_employer_esi', 'employee_count', 'journal_id', 'approved_by',
        'approved_at', 'created_by', 'notes',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end'   => 'date',
        'payment_date'     => 'date',
        'total_gross'      => 'decimal:4',
        'total_deductions' => 'decimal:4',
        'total_net'        => 'decimal:4',
        'approved_at'      => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()  { return $this->belongsTo(Company::class); }
    public function payslips() { return $this->hasMany(Payslip::class); }
    public function journal()  { return $this->belongsTo(Journal::class); }
}
