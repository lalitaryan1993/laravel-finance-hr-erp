<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'customer_code', 'name', 'company_name', 'contact_person',
        'email', 'phone', 'mobile', 'website', 'pan_number', 'gst_number',
        'customer_type', 'logo',
        'billing_address', 'billing_city', 'billing_state', 'billing_state_code',
        'billing_country', 'billing_country_code', 'billing_pincode',
        'shipping_address', 'currency',
        'credit_limit', 'credit_days', 'outstanding_balance', 'ledger_account_id',
        'payment_terms', 'is_active', 'status', 'bank_details', 'tags', 'notes',
        'assigned_to', 'created_by',
    ];

    protected $casts = [
        'credit_limit'         => 'decimal:4',
        'outstanding_balance'  => 'decimal:4',
        'is_active'            => 'boolean',
        'bank_details'         => 'array',
        'tags'                 => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()       { return $this->belongsTo(Company::class); }
    public function ledgerAccount() { return $this->belongsTo(Account::class, 'ledger_account_id'); }
    public function invoices()      { return $this->hasMany(Invoice::class, 'party_id')->where('party_type', 'customer'); }
    public function payments()      { return $this->hasMany(Payment::class, 'party_id')->where('party_type', 'customer'); }

    public function getOutstandingAmount(): float
    {
        return (float) $this->invoices()
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->sum('balance_due');
    }

    public function scopeActive($q)  { return $q->where('is_active', true); }
    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
}
