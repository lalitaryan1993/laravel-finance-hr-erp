<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FundTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'from_account_id', 'to_account_id',
        'transfer_date', 'amount', 'currency', 'exchange_rate',
        'reference', 'description', 'status', 'journal_id',
        'created_by',
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'amount'        => 'decimal:4',
        'exchange_rate' => 'decimal:6',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function fromAccount()
    {
        return $this->belongsTo(BankAccount::class, 'from_account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(BankAccount::class, 'to_account_id');
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }
}
