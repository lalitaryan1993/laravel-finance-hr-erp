<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'employee_id', 'employer_name', 'job_title',
        'start_date', 'end_date', 'location', 'responsibilities',
        'last_salary', 'reason_for_leaving',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'last_salary' => 'decimal:4',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}

