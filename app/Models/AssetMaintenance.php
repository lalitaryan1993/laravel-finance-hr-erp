<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetMaintenance extends Model
{
    protected $fillable = [
        'asset_id', 'company_id', 'maintenance_type', 'scheduled_date',
        'completed_date', 'description', 'cost', 'vendor_name', 'status', 'notes',
    ];

    protected $casts = [
        'scheduled_date'  => 'date',
        'completed_date'  => 'date',
        'cost'            => 'decimal:4',
    ];

    public function asset() { return $this->belongsTo(Asset::class); }
}
