<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JournalLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id', 'account_id', 'company_id', 'description', 'debit', 'credit',
        'currency', 'exchange_rate', 'base_debit', 'base_credit', 'branch_id',
        'cost_center_id', 'project_id', 'partner_type', 'partner_id',
        'is_reconciled', 'reconciled_at', 'sort_order',
    ];

    protected $casts = [
        'debit'        => 'decimal:4',
        'credit'       => 'decimal:4',
        'base_debit'   => 'decimal:4',
        'base_credit'  => 'decimal:4',
        'is_reconciled'=> 'boolean',
        'reconciled_at'=> 'datetime',
    ];

    public function journal()  { return $this->belongsTo(Journal::class); }
    public function account()  { return $this->belongsTo(Account::class); }
    public function branch()   { return $this->belongsTo(Branch::class); }
}
