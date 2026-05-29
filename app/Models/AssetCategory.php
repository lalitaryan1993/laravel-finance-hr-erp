<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetCategory extends Model
{
    protected $fillable = [
        'company_id', 'name', 'code', 'depreciation_method', 'depreciation_rate',
        'useful_life_years', 'salvage_value_percent', 'asset_account_id',
        'depreciation_account_id', 'accumulated_depreciation_account_id', 'is_active',
    ];

    protected $casts = [
        'depreciation_rate' => 'decimal:4',
        'salvage_value_percent' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function assets()  { return $this->hasMany(Asset::class, 'category_id'); }
}
