<?php

namespace App\Http\Controllers\Invoicing;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Vendor;
use App\Models\TaxRate;
use App\Models\Account;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return $this->invoiceList($request, ['sales', 'purchase', 'credit_note', 'debit_note']);
    }

    public function sales(Request $request)
    {
        return $this->invoiceList($request, ['sales','tax_invoice','export_invoice','export_proforma','bill_of_supply'], 'Invoicing/Sales/Index');
    }

    public function purchase(Request $request)
    {
        return $this->invoiceList($request, ['purchase'], 'Invoicing/Purchase/Index');
    }

    public function creditNotes(Request $request)
    {
        return $this->invoiceList($request, ['credit_note'], 'Invoicing/CreditNotes/Index');
    }

    public function proforma(Request $request)
    {
        return $this->invoiceList($request, ['proforma'], 'Invoicing/Proforma/Index');
    }

    public function recurring(Request $request)
    {
        return $this->invoiceList($request, ['sales'], 'Invoicing/Recurring/Index', ['is_recurring' => true]);
    }

    private function invoiceList(Request $request, array $types, string $page = 'Invoicing/Index', array $extra = [])
    {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::forCompany($companyId)
            ->with('party')
            ->whereIn('type', $types)
            ->when(count($extra), fn ($q) => $q->where($extra))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->type_filter, fn ($q, $v) => $q->where('type', $v))
            ->when($request->from, fn ($q, $v) => $q->where('invoice_date', '>=', $v))
            ->when($request->to,   fn ($q, $v) => $q->where('invoice_date', '<=', $v))
            ->when($request->min_amount, fn ($q, $v) => $q->where('grand_total', '>=', $v))
            ->when($request->max_amount, fn ($q, $v) => $q->where('grand_total', '<=', $v))
            ->when($request->search, function ($q, $v) {
                $customerIds = \App\Models\Customer::where('name', 'like', "%{$v}%")
                    ->orWhere('gst_number', 'like', "%{$v}%")
                    ->pluck('id');
                $vendorIds = \App\Models\Vendor::where('name', 'like', "%{$v}%")
                    ->pluck('id');
                $q->where(function ($q) use ($v, $customerIds, $vendorIds) {
                    $q->where('invoice_number', 'like', "%{$v}%")
                      ->orWhereIn('party_id', $customerIds)
                      ->orWhereIn('party_id', $vendorIds);
                });
            })
            ->latest('invoice_date')
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render($page, [
            'invoices' => $invoices,
            'filters'  => $request->only(['search', 'status', 'from', 'to', 'min_amount', 'max_amount', 'type_filter']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;
        $type = $request->input('type', 'tax_invoice');

        return Inertia::render('Invoicing/Create', [
            'type'       => $type,
            'customers'  => Customer::forCompany($companyId)->active()
                ->select('id', 'name', 'company_name', 'email', 'phone', 'gst_number', 'pan_number',
                         'currency', 'credit_days', 'billing_address', 'billing_city',
                         'billing_state', 'billing_country', 'billing_pincode', 'logo')
                ->get(),
            'vendors'    => Vendor::forCompany($companyId)->active()
                ->select('id', 'name', 'email', 'gst_number', 'currency', 'payment_days', 'address')
                ->get(),
            'taxRates'   => TaxRate::where('company_id', $companyId)->active()->get(),
            'accounts'   => Account::forCompany($companyId)->active()->ofType('income')->select('id', 'code', 'name')->get(),
            'nextNumber' => $this->generateNumber($companyId, $type),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'              => 'required|in:sales,purchase,credit_note,debit_note,proforma,tax_invoice,export_invoice,export_proforma,bill_of_supply',
            'party_type'        => 'required|in:customer,vendor',
            'party_id'          => 'required|integer',
            'invoice_date'      => 'required|date',
            'due_date'          => 'nullable|date|after_or_equal:invoice_date',
            'currency'          => 'required|size:3',
            'exchange_rate'     => 'nullable|numeric|min:0.0001',
            'place_of_supply'   => 'nullable|string',
            'port_of_loading'   => 'nullable|string',
            'port_of_discharge' => 'nullable|string',
            'country_of_origin' => 'nullable|string',
            'lut_bond_number'   => 'nullable|string',
            'shipping_bill_no'  => 'nullable|string',
            'customer_notes'    => 'nullable|string',
            'terms_conditions'  => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.item_name'  => 'required|string',
            'items.*.quantity'   => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate'   => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $request) {
            $companyId = $request->user()->company_id;
            $subtotal  = 0;
            $taxTotal  = 0;

            foreach ($data['items'] as $item) {
                $taxable   = ($item['quantity'] * $item['unit_price']) * (1 - ($item['discount_percent'] ?? 0) / 100);
                $tax       = $taxable * ($item['tax_rate'] ?? 0) / 100;
                $subtotal += $item['quantity'] * $item['unit_price'];
                $taxTotal += $tax;
            }

            $invoice = Invoice::create([
                'company_id'        => $companyId,
                'invoice_number'    => $this->generateNumber($companyId, $data['type']),
                'type'              => $data['type'],
                'party_type'        => $data['party_type'],
                'party_id'          => $data['party_id'],
                'invoice_date'      => $data['invoice_date'],
                'due_date'          => $data['due_date'],
                'currency'          => $data['currency'],
                'exchange_rate'     => $data['exchange_rate'] ?? 1,
                'subtotal'          => $subtotal,
                'tax_amount'        => $taxTotal,
                'grand_total'       => $subtotal + $taxTotal,
                'balance_due'       => $subtotal + $taxTotal,
                'place_of_supply'   => $data['place_of_supply']   ?? null,
                'port_of_loading'   => $data['port_of_loading']   ?? null,
                'port_of_discharge' => $data['port_of_discharge'] ?? null,
                'country_of_origin' => $data['country_of_origin'] ?? null,
                'lut_bond_number'   => $data['lut_bond_number']   ?? null,
                'shipping_bill_no'  => $data['shipping_bill_no']  ?? null,
                'customer_notes'    => $data['customer_notes']    ?? null,
                'terms_conditions'  => $data['terms_conditions']  ?? null,
                'status'            => 'draft',
                'payment_status'    => 'unpaid',
                'created_by'        => $request->user()->id,
            ]);

            foreach ($data['items'] as $i => $item) {
                $taxable = ($item['quantity'] * $item['unit_price']) * (1 - ($item['discount_percent'] ?? 0) / 100);
                InvoiceItem::create([
                    'invoice_id'     => $invoice->id,
                    'company_id'     => $companyId,
                    'item_name'      => $item['item_name'],
                    'description'    => $item['description'] ?? null,
                    'hsn_sac_code'   => $item['hsn_sac_code'] ?? null,
                    'unit'           => $item['unit'] ?? null,
                    'quantity'       => $item['quantity'],
                    'unit_price'     => $item['unit_price'],
                    'discount_percent'=> $item['discount_percent'] ?? 0,
                    'taxable_amount' => $taxable,
                    'tax_rate'       => $item['tax_rate'] ?? 0,
                    'tax_amount'     => $taxable * ($item['tax_rate'] ?? 0) / 100,
                    'total_amount'   => $taxable + ($taxable * ($item['tax_rate'] ?? 0) / 100),
                    'sort_order'     => $i,
                ]);
            }

            return $invoice;
        });

        return redirect()->route('invoices.sales')->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['items', 'party', 'payments', 'journal', 'branch']);
        return Inertia::render('Invoicing/Show', [
            'invoice' => array_merge($invoice->toArray(), [
                'party' => $invoice->party,
            ]),
        ]);
    }

    public function edit(Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return back()->withErrors(['error' => 'Cannot edit a paid invoice.']);
        }
        $invoice->load('items');
        $companyId = $invoice->company_id;
        return Inertia::render('Invoicing/Edit', [
            'invoice'   => $invoice,
            'customers' => Customer::forCompany($companyId)->active()->get(),
            'vendors'   => Vendor::forCompany($companyId)->active()->get(),
            'taxRates'  => TaxRate::where('company_id', $companyId)->active()->get(),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return back()->withErrors(['error' => 'Cannot edit a paid invoice.']);
        }

        $data = $request->validate([
            'type'              => 'sometimes|in:sales,purchase,credit_note,debit_note,proforma,tax_invoice,export_invoice,export_proforma,bill_of_supply',
            'party_id'          => 'required|integer',
            'invoice_date'      => 'required|date',
            'due_date'          => 'nullable|date|after_or_equal:invoice_date',
            'currency'          => 'required|size:3',
            'exchange_rate'     => 'nullable|numeric|min:0.0001',
            'place_of_supply'   => 'nullable|string',
            'port_of_loading'   => 'nullable|string',
            'port_of_discharge' => 'nullable|string',
            'country_of_origin' => 'nullable|string',
            'lut_bond_number'   => 'nullable|string',
            'shipping_bill_no'  => 'nullable|string',
            'terms_conditions'  => 'nullable|string',
            'customer_notes'    => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.item_name'       => 'required|string',
            'items.*.quantity'        => 'required|numeric|min:0.001',
            'items.*.unit_price'      => 'required|numeric|min:0',
            'items.*.tax_rate'        => 'nullable|numeric|min:0',
            'items.*.discount_percent'=> 'nullable|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($data, $invoice) {
            $subtotal = 0;
            $taxTotal = 0;

            foreach ($data['items'] as $item) {
                $taxable   = ($item['quantity'] * $item['unit_price']) * (1 - ($item['discount_percent'] ?? 0) / 100);
                $taxTotal += $taxable * ($item['tax_rate'] ?? 0) / 100;
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $grandTotal = $subtotal + $taxTotal;

            $invoice->update([
                'party_id'          => $data['party_id'],
                'invoice_date'      => $data['invoice_date'],
                'due_date'          => $data['due_date'],
                'currency'          => $data['currency'],
                'exchange_rate'     => $data['exchange_rate'] ?? 1,
                'place_of_supply'   => $data['place_of_supply']   ?? null,
                'port_of_loading'   => $data['port_of_loading']   ?? null,
                'port_of_discharge' => $data['port_of_discharge'] ?? null,
                'country_of_origin' => $data['country_of_origin'] ?? null,
                'lut_bond_number'   => $data['lut_bond_number']   ?? null,
                'shipping_bill_no'  => $data['shipping_bill_no']  ?? null,
                'terms_conditions'  => $data['terms_conditions']  ?? null,
                'customer_notes'    => $data['customer_notes']    ?? null,
                'subtotal'          => $subtotal,
                'tax_amount'        => $taxTotal,
                'grand_total'       => $grandTotal,
                'balance_due'       => $grandTotal - ($invoice->paid_amount ?? 0),
            ]);

            $invoice->items()->delete();
            foreach ($data['items'] as $i => $item) {
                $taxable = ($item['quantity'] * $item['unit_price']) * (1 - ($item['discount_percent'] ?? 0) / 100);
                InvoiceItem::create([
                    'invoice_id'      => $invoice->id,
                    'company_id'      => $invoice->company_id,
                    'item_name'       => $item['item_name'],
                    'description'     => $item['description'] ?? null,
                    'hsn_sac_code'    => $item['hsn_sac_code'] ?? null,
                    'unit'            => $item['unit'] ?? null,
                    'quantity'        => $item['quantity'],
                    'unit_price'      => $item['unit_price'],
                    'discount_percent'=> $item['discount_percent'] ?? 0,
                    'taxable_amount'  => $taxable,
                    'tax_rate'        => $item['tax_rate'] ?? 0,
                    'tax_amount'      => $taxable * ($item['tax_rate'] ?? 0) / 100,
                    'total_amount'    => $taxable + ($taxable * ($item['tax_rate'] ?? 0) / 100),
                    'sort_order'      => $i,
                ]);
            }
        });

        return redirect()->route('invoices.show', $invoice)->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return back()->withErrors(['error' => 'Cannot delete a paid invoice.']);
        }
        $invoice->items()->delete();
        $invoice->delete();
        return redirect()->route('invoices.sales')->with('success', 'Invoice deleted.');
    }

    public function send(Request $request, Invoice $invoice)
    {
        $invoice->update(['status' => 'sent', 'sent_at' => now()]);
        // Send email logic
        return back()->with('success', 'Invoice sent successfully.');
    }

    public function pdf(Invoice $invoice)
    {
        $invoice->load(['items', 'party', 'branch']);
        $company = \App\Models\Company::find($invoice->company_id);

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'company' => $company,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("Invoice-{$invoice->invoice_number}.pdf");
    }

    public function preview(Invoice $invoice)
    {
        $invoice->load(['items', 'party', 'branch']);
        $company = \App\Models\Company::find($invoice->company_id);

        return view('invoices.pdf', [
            'invoice' => $invoice,
            'company' => $company,
        ]);
    }

    public function recordPayment(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'amount'         => 'required|numeric|min:0.01|max:' . $invoice->balance_due,
            'payment_date'   => 'required|date',
            'payment_method' => 'required|string',
            'reference'      => 'nullable|string',
            'bank_account_id'=> 'nullable|exists:accounts,id',
        ]);

        DB::transaction(function () use ($data, $invoice, $request) {
            $companyId = $request->user()->company_id;

            $payment = Payment::create([
                'company_id'     => $companyId,
                'payment_number' => 'PAY-' . str_pad(Payment::where('company_id', $companyId)->count() + 1, 5, '0', STR_PAD_LEFT),
                'type'           => 'received',
                'party_type'     => 'customer',
                'party_id'       => $invoice->party_id,
                'payment_date'   => $data['payment_date'],
                'amount'         => $data['amount'],
                'currency'       => $invoice->currency,
                'payment_method' => $data['payment_method'],
                'reference_number' => $data['reference'] ?? null,
                'bank_account_id' => $data['bank_account_id'] ?? null,
                'status'         => 'completed',
                'created_by'     => $request->user()->id,
            ]);

            DB::table('payment_allocations')->insert([
                'payment_id'       => $payment->id,
                'invoice_id'       => $invoice->id,
                'allocated_amount' => $data['amount'],
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $newPaid = $invoice->paid_amount + $data['amount'];
            $invoice->update([
                'paid_amount'    => $newPaid,
                'balance_due'    => $invoice->grand_total - $newPaid,
                'payment_status' => $newPaid >= $invoice->grand_total ? 'paid' : 'partial',
                'status'         => $newPaid >= $invoice->grand_total ? 'paid' : 'partial',
                'paid_at'        => $newPaid >= $invoice->grand_total ? now() : null,
            ]);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function updatePayment(Request $request, Invoice $invoice, Payment $payment)
    {
        $data = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'payment_date'   => 'required|date',
            'payment_method' => 'required|string',
            'reference'      => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $invoice, $payment) {
            $oldAmount = $payment->amount;

            $payment->update([
                'amount'           => $data['amount'],
                'payment_date'     => $data['payment_date'],
                'payment_method'   => $data['payment_method'],
                'reference_number' => $data['reference'] ?? null,
            ]);

            // Update allocation
            DB::table('payment_allocations')
                ->where('payment_id', $payment->id)
                ->where('invoice_id', $invoice->id)
                ->update(['allocated_amount' => $data['amount']]);

            // Recalculate invoice paid totals from all allocations
            $totalPaid = DB::table('payment_allocations')
                ->where('invoice_id', $invoice->id)
                ->sum('allocated_amount');

            $invoice->update([
                'paid_amount'    => $totalPaid,
                'balance_due'    => $invoice->grand_total - $totalPaid,
                'payment_status' => $totalPaid >= $invoice->grand_total ? 'paid' : ($totalPaid > 0 ? 'partial' : 'unpaid'),
                'status'         => $totalPaid >= $invoice->grand_total ? 'paid' : ($totalPaid > 0 ? 'partial' : 'sent'),
                'paid_at'        => $totalPaid >= $invoice->grand_total ? now() : null,
            ]);
        });

        return back()->with('success', 'Payment updated successfully.');
    }

    public function destroyPayment(Invoice $invoice, Payment $payment)
    {
        DB::transaction(function () use ($invoice, $payment) {
            DB::table('payment_allocations')
                ->where('payment_id', $payment->id)
                ->where('invoice_id', $invoice->id)
                ->delete();

            $payment->delete();

            $totalPaid = DB::table('payment_allocations')
                ->where('invoice_id', $invoice->id)
                ->sum('allocated_amount');

            $invoice->update([
                'paid_amount'    => $totalPaid,
                'balance_due'    => $invoice->grand_total - $totalPaid,
                'payment_status' => $totalPaid >= $invoice->grand_total ? 'paid' : ($totalPaid > 0 ? 'partial' : 'unpaid'),
                'status'         => $totalPaid >= $invoice->grand_total ? 'paid' : ($totalPaid > 0 ? 'partial' : 'draft'),
                'paid_at'        => $totalPaid >= $invoice->grand_total ? now() : null,
            ]);
        });

        return back()->with('success', 'Payment removed successfully.');
    }

    public function duplicate(Invoice $invoice)
    {
        $invoice->load('items');
        $new = $invoice->replicate();
        $new->invoice_number = $this->generateNumber($invoice->company_id, $invoice->type);
        $new->invoice_date   = now()->toDateString();
        $new->due_date       = null;
        $new->status         = 'draft';
        $new->payment_status = 'unpaid';
        $new->paid_amount    = 0;
        $new->balance_due    = $invoice->grand_total;
        $new->save();

        foreach ($invoice->items as $item) {
            $newItem = $item->replicate();
            $newItem->invoice_id = $new->id;
            $newItem->save();
        }

        return redirect()->route('invoices.edit', $new)->with('success', 'Invoice duplicated.');
    }

    private function generateNumber(int $companyId, string $type): string
    {
        $prefix = match ($type) {
            'sales'          => 'INV',
            'tax_invoice'    => 'TINV',
            'purchase'       => 'PINV',
            'credit_note'    => 'CN',
            'debit_note'     => 'DN',
            'proforma'       => 'PRO',
            'export_invoice' => 'EXPINV',
            'export_proforma'=> 'EXPPRO',
            'bill_of_supply' => 'BOS',
            default          => 'INV',
        };
        $count = Invoice::where('company_id', $companyId)->where('type', $type)->count() + 1;
        return $prefix . '-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
