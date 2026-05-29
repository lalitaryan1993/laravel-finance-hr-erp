<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'employee_id', 'asset_name', 'asset_code', 'category',
        'issued_on', 'return_due_on', 'returned_on', 'condition_issued',
        'condition_returned', 'status', 'notes',
    ];

    protected $casts = [
        'issued_on' => 'date',
        'return_due_on' => 'date',
        'returned_on' => 'date',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}

