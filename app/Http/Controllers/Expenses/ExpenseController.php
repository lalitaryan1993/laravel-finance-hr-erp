<?php

namespace App\Http\Controllers\Expenses;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpensePolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $expenses = Expense::where('company_id', $companyId)
            ->with('category', 'submittedBy')
            ->when($request->search, fn ($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest('expense_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Expenses/Index', [
            'expenses'   => $expenses,
            'categories' => ExpenseCategory::where('company_id', $companyId)->where('is_active', true)->get(),
            'filters'    => $request->only(['search', 'status', 'category_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'category_id'  => 'nullable|exists:expense_categories,id',
            'expense_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0.01',
            'currency'     => 'required|size:3',
            'description'  => 'nullable|string',
        ]);

        $companyId = $request->user()->company_id;
        $count = Expense::where('company_id', $companyId)->count() + 1;

        Expense::create(array_merge($data, [
            'company_id'     => $companyId,
            'expense_number' => 'EXP-' . date('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT),
            'submitted_by'   => $request->user()->id,
            'status'         => 'pending',
        ]));

        return redirect()->route('expenses.index')->with('success', 'Expense added successfully.');
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;

        return Inertia::render('Expenses/Create', [
            'categories' => ExpenseCategory::where('company_id', $companyId)->where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function show(Expense $expense)
    {
        $expense->load('category', 'submittedBy');
        return Inertia::render('Expenses/Show', ['expense' => $expense]);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'category_id'  => 'nullable|exists:expense_categories,id',
            'expense_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0.01',
            'description'  => 'nullable|string',
        ]);

        $expense->update($data);

        return back()->with('success', 'Expense updated.');
    }

    public function submit(Request $request, Expense $expense)
    {
        $expense->update(['status' => 'submitted']);

        return back()->with('success', 'Expense submitted for approval.');
    }

    public function claims(Request $request)
    {
        $companyId = $request->user()->company_id;

        $claims = Expense::where('company_id', $companyId)
            ->where('submitted_by', $request->user()->id)
            ->with('category')
            ->latest('expense_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Expenses/Claims', [
            'claims'  => $claims,
            'filters' => $request->only(['status']),
        ]);
    }

    public function approvals(Request $request)
    {
        $companyId = $request->user()->company_id;

        $pending = Expense::where('company_id', $companyId)
            ->where('status', 'submitted')
            ->with('category', 'submittedBy:id,name')
            ->latest('expense_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Expenses/Approvals', [
            'pending' => $pending,
        ]);
    }

    public function policies(Request $request)
    {
        $companyId = $request->user()->company_id;

        return Inertia::render('Expenses/Policies', [
            'policies'   => ExpensePolicy::where('company_id', $companyId)
                ->with('category:id,name')
                ->latest()
                ->get(),
            'categories' => ExpenseCategory::where('company_id', $companyId)
                ->where('is_active', true)
                ->get(['id', 'name']),
        ]);
    }

    public function storePolicy(Request $request)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'category_id'        => 'nullable|exists:expense_categories,id',
            'max_amount'         => 'nullable|numeric|min:0',
            'requires_receipt'   => 'boolean',
            'requires_approval'  => 'boolean',
            'approval_threshold' => 'nullable|string|max:100',
            'applicable_to'      => 'nullable|in:all,role,department',
            'is_active'          => 'boolean',
        ]);

        ExpensePolicy::create(array_merge($data, [
            'company_id' => $request->user()->company_id,
        ]));

        return back()->with('success', 'Policy created.');
    }

    public function updatePolicy(Request $request, ExpensePolicy $policy)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'category_id'        => 'nullable|exists:expense_categories,id',
            'max_amount'         => 'nullable|numeric|min:0',
            'requires_receipt'   => 'boolean',
            'requires_approval'  => 'boolean',
            'approval_threshold' => 'nullable|string|max:100',
            'applicable_to'      => 'nullable|in:all,role,department',
            'is_active'          => 'boolean',
        ]);

        $policy->update($data);

        return back()->with('success', 'Policy updated.');
    }

    public function destroyPolicy(ExpensePolicy $policy)
    {
        $policy->delete();
        return back()->with('success', 'Policy deleted.');
    }

    public function approve(Request $request, Expense $expense)
    {
        $expense->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);
        return back()->with('success', 'Expense approved.');
    }

    public function reject(Request $request, Expense $expense)
    {
        $request->validate(['reason' => 'required|string']);
        $expense->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);
        return back()->with('success', 'Expense rejected.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->route('expenses.index')->with('success', 'Expense deleted.');
    }
}
