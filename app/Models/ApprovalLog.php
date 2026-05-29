<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalLog extends Model
{
    protected $fillable = ['approval_request_id', 'approver_id', 'step', 'action', 'comment', 'metadata', 'acted_at'];
    protected $casts = ['metadata' => 'array', 'acted_at' => 'datetime'];

    public function approvalRequest() { return $this->belongsTo(ApprovalRequest::class); }
    public function approver()        { return $this->belongsTo(User::class, 'approver_id'); }
}
