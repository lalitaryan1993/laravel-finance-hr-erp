<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeEmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'employee_id', 'name', 'relationship', 'phone',
        'alternate_phone', 'email', 'address', 'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}

