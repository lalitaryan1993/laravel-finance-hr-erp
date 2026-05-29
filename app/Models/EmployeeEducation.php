<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeEducation extends Model
{
    use HasFactory;

    protected $table = 'employee_educations';

    protected $fillable = [
        'company_id', 'employee_id', 'qualification', 'institution',
        'field_of_study', 'start_year', 'end_year', 'grade', 'notes',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}
