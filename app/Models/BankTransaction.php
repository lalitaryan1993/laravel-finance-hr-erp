<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BankTransaction extends Model
{
    protected $fillable = [
        'uuid', 'company_id', 'bank_account_id', 'transaction_date', 'value_date',
        'transaction_type', 'amount', 'balance', 'reference_number', 'description',
        'category', 'payment_mode', 'cheque_number', 'is_reconciled', 'reconciled_at',
        'journal_id', 'matched_type', 'matched_id', 'source', 'raw_data', 'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'value_date'       => 'date',
        'amount'           => 'decimal:4',
        'balance'          => 'decimal:4',
        'is_reconciled'    => 'boolean',
        'reconciled_at'    => 'datetime',
        'raw_data'         => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function bankAccount(){ return $this->belongsTo(BankAccount::class); }
    public function journal()    { return $this->belongsTo(Journal::class); }
}
