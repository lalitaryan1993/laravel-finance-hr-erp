<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveAllocation extends Model
{
    protected $fillable = [
        'company_id', 'employee_id', 'leave_type_id', 'year',
        'allocated_days', 'used_days', 'balance_days',
    ];

    protected $casts = [
        'allocated_days' => 'decimal:2',
        'used_days'      => 'decimal:2',
        'balance_days'   => 'decimal:2',
    ];

    public function employee()  { return $this->belongsTo(Employee::class); }
    public function leaveType() { return $this->belongsTo(LeaveType::class); }
    public function company()   { return $this->belongsTo(Company::class); }
}
