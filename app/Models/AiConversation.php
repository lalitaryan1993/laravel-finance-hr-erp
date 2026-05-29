<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class AiConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'uuid', 'title', 'messages',
        'token_usage', 'model', 'is_archived',
    ];

    protected $casts = [
        'messages'    => 'array',
        'is_archived' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid ??= Str::uuid());
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
