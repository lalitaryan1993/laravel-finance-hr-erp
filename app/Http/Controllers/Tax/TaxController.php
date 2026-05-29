<?php

namespace App\Http\Controllers\Tax;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\TaxRate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TaxController extends Controller
{
    // ─── GST Report ───────────────────────────────────────────────────────────
    public function gst(Request $request)
    {
        $companyId = $request->user()->company_id;
        $from = $request->from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? Carbon::now()->toDateString();

        $salesInvoices = Invoice::where('company_id', $companyId)
            ->where('type', 'sales')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$from, $to])
            ->with('items')
            ->get()
            ->map(fn ($inv) => [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'party_name'     => $inv->party_name ?? $inv->customer_name ?? '—',
                'subtotal'       => (float) $inv->subtotal,
                'tax_amount'     => (float) $inv->tax_amount,
                'grand_total'    => (float) $inv->grand_total,
                'status'         => $inv->status,
            ]);

        $purchaseInvoices = Invoice::where('company_id', $companyId)
            ->where('type', 'purchase')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$from, $to])
            ->with('items')
            ->get()
            ->map(fn ($inv) => [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'party_name'     => $inv->party_name ?? $inv->vendor_name ?? '—',
                'subtotal'       => (float) $inv->subtotal,
                'tax_amount'     => (float) $inv->tax_amount,
                'grand_total'    => (float) $inv->grand_total,
                'status'         => $inv->status,
            ]);

        $outputGst = $salesInvoices->sum('tax_amount');
        $inputGst  = $purchaseInvoices->sum('tax_amount');

        return Inertia::render('Tax/GST', [
            'outputGst'        => $outputGst,
            'inputGst'         => $inputGst,
            'netGst'           => $outputGst - $inputGst,
            'salesInvoices'    => $salesInvoices->values(),
            'purchaseInvoices' => $purchaseInvoices->values(),
            'filters'          => compact('from', 'to'),
        ]);
    }

    // ─── TDS Report ───────────────────────────────────────────────────────────
    public function tds(Request $request)
    {
        $companyId = $request->user()->company_id;
        $from = $request->from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? Carbon::now()->toDateString();

        $tdsDeducted  = (float) Invoice::where('company_id', $companyId)
            ->where('type', 'purchase')->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$from, $to])->sum('tds_amount');

        $tdsCollected = (float) Invoice::where('company_id', $companyId)
            ->where('type', 'sales')->where('status', '!=', 'cancelled')
            ->whereBetween('invoice_date', [$from, $to])->sum('tds_amount');

        return Inertia::render('Tax/TDS', [
            'tdsDeducted'  => $tdsDeducted,
            'tdsCollected' => $tdsCollected,
            'netTds'       => $tdsDeducted - $tdsCollected,
            'filters'      => compact('from', 'to'),
        ]);
    }

    // ─── Tax Reports ──────────────────────────────────────────────────────────
    public function reports(Request $request)
    {
        $companyId = $request->user()->company_id;

        $taxRates = TaxRate::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('type')->orderBy('rate')
            ->get();

        return Inertia::render('Tax/Reports', [
            'taxRates' => $taxRates,
            'filters'  => $request->only(['from', 'to', 'type']),
        ]);
    }

    // ─── Tax Settings (rate list) ─────────────────────────────────────────────
    public function settings(Request $request)
    {
        $companyId = $request->user()->company_id;

        $taxRates = TaxRate::where('company_id', $companyId)
            ->orderBy('type')->orderBy('rate')
            ->get();

        return Inertia::render('Tax/Settings', [
            'taxRates' => $taxRates,
        ]);
    }

    // ─── Store new tax rate ───────────────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'type'         => 'required|in:gst,cgst,sgst,igst,tds,tcs',
            'rate'         => 'required|numeric|min:0|max:100',
            'hsn_sac_code' => 'nullable|string|max:20',
            'is_active'    => 'boolean',
            'components'   => 'nullable|array',
        ]);

        TaxRate::create(array_merge($data, [
            'company_id' => $request->user()->company_id,
            'is_active'  => $data['is_active'] ?? true,
        ]));

        return back()->with('success', 'Tax rate created.');
    }

    // ─── Update existing tax rate ─────────────────────────────────────────────
    public function update(Request $request, TaxRate $taxRate)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'type'         => 'required|in:gst,cgst,sgst,igst,tds,tcs',
            'rate'         => 'required|numeric|min:0|max:100',
            'hsn_sac_code' => 'nullable|string|max:20',
            'is_active'    => 'boolean',
            'components'   => 'nullable|array',
        ]);

        $taxRate->update($data);

        return back()->with('success', 'Tax rate updated.');
    }

    // ─── Delete tax rate ──────────────────────────────────────────────────────
    public function destroy(TaxRate $taxRate)
    {
        $taxRate->delete();

        return back()->with('success', 'Tax rate deleted.');
    }

    // ─── Toggle active status ─────────────────────────────────────────────────
    public function toggle(TaxRate $taxRate)
    {
        $taxRate->update(['is_active' => !$taxRate->is_active]);

        return back()->with('success', $taxRate->is_active ? 'Tax rate activated.' : 'Tax rate deactivated.');
    }
}
