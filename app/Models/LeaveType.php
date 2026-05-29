<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = [
        'company_id', 'name', 'code', 'days_per_year', 'carry_forward',
        'carry_forward_max', 'pay_status', 'requires_approval', 'description', 'is_active',
    ];

    protected $casts = [
        'carry_forward'    => 'boolean',
        'requires_approval'=> 'boolean',
        'is_active'        => 'boolean',
    ];

    public function company()      { return $this->belongsTo(Company::class); }
    public function allocations()  { return $this->hasMany(LeaveAllocation::class); }
    public function requests()     { return $this->hasMany(LeaveRequest::class); }

    public function scopeActive($q)           { return $q->where('is_active', true); }
    public function scopeForCompany($q, $id)  { return $q->where('company_id', $id); }
}
