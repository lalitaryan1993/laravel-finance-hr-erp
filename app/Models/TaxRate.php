<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxRate extends Model
{
    protected $fillable = [
        'company_id', 'name', 'type', 'rate', 'hsn_sac_code', 'component',
        'is_compound', 'is_active', 'components',
    ];

    protected $casts = [
        'rate'        => 'decimal:4',
        'is_compound' => 'boolean',
        'is_active'   => 'boolean',
        'components'  => 'array',
    ];

    public function company() { return $this->belongsTo(Company::class); }
    public function scopeActive($q) { return $q->where('is_active', true); }
}
