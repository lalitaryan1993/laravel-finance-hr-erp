<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Budget extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'department_id', 'fiscal_year_id',
        'name', 'budget_type', 'start_date', 'end_date', 'status',
        'total_amount', 'allocated_amount', 'spent_amount', 'remaining_amount',
        'description', 'approved_by', 'approved_at', 'created_by',
    ];

    protected $casts = [
        'start_date'       => 'date',
        'end_date'         => 'date',
        'total_amount'     => 'decimal:4',
        'allocated_amount' => 'decimal:4',
        'spent_amount'     => 'decimal:4',
        'remaining_amount' => 'decimal:4',
        'approved_at'      => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()    { return $this->belongsTo(Company::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function fiscalYear() { return $this->belongsTo(FiscalYear::class); }
    public function lines()      { return $this->hasMany(BudgetLine::class); }

    public function getUtilizationPercentAttribute(): float
    {
        return $this->total_amount > 0
            ? round(($this->spent_amount / $this->total_amount) * 100, 1)
            : 0;
    }
}
