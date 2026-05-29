<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'fiscal_year_id', 'invoice_number',
        'reference_number', 'type', 'party_type', 'party_id', 'invoice_date',
        'due_date', 'delivery_date', 'currency', 'exchange_rate', 'subtotal',
        'discount_amount', 'discount_percent', 'taxable_amount', 'tax_amount',
        'cgst_amount', 'sgst_amount', 'igst_amount', 'cess_amount', 'tds_amount',
        'shipping_amount', 'adjustment_amount', 'grand_total', 'paid_amount',
        'balance_due', 'status', 'payment_status', 'payment_terms', 'is_recurring',
        'supply_type', 'place_of_supply', 'is_reverse_charge', 'gst_treatment',
        'shipping_address', 'billing_address', 'terms_conditions', 'customer_notes',
        'internal_notes', 'sales_account_id', 'receivable_account_id', 'journal_id',
        'template_id', 'pdf_path', 'sent_at', 'viewed_at', 'paid_at', 'voided_at',
        'created_by', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'invoice_date'      => 'date',
        'due_date'          => 'date',
        'delivery_date'     => 'date',
        'exchange_rate'     => 'decimal:6',
        'subtotal'          => 'decimal:4',
        'grand_total'       => 'decimal:4',
        'paid_amount'       => 'decimal:4',
        'balance_due'       => 'decimal:4',
        'tax_amount'        => 'decimal:4',
        'is_recurring'      => 'boolean',
        'is_reverse_charge' => 'boolean',
        'shipping_address'  => 'array',
        'billing_address'   => 'array',
        'sent_at'           => 'datetime',
        'viewed_at'         => 'datetime',
        'paid_at'           => 'datetime',
        'voided_at'         => 'datetime',
        'approved_at'       => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()   { return $this->belongsTo(Company::class); }
    public function branch()    { return $this->belongsTo(Branch::class); }
    public function fiscalYear(){ return $this->belongsTo(FiscalYear::class); }
    public function items()     { return $this->hasMany(InvoiceItem::class); }
    public function payments()  { return $this->belongsToMany(Payment::class, 'payment_allocations')->withPivot('allocated_amount'); }
    public function journal()   { return $this->belongsTo(Journal::class); }

    public function party()
    {
        return $this->party_type === 'customer'
            ? $this->belongsTo(Customer::class, 'party_id')
            : $this->belongsTo(Vendor::class, 'party_id');
    }

    public function isOverdue(): bool
    {
        return $this->due_date < now() && $this->payment_status !== 'paid';
    }

    public function scopeOverdue($q)
    {
        return $q->where('due_date', '<', now())
                 ->whereNotIn('payment_status', ['paid', 'void']);
    }

    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
    public function scopeOfType($q, $type)   { return $q->where('type', $type); }
}
