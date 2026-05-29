<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Journal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'fiscal_year_id', 'accounting_period_id',
        'journal_number', 'reference', 'journal_type', 'date', 'narration',
        'total_debit', 'total_credit', 'currency', 'exchange_rate', 'status',
        'is_recurring', 'source_module', 'source_id', 'source_type',
        'created_by', 'posted_by', 'posted_at', 'attachments', 'internal_notes',
    ];

    protected $casts = [
        'date'        => 'date',
        'total_debit' => 'decimal:4',
        'total_credit'=> 'decimal:4',
        'is_recurring'=> 'boolean',
        'attachments' => 'array',
        'posted_at'   => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()   { return $this->belongsTo(Company::class); }
    public function branch()    { return $this->belongsTo(Branch::class); }
    public function fiscalYear(){ return $this->belongsTo(FiscalYear::class); }
    public function lines()     { return $this->hasMany(JournalLine::class); }

    public function isBalanced(): bool
    {
        return bccomp((string) $this->total_debit, (string) $this->total_credit, 4) === 0;
    }

    public function scopePosted($q)  { return $q->where('status', 'posted'); }
    public function scopeDraft($q)   { return $q->where('status', 'draft'); }
    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
}
