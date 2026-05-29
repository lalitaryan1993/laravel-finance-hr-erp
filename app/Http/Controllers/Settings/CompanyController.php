<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::withCount('users')
            ->latest()
            ->get()
            ->map(fn ($c) => [
                'id'                    => $c->id,
                'name'                  => $c->name,
                'legal_name'            => $c->legal_name,
                'email'                 => $c->email,
                'phone'                 => $c->phone,
                'city'                  => $c->city,
                'state'                 => $c->state,
                'country'               => $c->country,
                'is_active'             => $c->is_active,
                'subscription_plan'     => $c->subscription_plan,
                'subscription_expires_at' => $c->subscription_expires_at?->toDateString(),
                'gst_registered'        => $c->gst_registered,
                'currency'              => $c->currency,
                'currency_symbol'       => $c->currency_symbol,
                'users_count'           => $c->users_count,
                'created_at'            => $c->created_at->toDateString(),
            ]);

        return Inertia::render('Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'legal_name'        => 'nullable|string|max:255',
            'email'             => 'nullable|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'industry'          => 'nullable|string|max:100',
            'company_type'      => 'nullable|string|max:50',
            'address_line1'     => 'nullable|string|max:255',
            'city'              => 'nullable|string|max:100',
            'state'             => 'nullable|string|max:100',
            'country'           => 'nullable|string|max:100',
            'pincode'           => 'nullable|string|max:20',
            'currency'          => 'nullable|string|max:3',
            'currency_symbol'   => 'nullable|string|max:5',
            'subscription_plan' => 'nullable|in:free,starter,professional,enterprise',
            'is_active'         => 'boolean',
            'gst_registered'    => 'boolean',
            'tds_applicable'    => 'boolean',
        ]);

        Company::create(array_merge($data, [
            'slug'       => Str::slug($data['name']) . '-' . Str::random(4),
            'created_by' => $request->user()->id,
        ]));

        return back()->with('success', 'Company created successfully.');
    }

    public function update(Request $request, Company $company)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'legal_name'        => 'nullable|string|max:255',
            'email'             => 'nullable|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'industry'          => 'nullable|string|max:100',
            'company_type'      => 'nullable|string|max:50',
            'address_line1'     => 'nullable|string|max:255',
            'city'              => 'nullable|string|max:100',
            'state'             => 'nullable|string|max:100',
            'country'           => 'nullable|string|max:100',
            'pincode'           => 'nullable|string|max:20',
            'currency'          => 'nullable|string|max:3',
            'currency_symbol'   => 'nullable|string|max:5',
            'subscription_plan' => 'nullable|in:free,starter,professional,enterprise',
            'is_active'         => 'boolean',
            'gst_registered'    => 'boolean',
            'tds_applicable'    => 'boolean',
        ]);

        $company->update($data);

        return back()->with('success', 'Company updated.');
    }

    public function destroy(Company $company)
    {
        $company->delete();
        return back()->with('success', 'Company deleted.');
    }
}
