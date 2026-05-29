<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccountingPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'fiscal_year_id', 'name', 'period_number',
        'start_date', 'end_date', 'status', 'is_locked',
        'locked_by', 'locked_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'locked_at'  => 'datetime',
        'is_locked'  => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function lockedBy()
    {
        return $this->belongsTo(User::class, 'locked_by');
    }
}
