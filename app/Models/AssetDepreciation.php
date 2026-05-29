<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
    protected $fillable = [
        'asset_id', 'company_id', 'period', 'depreciation_date',
        'depreciation_amount', 'book_value_after', 'accumulated_depreciation', 'journal_id',
    ];

    protected $casts = [
        'depreciation_date'       => 'date',
        'depreciation_amount'     => 'decimal:4',
        'book_value_after'        => 'decimal:4',
        'accumulated_depreciation'=> 'decimal:4',
    ];

    public function asset()   { return $this->belongsTo(Asset::class); }
    public function journal() { return $this->belongsTo(Journal::class); }
}
