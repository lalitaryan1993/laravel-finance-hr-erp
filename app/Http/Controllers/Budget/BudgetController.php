<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\FiscalYear;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $budgets = Budget::where('company_id', $companyId)
            ->with('fiscalYear')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Budget/Index', [
            'budgets'     => $budgets,
            'fiscalYears' => FiscalYear::where('company_id', $companyId)->get(),
            'filters'     => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'fiscal_year_id' => 'nullable|exists:fiscal_years,id',
            'period_type'    => 'required|in:annual,quarterly,monthly,project',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date|after:start_date',
            'description'    => 'nullable|string',
        ]);

        Budget::create([
            'company_id'    => $request->user()->company_id,
            'fiscal_year_id'=> $data['fiscal_year_id'] ?? null,
            'name'          => $data['name'],
            'budget_type'   => $data['period_type'],
            'start_date'    => $data['start_date'],
            'end_date'      => $data['end_date'],
            'description'   => $data['description'] ?? null,
            'status'        => 'draft',
            'total_amount'  => 0,
            'spent_amount'  => 0,
            'remaining_amount' => 0,
            'created_by'    => $request->user()->id,
        ]);

        return redirect()->route('budget.index')->with('success', 'Budget created.');
    }

    public function update(Request $request, Budget $budget)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'fiscal_year_id' => 'nullable|exists:fiscal_years,id',
            'period_type'    => 'nullable|in:annual,quarterly,monthly,project',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date|after:start_date',
            'total_amount'   => 'nullable|numeric|min:0',
            'description'    => 'nullable|string',
        ]);

        $budget->update([
            'fiscal_year_id' => $data['fiscal_year_id'] ?? $budget->fiscal_year_id,
            'name'           => $data['name'],
            'budget_type'    => $data['period_type'] ?? $budget->budget_type,
            'start_date'     => $data['start_date'],
            'end_date'       => $data['end_date'],
            'total_amount'   => $data['total_amount'] ?? $budget->total_amount,
            'remaining_amount'=> ($data['total_amount'] ?? $budget->total_amount) - $budget->spent_amount,
            'description'    => $data['description'] ?? null,
        ]);

        return redirect()->route('budget.show', $budget)->with('success', 'Budget updated.');
    }

    public function show(Budget $budget)
    {
        $budget->load('lines.account', 'fiscalYear');
        return Inertia::render('Budget/Show', ['budget' => $budget]);
    }

    public function approve(Request $request, Budget $budget)
    {
        $budget->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);
        return back()->with('success', 'Budget approved.');
    }

    public function destroy(Budget $budget)
    {
        $budget->lines()->delete();
        $budget->delete();
        return redirect()->route('budget.index')->with('success', 'Budget deleted.');
    }

    public function forecast(Request $request)
    {
        $companyId = $request->user()->company_id;

        $budgets = Budget::where('company_id', $companyId)
            ->where('status', 'approved')
            ->latest()
            ->get();

        return Inertia::render('Budget/Forecast', [
            'budgets'   => $budgets,
            'forecasts' => [],
        ]);
    }

    public function variance(Request $request)
    {
        $companyId = $request->user()->company_id;

        $budgets = Budget::where('company_id', $companyId)
            ->latest()
            ->get();

        return Inertia::render('Budget/Variance', [
            'budgets' => $budgets,
        ]);
    }
}
