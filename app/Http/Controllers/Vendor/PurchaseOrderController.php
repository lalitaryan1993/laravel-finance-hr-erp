<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $orders = PurchaseOrder::where('company_id', $companyId)
            ->with('vendor:id,name')
            ->when($request->search, fn ($q, $v) =>
                $q->where(fn ($q) =>
                    $q->where('po_number', 'like', "%{$v}%")
                      ->orWhereHas('vendor', fn ($q) => $q->where('name', 'like', "%{$v}%"))))
            ->when($request->status,    fn ($q, $v) => $q->where('status', $v))
            ->when($request->vendor_id, fn ($q, $v) => $q->where('vendor_id', $v))
            ->when($request->from,      fn ($q, $v) => $q->where('order_date', '>=', $v))
            ->when($request->to,        fn ($q, $v) => $q->where('order_date', '<=', $v))
            ->latest('order_date')
            ->paginate(20)
            ->withQueryString();

        $base = PurchaseOrder::where('company_id', $companyId);
        $stats = [
            'total'      => (clone $base)->count(),
            'totalValue' => (clone $base)->sum('total_amount'),
            'draft'      => (clone $base)->where('status', 'draft')->count(),
            'confirmed'  => (clone $base)->where('status', 'confirmed')->count(),
            'received'   => (clone $base)->where('status', 'received')->count(),
        ];

        return Inertia::render('Vendors/PurchaseOrders/Index', [
            'orders'  => $orders,
            'stats'   => $stats,
            'vendors' => Vendor::forCompany($companyId)->active()->get(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'vendor_id', 'from', 'to']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        return Inertia::render('Vendors/PurchaseOrders/Create', [
            'vendors' => Vendor::forCompany($companyId)->active()->get(['id', 'name', 'currency', 'payment_terms']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vendor_id'               => 'required|exists:vendors,id',
            'order_date'              => 'required|date',
            'expected_delivery_date'  => 'nullable|date',
            'currency'                => 'required|size:3',
            'payment_terms'           => 'nullable|string|max:100',
            'delivery_address'        => 'nullable|string',
            'notes'                   => 'nullable|string',
            'terms_conditions'        => 'nullable|string',
            'items'                   => 'required|array|min:1',
            'items.*.item_name'       => 'required|string|max:255',
            'items.*.quantity'        => 'required|numeric|min:0.0001',
            'items.*.unit_price'      => 'required|numeric|min:0',
            'items.*.tax_rate'        => 'nullable|numeric|min:0',
            'items.*.description'     => 'nullable|string',
            'items.*.unit'            => 'nullable|string|max:20',
        ]);

        $companyId = $request->user()->company_id;
        $count     = PurchaseOrder::where('company_id', $companyId)->count() + 1;

        $subtotal = 0;
        $taxTotal = 0;
        $items    = [];
        foreach ($data['items'] as $i => $item) {
            $lineTotal   = $item['quantity'] * $item['unit_price'];
            $taxRate     = (float) ($item['tax_rate'] ?? 0);
            $taxAmount   = round($lineTotal * $taxRate / 100, 4);
            $subtotal   += $lineTotal;
            $taxTotal   += $taxAmount;
            $items[]     = [
                'item_name'   => $item['item_name'],
                'description' => $item['description'] ?? null,
                'unit'        => $item['unit'] ?? null,
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'tax_rate'    => $taxRate,
                'tax_amount'  => $taxAmount,
                'total_amount'=> $lineTotal + $taxAmount,
                'sort_order'  => $i,
            ];
        }

        $po = PurchaseOrder::create([
            'company_id'             => $companyId,
            'po_number'              => 'PO-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT),
            'vendor_id'              => $data['vendor_id'],
            'order_date'             => $data['order_date'],
            'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
            'currency'               => $data['currency'],
            'payment_terms'          => $data['payment_terms'] ?? null,
            'delivery_address'       => $data['delivery_address'] ?? null,
            'notes'                  => $data['notes'] ?? null,
            'terms_conditions'       => $data['terms_conditions'] ?? null,
            'subtotal'               => $subtotal,
            'tax_amount'             => $taxTotal,
            'total_amount'           => $subtotal + $taxTotal,
            'status'                 => 'draft',
            'created_by'             => $request->user()->id,
        ]);

        foreach ($items as $item) {
            PurchaseOrderItem::create(array_merge($item, ['purchase_order_id' => $po->id]));
        }

        return redirect()->route('vendors.purchase-orders.show', $po)->with('success', 'Purchase order created.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load('vendor', 'items');

        return Inertia::render('Vendors/PurchaseOrders/Show', [
            'order' => $purchaseOrder,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load('items');

        return Inertia::render('Vendors/PurchaseOrders/Edit', [
            'order'   => $purchaseOrder,
            'vendors' => Vendor::forCompany($purchaseOrder->company_id)->active()->get(['id', 'name', 'currency', 'payment_terms']),
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'vendor_id'              => 'required|exists:vendors,id',
            'order_date'             => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'status'                 => 'nullable|in:draft,sent,confirmed,partial,received,cancelled',
            'payment_terms'          => 'nullable|string|max:100',
            'currency'               => 'required|size:3',
            'delivery_address'       => 'nullable|string',
            'notes'                  => 'nullable|string',
            'terms_conditions'       => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.item_name'      => 'required|string|max:255',
            'items.*.quantity'       => 'required|numeric|min:0.0001',
            'items.*.unit_price'     => 'required|numeric|min:0',
            'items.*.tax_rate'       => 'nullable|numeric|min:0',
            'items.*.description'    => 'nullable|string',
            'items.*.unit'           => 'nullable|string|max:20',
        ]);

        $subtotal = 0;
        $taxTotal = 0;
        $itemRows = [];

        foreach ($data['items'] as $i => $item) {
            $lineTotal   = $item['quantity'] * $item['unit_price'];
            $taxRate     = (float) ($item['tax_rate'] ?? 0);
            $taxAmount   = round($lineTotal * $taxRate / 100, 4);
            $subtotal   += $lineTotal;
            $taxTotal   += $taxAmount;
            $itemRows[]  = [
                'purchase_order_id' => $purchaseOrder->id,
                'item_name'         => $item['item_name'],
                'description'       => $item['description'] ?? null,
                'unit'              => $item['unit'] ?? null,
                'quantity'          => $item['quantity'],
                'unit_price'        => $item['unit_price'],
                'tax_rate'          => $taxRate,
                'tax_amount'        => $taxAmount,
                'total_amount'      => $lineTotal + $taxAmount,
                'sort_order'        => $i,
                'created_at'        => now(),
                'updated_at'        => now(),
            ];
        }

        DB::transaction(function () use ($data, $purchaseOrder, $itemRows, $subtotal, $taxTotal) {
            $purchaseOrder->update([
                'vendor_id'              => $data['vendor_id'],
                'order_date'             => $data['order_date'],
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
                'status'                 => $data['status'] ?? $purchaseOrder->status,
                'payment_terms'          => $data['payment_terms'] ?? null,
                'currency'               => $data['currency'],
                'delivery_address'       => $data['delivery_address'] ?? null,
                'notes'                  => $data['notes'] ?? null,
                'terms_conditions'       => $data['terms_conditions'] ?? null,
                'subtotal'               => $subtotal,
                'tax_amount'             => $taxTotal,
                'total_amount'           => $subtotal + $taxTotal,
            ]);

            $purchaseOrder->items()->delete();
            DB::table('purchase_order_items')->insert($itemRows);
        });

        return redirect()->route('vendors.purchase-orders.show', $purchaseOrder)
            ->with('success', 'Purchase order updated.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->update(['status' => 'cancelled']);
        $purchaseOrder->delete();

        return redirect()->route('vendors.purchase-orders.index')->with('success', 'Purchase order cancelled.');
    }
}
