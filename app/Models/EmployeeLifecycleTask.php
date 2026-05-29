<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeLifecycleTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'employee_id', 'type', 'title', 'description', 'due_date',
        'completed_at', 'completed_by', 'status', 'sort_order',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function employee() { return $this->belongsTo(Employee::class); }
    public function completedBy() { return $this->belongsTo(User::class, 'completed_by'); }
    public function scopeForCompany($query, $companyId) { return $query->where('company_id', $companyId); }
}

