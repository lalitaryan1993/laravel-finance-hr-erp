<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'uuid', 'company_id', 'branch_id',
        'phone', 'avatar', 'employee_id', 'designation', 'department',
        'date_of_joining', 'status', 'two_factor_enabled', 'two_factor_secret',
        'timezone', 'locale', 'currency', 'last_login_at', 'last_login_ip',
        'is_active', 'preferences', 'notification_preferences',
    ];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret'];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'two_factor_enabled' => 'boolean',
            'is_active'          => 'boolean',
            'last_login_at'      => 'datetime',
            'date_of_joining'    => 'date',
            'preferences'        => 'array',
            'notification_preferences' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()  { return $this->belongsTo(Company::class); }
    public function branch()   { return $this->belongsTo(Branch::class); }
    public function employee() { return $this->hasOne(Employee::class); }

    public function getInitialsAttribute(): string
    {
        return collect(explode(' ', $this->name))
            ->take(2)->map(fn ($w) => strtoupper($w[0] ?? ''))->implode('');
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    public function isSuperAdmin(): bool { return $this->hasRole('super-admin'); }
    public function isCompanyOwner(): bool { return $this->hasRole('company-owner'); }
}
