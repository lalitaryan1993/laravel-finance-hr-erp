<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $customers = Customer::forCompany($companyId)
            ->when($request->search, fn ($q, $v) => $q->where(fn ($q) =>
                $q->where('name', 'like', "%{$v}%")->orWhere('email', 'like', "%{$v}%")
                  ->orWhere('gst_number', 'like', "%{$v}%")->orWhere('billing_city', 'like', "%{$v}%")))
            ->when($request->status, fn ($q, $v) => $v === 'active' ? $q->where('is_active', true) : $q->where('is_active', false))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'company_name'        => 'nullable|string|max:255',
            'contact_person'      => 'nullable|string|max:255',
            'customer_type'       => 'nullable|in:individual,company',
            'email'               => 'nullable|email|max:255',
            'phone'               => 'nullable|string|max:30',
            'mobile'              => 'nullable|string|max:30',
            'website'             => 'nullable|url|max:255',
            'gst_number'          => 'nullable|string|max:20',
            'pan_number'          => 'nullable|string|max:10',
            'billing_address'     => 'nullable|string',
            'billing_city'        => 'nullable|string|max:100',
            'billing_state'       => 'nullable|string|max:100',
            'billing_state_code'  => 'nullable|string|max:10',
            'billing_country'     => 'nullable|string|max:100',
            'billing_country_code'=> 'nullable|string|max:5',
            'billing_pincode'     => 'nullable|string|max:20',
            'shipping_address'    => 'nullable|string',
            'currency'            => 'required|size:3',
            'credit_limit'        => 'nullable|numeric|min:0',
            'credit_days'         => 'nullable|integer|min:0',
            'payment_terms'       => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
            'logo'                => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('customers/logos', 'public');
        }

        Customer::create(array_merge(
            collect($data)->except('logo')->toArray(),
            [
                'company_id' => $request->user()->company_id,
                'is_active'  => true,
                'logo'       => $logoPath,
            ]
        ));

        return redirect()->route('customers.index')->with('success', 'Customer added successfully.');
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function show(Customer $customer)
    {
        $customer->load([
            'invoices' => fn ($q) => $q->where('status', '!=', 'cancelled')
                ->latest('invoice_date')->limit(10),
            'payments' => fn ($q) => $q->latest('payment_date')->limit(10),
        ]);

        return Inertia::render('Customers/Show', ['customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', ['customer' => $customer]);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:255',
            'company_name'        => 'nullable|string|max:255',
            'contact_person'      => 'nullable|string|max:255',
            'customer_type'       => 'nullable|in:individual,company',
            'email'               => 'nullable|email|max:255',
            'phone'               => 'nullable|string|max:30',
            'mobile'              => 'nullable|string|max:30',
            'website'             => 'nullable|url|max:255',
            'gst_number'          => 'nullable|string|max:20',
            'pan_number'          => 'nullable|string|max:10',
            'billing_address'     => 'nullable|string',
            'billing_city'        => 'nullable|string|max:100',
            'billing_state'       => 'nullable|string|max:100',
            'billing_state_code'  => 'nullable|string|max:10',
            'billing_country'     => 'nullable|string|max:100',
            'billing_country_code'=> 'nullable|string|max:5',
            'billing_pincode'     => 'nullable|string|max:20',
            'shipping_address'    => 'nullable|string',
            'currency'            => 'required|size:3',
            'credit_limit'        => 'nullable|numeric|min:0',
            'credit_days'         => 'nullable|integer|min:0',
            'payment_terms'       => 'nullable|string|max:100',
            'notes'               => 'nullable|string',
            'is_active'           => 'boolean',
            'logo'                => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($customer->logo) {
                Storage::disk('public')->delete($customer->logo);
            }
            $data['logo'] = $request->file('logo')->store('customers/logos', 'public');
        } else {
            unset($data['logo']);
        }

        $customer->update($data);

        return back()->with('success', 'Customer updated successfully.');
    }

    public function statement(Request $request, Customer $customer)
    {
        $customer->load([
            'invoices' => fn ($q) => $q->where('status', '!=', 'cancelled')->latest('invoice_date'),
            'payments' => fn ($q) => $q->latest('payment_date'),
        ]);

        return Inertia::render('Customers/Statement', [
            'customer' => $customer,
            'filters'  => $request->only(['from', 'to']),
        ]);
    }

    public function outstanding(Request $request)
    {
        $companyId = $request->user()->company_id;

        $customers = Customer::forCompany($companyId)
            ->whereHas('invoices', fn ($q) => $q->where('payment_status', '!=', 'paid'))
            ->with(['invoices' => fn ($q) => $q->where('payment_status', '!=', 'paid')])
            ->get()
            ->map(fn ($c) => array_merge($c->toArray(), [
                'outstanding' => $c->invoices->sum(fn ($inv) => $inv->grand_total - $inv->paid_amount),
            ]));

        return Inertia::render('Customers/Outstanding', [
            'customers' => $customers,
        ]);
    }

    public function destroy(Customer $customer)
    {
        if ($customer->logo) {
            Storage::disk('public')->delete($customer->logo);
        }
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Customer deleted.');
    }
}
