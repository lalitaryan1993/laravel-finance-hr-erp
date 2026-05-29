<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'name', 'code', 'branch_type', 'email', 'phone',
        'gst_number', 'address', 'city', 'state', 'country', 'pincode',
        'manager_id', 'is_active', 'is_head_office', 'settings',
    ];

    protected $casts = [
        'is_active'     => 'boolean',
        'is_head_office'=> 'boolean',
        'settings'      => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company() { return $this->belongsTo(Company::class); }
    public function users()   { return $this->hasMany(User::class); }
    public function manager() { return $this->belongsTo(User::class, 'manager_id'); }

    public function scopeActive($q) { return $q->where('is_active', true); }
}
