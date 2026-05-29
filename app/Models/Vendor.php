<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'vendor_code', 'name', 'company_name', 'contact_person',
        'email', 'phone', 'mobile', 'website', 'pan_number', 'gst_number',
        'vendor_type', 'address', 'city', 'state', 'country', 'pincode',
        'currency', 'payment_days', 'outstanding_balance', 'ledger_account_id',
        'payment_terms', 'is_active', 'rating', 'bank_details', 'tags', 'notes',
        'tds_applicable', 'tds_section', 'tds_rate', 'created_by',
    ];

    protected $casts = [
        'outstanding_balance' => 'decimal:4',
        'tds_rate'            => 'decimal:2',
        'is_active'           => 'boolean',
        'tds_applicable'      => 'boolean',
        'bank_details'        => 'array',
        'tags'                => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()         { return $this->belongsTo(Company::class); }
    public function ledgerAccount()   { return $this->belongsTo(Account::class, 'ledger_account_id'); }
    public function purchaseOrders()  { return $this->hasMany(PurchaseOrder::class); }
    public function invoices()        { return $this->hasMany(Invoice::class, 'party_id')->where('party_type', 'vendor'); }
    public function payments()        { return $this->hasMany(Payment::class, 'party_id')->where('party_type', 'vendor'); }

    public function scopeActive($q)  { return $q->where('is_active', true); }
    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
}
