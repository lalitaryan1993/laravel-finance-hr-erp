<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'name', 'legal_name', 'slug', 'registration_number', 'tax_id',
        'pan_number', 'cin_number', 'email', 'phone', 'website', 'industry',
        'company_type', 'address_line1', 'address_line2', 'city', 'state',
        'country', 'pincode', 'logo', 'currency', 'currency_symbol', 'timezone',
        'date_format', 'financial_year_start', 'gst_registered', 'tds_applicable',
        'subscription_plan', 'subscription_expires_at', 'is_active', 'settings',
        'tax_settings', 'notification_settings', 'invoice_prefix', 'invoice_sequence',
        'expense_prefix', 'po_prefix', 'created_by',
    ];

    protected $casts = [
        'gst_registered'  => 'boolean',
        'tds_applicable'  => 'boolean',
        'is_active'       => 'boolean',
        'settings'        => 'array',
        'tax_settings'    => 'array',
        'notification_settings' => 'array',
        'subscription_expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? Str::uuid());
    }

    // Relations
    public function branches()   { return $this->hasMany(Branch::class); }
    public function users()      { return $this->hasMany(User::class); }
    public function accounts()   { return $this->hasMany(Account::class); }
    public function invoices()   { return $this->hasMany(Invoice::class); }
    public function journals()   { return $this->hasMany(Journal::class); }
    public function customers()  { return $this->hasMany(Customer::class); }
    public function vendors()    { return $this->hasMany(Vendor::class); }
    public function fiscalYears(){ return $this->hasMany(FiscalYear::class); }
    public function employees()  { return $this->hasMany(Employee::class); }
    public function assets()     { return $this->hasMany(Asset::class); }
    public function budgets()    { return $this->hasMany(Budget::class); }

    public function currentFiscalYear()
    {
        return $this->fiscalYears()->where('is_current', true)->first();
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    public function formatCurrency(float $amount): string
    {
        return $this->currency_symbol . number_format($amount, 2, '.', ',');
    }
}
