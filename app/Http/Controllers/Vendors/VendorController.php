<?php

namespace App\Http\Controllers\Vendors;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $vendors = Vendor::forCompany($companyId)
            ->when($request->search, fn ($q, $v) => $q->where(fn ($q) =>
                $q->where('name', 'like', "%{$v}%")->orWhere('email', 'like', "%{$v}%")
                  ->orWhere('gst_number', 'like', "%{$v}%")))
            ->when($request->status, fn ($q, $v) => $q->where('is_active', $v === 'active'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email',
            'phone'        => 'nullable|string',
            'gst_number'   => 'nullable|string|max:20',
            'pan_number'   => 'nullable|string|max:10',
            'city'         => 'nullable|string',
            'state'        => 'nullable|string',
            'payment_days' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
            'currency'     => 'required|size:3',
        ]);

        Vendor::create(array_merge($data, [
            'company_id' => $request->user()->company_id,
            'is_active'  => true,
        ]));

        return redirect()->route('vendors.index')->with('success', 'Vendor added.');
    }

    public function create()
    {
        return Inertia::render('Vendors/Create');
    }

    public function show(Vendor $vendor)
    {
        $vendor->load('invoices', 'purchaseOrders');
        return Inertia::render('Vendors/Show', ['vendor' => $vendor]);
    }

    public function edit(Vendor $vendor)
    {
        return Inertia::render('Vendors/Edit', ['vendor' => $vendor]);
    }

    public function payments(Request $request)
    {
        $companyId = $request->user()->company_id;

        $payments = \App\Models\Payment::where('company_id', $companyId)
            ->whereHas('invoices', fn ($q) =>
                $q->where('type', 'purchase'))
            ->with(['invoices' => fn ($q) =>
                $q->where('type', 'purchase')
                  ->select('invoices.id', 'invoices.invoice_number', 'invoices.party_id', 'invoices.party_type')
                  ->with('party:id,name')])
            ->when($request->from,      fn ($q, $v) => $q->where('payment_date', '>=', $v))
            ->when($request->to,        fn ($q, $v) => $q->where('payment_date', '<=', $v))
            ->latest('payment_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Vendors/Payments', [
            'payments' => $payments,
            'filters'  => $request->only(['from', 'to', 'vendor_id']),
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $vendor->update($request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email',
            'phone'        => 'nullable|string',
            'gst_number'   => 'nullable|string',
            'payment_days' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
        ]));
        return back()->with('success', 'Vendor updated.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return redirect()->route('vendors.index')->with('success', 'Vendor deleted.');
    }
}
