<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SystemNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'type', 'module', 'title', 'message',
        'data', 'read_at', 'action_url', 'action_label',
        'channel', 'is_read', 'notifiable_id', 'notifiable_type',
        'created_by', 'expires_at',
    ];

    protected $casts = [
        'data'       => 'array',
        'read_at'    => 'datetime',
        'expires_at' => 'datetime',
        'is_read'    => 'boolean',
    ];

    public function notifiable()
    {
        return $this->morphTo();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now(), 'is_read' => true]);
    }
}
