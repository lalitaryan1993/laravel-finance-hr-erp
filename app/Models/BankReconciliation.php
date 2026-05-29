<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BankReconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'bank_account_id', 'statement_date',
        'opening_balance', 'closing_balance', 'reconciled_balance',
        'difference', 'status', 'reconciled_by', 'reconciled_at',
        'notes',
    ];

    protected $casts = [
        'statement_date'  => 'date',
        'reconciled_at'   => 'datetime',
        'opening_balance' => 'decimal:4',
        'closing_balance' => 'decimal:4',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function reconciledBy()
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
