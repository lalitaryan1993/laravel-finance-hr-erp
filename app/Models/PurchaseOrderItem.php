<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 'item_name', 'description', 'unit', 'quantity',
        'received_quantity', 'unit_price', 'tax_rate', 'tax_amount', 'total_amount',
        'account_id', 'sort_order',
    ];

    protected $casts = [
        'quantity'          => 'decimal:4',
        'received_quantity' => 'decimal:4',
        'unit_price'        => 'decimal:4',
        'total_amount'      => 'decimal:4',
    ];

    public function purchaseOrder() { return $this->belongsTo(PurchaseOrder::class); }
    public function account()       { return $this->belongsTo(Account::class); }
}
