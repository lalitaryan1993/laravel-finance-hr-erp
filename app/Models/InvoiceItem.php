<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id', 'company_id', 'item_type', 'item_name', 'description',
        'hsn_sac_code', 'unit', 'quantity', 'unit_price', 'discount_percent',
        'discount_amount', 'taxable_amount', 'tax_rate', 'cgst_rate', 'sgst_rate',
        'igst_rate', 'cess_rate', 'tax_amount', 'total_amount', 'account_id',
        'tax_rate_id', 'sort_order',
    ];

    protected $casts = [
        'quantity'       => 'decimal:4',
        'unit_price'     => 'decimal:4',
        'total_amount'   => 'decimal:4',
        'tax_amount'     => 'decimal:4',
        'taxable_amount' => 'decimal:4',
        'tax_rate'       => 'decimal:4',
        'cgst_rate'      => 'decimal:4',
        'sgst_rate'      => 'decimal:4',
        'igst_rate'      => 'decimal:4',
    ];

    public function invoice() { return $this->belongsTo(Invoice::class); }
    public function account() { return $this->belongsTo(Account::class); }
}
