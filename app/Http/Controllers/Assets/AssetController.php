<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetDepreciation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $assets = Asset::where('company_id', $companyId)
            ->with('category:id,name')
            ->when($request->search, fn ($q, $v) =>
                $q->where(fn ($q) =>
                    $q->where('name', 'like', "%{$v}%")
                      ->orWhere('asset_code', 'like', "%{$v}%")))
            ->when($request->category_id, fn ($q, $v) => $q->where('category_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Assets/Index', [
            'assets'     => $assets,
            'categories' => AssetCategory::where('company_id', $companyId)->get(['id', 'name']),
            'filters'    => $request->only(['search', 'category_id', 'status']),
            'totals'     => [
                'purchase_cost' => Asset::where('company_id', $companyId)->sum('purchase_cost'),
                'book_value'    => Asset::where('company_id', $companyId)->sum('book_value'),
                'total_assets'  => Asset::where('company_id', $companyId)->count(),
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Assets/Create', [
            'categories' => AssetCategory::where('company_id', $request->user()->company_id)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                   => 'required|string|max:255',
            'asset_code'             => 'nullable|string|max:30',
            'category_id'            => 'nullable|exists:asset_categories,id',
            'purchase_date'          => 'required|date',
            'purchase_cost'          => 'required|numeric|min:0',
            'useful_life_years'      => 'required|integer|min:1',
            'salvage_value'          => 'nullable|numeric|min:0',
            'depreciation_method'    => 'required|in:straight_line,declining_balance,units_of_production',
            'depreciation_start_date'=> 'nullable|date',
            'location'               => 'nullable|string|max:255',
            'serial_number'          => 'nullable|string|max:100',
            'description'            => 'nullable|string',
        ]);

        Asset::create(array_merge($data, [
            'company_id'             => $request->user()->company_id,
            'book_value'             => $data['purchase_cost'],
            'depreciation_start_date'=> $data['depreciation_start_date'] ?? $data['purchase_date'],
            'status'                 => 'active',
        ]));

        return redirect()->route('assets.index')->with('success', 'Asset added.');
    }

    public function show(Asset $asset)
    {
        $asset->load('category', 'depreciations', 'maintenances');

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'nullable|exists:asset_categories,id',
            'location'    => 'nullable|string|max:255',
            'serial_number'=> 'nullable|string|max:100',
            'status'      => 'nullable|in:active,disposed,under_maintenance',
            'description' => 'nullable|string',
        ]);

        $asset->update($data);

        return back()->with('success', 'Asset updated.');
    }

    public function destroy(Asset $asset)
    {
        $asset->update(['status' => 'disposed']);
        $asset->delete();

        return redirect()->route('assets.index')->with('success', 'Asset disposed.');
    }

    public function depreciation(Request $request)
    {
        $companyId = $request->user()->company_id;

        $depreciations = AssetDepreciation::whereHas('asset', fn ($q) => $q->where('company_id', $companyId))
            ->with('asset:id,name,asset_code')
            ->when($request->year, fn ($q, $v) => $q->whereYear('depreciation_date', $v))
            ->latest('depreciation_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Assets/Depreciation', [
            'depreciations' => $depreciations,
            'filters'       => $request->only(['year']),
        ]);
    }

    public function runDepreciation(Request $request)
    {
        $data = $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $companyId = $request->user()->company_id;
        $asOf = Carbon::parse($data['as_of_date']);
        $processed = 0;

        $assets = Asset::where('company_id', $companyId)
            ->where('status', 'active')
            ->get();

        foreach ($assets as $asset) {
            $salvage   = (float) ($asset->salvage_value ?? 0);
            $bookValue = (float) $asset->book_value;

            if ($asset->depreciation_method === 'straight_line') {
                $annualDep  = ($asset->purchase_cost - $salvage) / max($asset->useful_life_years, 1);
                $monthlyDep = round($annualDep / 12, 2);

                if ($monthlyDep > 0 && $bookValue > $salvage) {
                    $amount       = min($monthlyDep, $bookValue - $salvage);
                    $newBookValue = $bookValue - $amount;
                    $newAccumDep  = (float) $asset->accumulated_depreciation + $amount;

                    AssetDepreciation::create([
                        'asset_id'                => $asset->id,
                        'company_id'              => $asset->company_id,
                        'period'                  => $asOf->format('Y-m'),
                        'depreciation_date'       => $asOf->toDateString(),
                        'depreciation_amount'     => $amount,
                        'book_value_after'        => $newBookValue,
                        'accumulated_depreciation'=> $newAccumDep,
                    ]);

                    $asset->update([
                        'book_value'              => $newBookValue,
                        'accumulated_depreciation'=> $newAccumDep,
                        'last_depreciation_date'  => $asOf->toDateString(),
                    ]);
                    $processed++;
                }
            }
        }

        return back()->with('success', "Depreciation run complete. {$processed} assets processed.");
    }

    public function maintenance(Request $request)
    {
        $companyId = $request->user()->company_id;

        $maintenances = \App\Models\AssetMaintenance::whereHas('asset', fn ($q) => $q->where('company_id', $companyId))
            ->with('asset:id,name,asset_code')
            ->latest('scheduled_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Assets/Maintenance', [
            'maintenances' => $maintenances,
            'filters'      => $request->only(['status']),
        ]);
    }
}
