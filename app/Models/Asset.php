<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Asset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'category_id', 'asset_code', 'name',
        'description', 'serial_number', 'barcode', 'qr_code', 'location',
        'purchase_date', 'purchase_cost', 'salvage_value', 'book_value',
        'accumulated_depreciation', 'useful_life_years', 'depreciation_method',
        'depreciation_rate', 'depreciation_start_date', 'last_depreciation_date',
        'vendor_id', 'purchase_invoice_number', 'warranty_number', 'warranty_expiry',
        'status', 'disposal_date', 'disposal_amount', 'assigned_to_type',
        'assigned_to_id', 'images', 'documents', 'notes', 'created_by',
    ];

    protected $casts = [
        'purchase_date'          => 'date',
        'depreciation_start_date'=> 'date',
        'last_depreciation_date' => 'date',
        'warranty_expiry'        => 'date',
        'disposal_date'          => 'date',
        'purchase_cost'          => 'decimal:4',
        'salvage_value'          => 'decimal:4',
        'book_value'             => 'decimal:4',
        'disposal_amount'        => 'decimal:4',
        'accumulated_depreciation'=> 'decimal:4',
        'images'                 => 'array',
        'documents'              => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()     { return $this->belongsTo(Company::class); }
    public function category()    { return $this->belongsTo(AssetCategory::class); }
    public function vendor()      { return $this->belongsTo(Vendor::class); }
    public function depreciations(){ return $this->hasMany(AssetDepreciation::class); }
    public function maintenances() { return $this->hasMany(AssetMaintenance::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
}
