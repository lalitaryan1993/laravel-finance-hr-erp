<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpensePolicy extends Model
{
    protected $fillable = [
        'company_id', 'name', 'category_id', 'max_amount',
        'requires_receipt', 'requires_approval', 'approval_threshold',
        'applicable_to', 'applicable_ids', 'is_active',
    ];

    protected $casts = [
        'max_amount'        => 'decimal:4',
        'requires_receipt'  => 'boolean',
        'requires_approval' => 'boolean',
        'applicable_ids'    => 'array',
        'is_active'         => 'boolean',
    ];

    public function company()  { return $this->belongsTo(Company::class); }
    public function category() { return $this->belongsTo(ExpenseCategory::class); }
}
