<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApprovalRequest extends Model
{
    protected $fillable = [
        'uuid', 'company_id', 'workflow_template_id', 'approvable_type', 'approvable_id',
        'module', 'title', 'description', 'amount', 'status', 'current_step', 'total_steps',
        'requested_by', 'current_approver_id', 'escalated_at', 'rejection_reason', 'completed_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:4',
        'escalated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()  { return $this->belongsTo(Company::class); }
    public function approvable(){ return $this->morphTo(); }
    public function requester(){ return $this->belongsTo(User::class, 'requested_by'); }
    public function approver() { return $this->belongsTo(User::class, 'current_approver_id'); }
    public function logs()     { return $this->hasMany(ApprovalLog::class); }

    public function scopePendingFor($q, $userId)
    {
        return $q->where('current_approver_id', $userId)->where('status', 'pending');
    }
}
