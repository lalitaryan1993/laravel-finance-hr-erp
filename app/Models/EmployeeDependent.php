<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDependent extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'employee_id', 'name', 'relationship', 'date_of_birth',
        'phone', 'is_nominee', 'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_nominee' => 'boolean',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}

