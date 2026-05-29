<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    protected $fillable = [
        'company_id', 'name', 'code', 'color', 'icon', 'account_id',
        'parent_id', 'budget_amount', 'requires_receipt', 'is_active',
    ];

    protected $casts = [
        'budget_amount'    => 'decimal:4',
        'requires_receipt' => 'boolean',
        'is_active'        => 'boolean',
    ];

    public function company()  { return $this->belongsTo(Company::class); }
    public function account()  { return $this->belongsTo(Account::class); }
    public function parent()   { return $this->belongsTo(ExpenseCategory::class, 'parent_id'); }
    public function children() { return $this->hasMany(ExpenseCategory::class, 'parent_id'); }
    public function expenses() { return $this->hasMany(Expense::class, 'category_id'); }
}
