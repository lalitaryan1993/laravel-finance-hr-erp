<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetLine extends Model
{
    protected $fillable = [
        'budget_id', 'account_id', 'expense_category_id', 'description',
        'amount', 'actual_amount', 'variance', 'monthly_breakdown', 'period_type',
    ];

    protected $casts = [
        'amount'           => 'decimal:4',
        'actual_amount'    => 'decimal:4',
        'variance'         => 'decimal:4',
        'monthly_breakdown'=> 'array',
    ];

    public function budget()          { return $this->belongsTo(Budget::class); }
    public function account()         { return $this->belongsTo(Account::class); }
    public function expenseCategory() { return $this->belongsTo(ExpenseCategory::class); }
}
