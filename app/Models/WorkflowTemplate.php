<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkflowTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'name', 'module', 'description',
        'steps', 'conditions', 'is_active',
    ];

    protected $casts = [
        'steps'      => 'array',
        'conditions' => 'array',
        'is_active'  => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function approvalRequests()
    {
        return $this->hasMany(ApprovalRequest::class);
    }
}
