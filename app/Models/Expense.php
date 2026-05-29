<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'expense_number', 'category_id',
        'vendor_id', 'employee_id', 'expense_date', 'description', 'amount',
        'tax_amount', 'total_amount', 'currency', 'payment_method', 'reference_number',
        'is_billable', 'billable_to', 'status', 'mileage_distance', 'mileage_rate',
        'project_id', 'account_id', 'journal_id', 'attachments', 'ocr_data',
        'rejection_reason', 'created_by', 'submitted_by', 'submitted_at',
        'approved_by', 'approved_at',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount'       => 'decimal:4',
        'tax_amount'   => 'decimal:4',
        'total_amount' => 'decimal:4',
        'is_billable'  => 'boolean',
        'attachments'  => 'array',
        'ocr_data'     => 'array',
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()     { return $this->belongsTo(Company::class); }
    public function branch()      { return $this->belongsTo(Branch::class); }
    public function category()    { return $this->belongsTo(ExpenseCategory::class); }
    public function vendor()      { return $this->belongsTo(Vendor::class); }
    public function employee()    { return $this->belongsTo(User::class, 'employee_id'); }
    public function submittedBy() { return $this->belongsTo(User::class, 'submitted_by'); }
    public function approvedBy()  { return $this->belongsTo(User::class, 'approved_by'); }
    public function account()     { return $this->belongsTo(Account::class); }
    public function journal()     { return $this->belongsTo(Journal::class); }

    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
    public function scopeByStatus($q, $s)    { return $q->where('status', $s); }
}
