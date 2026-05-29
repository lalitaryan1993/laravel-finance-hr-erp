<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'payment_number', 'type', 'party_type',
        'party_id', 'payment_date', 'amount', 'currency', 'exchange_rate',
        'payment_method', 'reference_number', 'cheque_number', 'cheque_date',
        'bank_account_id', 'notes', 'status', 'journal_id', 'attachments', 'created_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'cheque_date'  => 'date',
        'amount'       => 'decimal:4',
        'attachments'  => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()    { return $this->belongsTo(Company::class); }
    public function journal()    { return $this->belongsTo(Journal::class); }
    public function bankAccount(){ return $this->belongsTo(Account::class, 'bank_account_id'); }
    public function invoices()   { return $this->belongsToMany(Invoice::class, 'payment_allocations')->withPivot('allocated_amount'); }
}
