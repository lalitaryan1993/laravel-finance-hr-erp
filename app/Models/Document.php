<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'uuid', 'title', 'description', 'file_name',
        'file_path', 'file_size', 'mime_type', 'category',
        'documentable_type', 'documentable_id', 'uploaded_by',
        'is_public', 'tags', 'expires_at',
    ];

    protected $casts = [
        'is_public'  => 'boolean',
        'tags'       => 'array',
        'expires_at' => 'datetime',
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

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function documentable()
    {
        return $this->morphTo();
    }
}
