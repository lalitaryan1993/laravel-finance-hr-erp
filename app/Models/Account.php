<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'account_group_id', 'code', 'name',
        'description', 'type', 'sub_type', 'nature', 'opening_balance',
        'opening_balance_type', 'current_balance', 'currency', 'is_bank_account',
        'is_cash_account', 'is_tax_account', 'is_reconcilable', 'is_active',
        'is_system', 'allow_direct_posting', 'tags', 'notes', 'created_by',
    ];

    protected $casts = [
        'opening_balance'   => 'decimal:4',
        'current_balance'   => 'decimal:4',
        'is_bank_account'   => 'boolean',
        'is_cash_account'   => 'boolean',
        'is_tax_account'    => 'boolean',
        'is_reconcilable'   => 'boolean',
        'is_active'         => 'boolean',
        'is_system'         => 'boolean',
        'allow_direct_posting' => 'boolean',
        'tags'              => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()      { return $this->belongsTo(Company::class); }
    public function branch()       { return $this->belongsTo(Branch::class); }
    public function accountGroup() { return $this->belongsTo(AccountGroup::class); }
    public function journalLines() { return $this->hasMany(JournalLine::class); }

    public function getBalanceAttribute(): float
    {
        return (float) $this->current_balance;
    }

    public function scopeActive($q)   { return $q->where('is_active', true); }
    public function scopeOfType($q, $type) { return $q->where('type', $type); }
    public function scopeForCompany($q, $companyId) { return $q->where('company_id', $companyId); }
}
