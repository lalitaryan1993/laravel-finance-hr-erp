<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'company_id', 'employee_id', 'leave_type_id', 'from_date', 'to_date',
        'days', 'reason', 'status', 'rejection_reason', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'from_date'   => 'date',
        'to_date'     => 'date',
        'days'        => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function employee()   { return $this->belongsTo(Employee::class); }
    public function leaveType()  { return $this->belongsTo(LeaveType::class); }
    public function company()    { return $this->belongsTo(Company::class); }
    public function approver()   { return $this->belongsTo(User::class, 'approved_by'); }

    public function scopePending($q)          { return $q->where('status', 'pending'); }
    public function scopeForCompany($q, $id)  { return $q->where('company_id', $id); }
}
