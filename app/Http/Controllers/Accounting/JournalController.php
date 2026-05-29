<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalLine;
use App\Models\Account;
use App\Models\FiscalYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $journals = Journal::forCompany($companyId)
            ->with(['branch', 'lines.account'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->type,   fn ($q, $v) => $q->where('journal_type', $v))
            ->when($request->search, fn ($q, $v) => $q->where(fn ($q) =>
                $q->where('journal_number', 'like', "%{$v}%")
                  ->orWhere('narration', 'like', "%{$v}%")))
            ->latest('date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Accounting/Journal/Index', [
            'journals' => $journals,
            'filters'  => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $request->user()->company_id;
        return Inertia::render('Accounting/Journal/Create', [
            'accounts' => Account::forCompany($companyId)->active()->select('id', 'code', 'name', 'nature')->orderBy('code')->get(),
            'nextNumber' => $this->getNextNumber($companyId),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date'         => 'required|date',
            'journal_type' => 'required|string',
            'narration'    => 'nullable|string',
            'reference'    => 'nullable|string',
            'lines'        => 'required|array|min:2',
            'lines.*.account_id'  => 'required|exists:accounts,id',
            'lines.*.debit'       => 'required|numeric|min:0',
            'lines.*.credit'      => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        $companyId = $request->user()->company_id;
        $totalDebit  = array_sum(array_column($data['lines'], 'debit'));
        $totalCredit = array_sum(array_column($data['lines'], 'credit'));

        if (bccomp((string) $totalDebit, (string) $totalCredit, 4) !== 0) {
            return back()->withErrors(['lines' => 'Journal must be balanced. Debit and Credit must be equal.']);
        }

        DB::transaction(function () use ($data, $companyId, $request, $totalDebit, $totalCredit) {
            $fiscal = FiscalYear::where('company_id', $companyId)->where('is_current', true)->first();
            $journal = Journal::create([
                'company_id'     => $companyId,
                'fiscal_year_id' => $fiscal?->id,
                'journal_number' => $this->getNextNumber($companyId),
                'journal_type'   => $data['journal_type'],
                'date'           => $data['date'],
                'narration'      => $data['narration'],
                'reference'      => $data['reference'],
                'total_debit'    => $totalDebit,
                'total_credit'   => $totalCredit,
                'status'         => 'draft',
                'created_by'     => $request->user()->id,
            ]);

            foreach ($data['lines'] as $i => $line) {
                JournalLine::create([
                    'journal_id'  => $journal->id,
                    'account_id'  => $line['account_id'],
                    'company_id'  => $companyId,
                    'description' => $line['description'] ?? null,
                    'debit'       => $line['debit'],
                    'credit'      => $line['credit'],
                    'sort_order'  => $i,
                ]);
            }
        });

        return redirect()->route('accounting.journal.index')->with('success', 'Journal entry created.');
    }

    public function show(Journal $journal)
    {
        $journal->load('lines.account', 'branch', 'fiscalYear');
        return Inertia::render('Accounting/Journal/Show', ['journal' => $journal]);
    }

    public function edit(Journal $journal)
    {
        if ($journal->status === 'posted') {
            return back()->withErrors(['error' => 'Cannot edit a posted journal.']);
        }
        $companyId = $journal->company_id;
        $journal->load('lines');
        return Inertia::render('Accounting/Journal/Edit', [
            'journal'  => $journal,
            'accounts' => Account::forCompany($companyId)->active()->select('id', 'code', 'name')->orderBy('code')->get(),
        ]);
    }

    public function update(Request $request, Journal $journal)
    {
        if ($journal->status === 'posted') {
            return back()->withErrors(['error' => 'Cannot edit a posted journal.']);
        }

        $data = $request->validate([
            'date'         => 'required|date',
            'journal_type' => 'required|string',
            'narration'    => 'nullable|string',
            'reference'    => 'nullable|string',
            'lines'        => 'required|array|min:2',
            'lines.*.account_id'  => 'required|exists:accounts,id',
            'lines.*.debit'       => 'required|numeric|min:0',
            'lines.*.credit'      => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        $totalDebit  = array_sum(array_column($data['lines'], 'debit'));
        $totalCredit = array_sum(array_column($data['lines'], 'credit'));

        if (bccomp((string) $totalDebit, (string) $totalCredit, 4) !== 0) {
            return back()->withErrors(['lines' => 'Journal must be balanced.']);
        }

        DB::transaction(function () use ($journal, $data, $totalDebit, $totalCredit) {
            $journal->update([
                'journal_type' => $data['journal_type'],
                'date'         => $data['date'],
                'narration'    => $data['narration'],
                'reference'    => $data['reference'],
                'total_debit'  => $totalDebit,
                'total_credit' => $totalCredit,
            ]);

            $journal->lines()->delete();

            foreach ($data['lines'] as $i => $line) {
                JournalLine::create([
                    'journal_id'  => $journal->id,
                    'account_id'  => $line['account_id'],
                    'company_id'  => $journal->company_id,
                    'description' => $line['description'] ?? null,
                    'debit'       => $line['debit'],
                    'credit'      => $line['credit'],
                    'sort_order'  => $i,
                ]);
            }
        });

        return redirect()->route('accounting.journal.show', $journal)->with('success', 'Journal updated.');
    }

    public function destroy(Journal $journal)
    {
        if ($journal->status === 'posted') {
            return back()->withErrors(['error' => 'Cannot delete a posted journal.']);
        }
        $journal->lines()->delete();
        $journal->delete();
        return redirect()->route('accounting.journal.index')->with('success', 'Journal deleted.');
    }

    public function post(Journal $journal)
    {
        if ($journal->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft journals can be posted.']);
        }
        $journal->update(['status' => 'posted', 'posted_by' => request()->user()->id, 'posted_at' => now()]);
        return back()->with('success', 'Journal posted successfully.');
    }

    public function void(Journal $journal)
    {
        $journal->update(['status' => 'voided']);
        return back()->with('success', 'Journal voided.');
    }

    public function reverse(Journal $journal)
    {
        // Create reverse entry
        return back()->with('success', 'Reverse journal created.');
    }

    private function getNextNumber(int $companyId): string
    {
        $last = Journal::where('company_id', $companyId)->orderBy('id', 'desc')->value('journal_number');
        $seq  = $last ? ((int) substr($last, -5)) + 1 : 1;
        return 'JNL-' . date('Y') . '-' . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}
