<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PurchaseOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'po_number', 'vendor_id', 'order_date',
        'expected_delivery_date', 'delivery_date', 'subtotal', 'tax_amount',
        'discount_amount', 'total_amount', 'received_amount', 'currency', 'status',
        'payment_terms', 'delivery_address', 'terms_conditions', 'notes',
        'linked_invoice_id', 'approved_by', 'approved_at', 'created_by',
    ];

    protected $casts = [
        'order_date'               => 'date',
        'expected_delivery_date'   => 'date',
        'delivery_date'            => 'date',
        'total_amount'             => 'decimal:4',
        'approved_at'              => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company() { return $this->belongsTo(Company::class); }
    public function vendor()  { return $this->belongsTo(Vendor::class); }
    public function items()   { return $this->hasMany(PurchaseOrderItem::class); }
}
