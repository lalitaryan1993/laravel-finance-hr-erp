<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BankAccount extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'account_name', 'account_number',
        'account_type', 'bank_name', 'branch_name', 'ifsc_code', 'swift_code',
        'currency', 'opening_balance', 'current_balance', 'gl_account_id',
        'is_active', 'is_default', 'last_reconciled_date', 'last_reconciled_balance', 'settings',
    ];

    protected $casts = [
        'opening_balance'          => 'decimal:4',
        'current_balance'          => 'decimal:4',
        'last_reconciled_balance'  => 'decimal:4',
        'is_active'                => 'boolean',
        'is_default'               => 'boolean',
        'last_reconciled_date'     => 'date',
        'settings'                 => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()    { return $this->belongsTo(Company::class); }
    public function glAccount()  { return $this->belongsTo(Account::class, 'gl_account_id'); }
    public function transactions(){ return $this->hasMany(BankTransaction::class); }

    public function scopeActive($q) { return $q->where('is_active', true); }
}
