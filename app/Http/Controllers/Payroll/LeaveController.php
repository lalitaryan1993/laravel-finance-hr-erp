<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveAllocation;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaveController extends Controller
{
    // ─── Leave Types ──────────────────────────────────────────────────────────

    public function types(Request $request)
    {
        $companyId = $request->user()->company_id;
        $types     = LeaveType::forCompany($companyId)->orderBy('name')->get();

        return Inertia::render('Payroll/Leave/Types', [
            'types' => $types,
        ]);
    }

    public function storeType(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:100',
            'code'              => 'required|string|max:20',
            'days_per_year'     => 'required|numeric|min:0|max:365',
            'carry_forward'     => 'boolean',
            'carry_forward_max' => 'nullable|numeric|min:0',
            'pay_status'        => 'required|in:paid,unpaid,half_paid',
            'requires_approval' => 'boolean',
            'description'       => 'nullable|string|max:500',
            'is_active'         => 'boolean',
        ]);

        $data['company_id'] = $request->user()->company_id;

        LeaveType::create($data);

        return back()->with('success', 'Leave type created.');
    }

    public function updateType(Request $request, LeaveType $leaveType)
    {
        $this->authorizeCompany($request, $leaveType->company_id);

        $data = $request->validate([
            'name'              => 'required|string|max:100',
            'code'              => 'required|string|max:20',
            'days_per_year'     => 'required|numeric|min:0|max:365',
            'carry_forward'     => 'boolean',
            'carry_forward_max' => 'nullable|numeric|min:0',
            'pay_status'        => 'required|in:paid,unpaid,half_paid',
            'requires_approval' => 'boolean',
            'description'       => 'nullable|string|max:500',
            'is_active'         => 'boolean',
        ]);

        $leaveType->update($data);

        return back()->with('success', 'Leave type updated.');
    }

    public function destroyType(Request $request, LeaveType $leaveType)
    {
        $this->authorizeCompany($request, $leaveType->company_id);
        $leaveType->delete();

        return back()->with('success', 'Leave type deleted.');
    }

    // ─── Leave Allocations ────────────────────────────────────────────────────

    public function allocations(Request $request)
    {
        $companyId = $request->user()->company_id;
        $year      = $request->year ?? now()->year;

        $employees = Employee::forCompany($companyId)->active()
            ->select('id', 'first_name', 'last_name', 'employee_code')
            ->orderBy('first_name')
            ->get();

        $types = LeaveType::forCompany($companyId)->active()->get();

        $allocations = LeaveAllocation::where('company_id', $companyId)
            ->where('year', $year)
            ->with(['employee:id,first_name,last_name', 'leaveType:id,name,code'])
            ->get();

        return Inertia::render('Payroll/Leave/Allocations', [
            'employees'   => $employees,
            'types'       => $types,
            'allocations' => $allocations,
            'year'        => (int) $year,
        ]);
    }

    public function allocate(Request $request)
    {
        $data = $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'year'          => 'required|integer|min:2020|max:2099',
            'allocated_days'=> 'required|numeric|min:0|max:365',
        ]);

        $data['company_id']  = $request->user()->company_id;
        $data['used_days']   = 0;
        $data['balance_days']= $data['allocated_days'];

        LeaveAllocation::updateOrCreate(
            [
                'company_id'    => $data['company_id'],
                'employee_id'   => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'year'          => $data['year'],
            ],
            $data
        );

        return back()->with('success', 'Leave allocated.');
    }

    public function bulkAllocate(Request $request)
    {
        $data = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'year'          => 'required|integer|min:2020|max:2099',
            'allocated_days'=> 'required|numeric|min:0|max:365',
        ]);

        $companyId = $request->user()->company_id;
        $leaveType = LeaveType::where('company_id', $companyId)->findOrFail($data['leave_type_id']);
        $employees = Employee::forCompany($companyId)->active()->pluck('id');

        DB::transaction(function () use ($employees, $leaveType, $data, $companyId) {
            foreach ($employees as $empId) {
                LeaveAllocation::updateOrCreate(
                    [
                        'company_id'    => $companyId,
                        'employee_id'   => $empId,
                        'leave_type_id' => $leaveType->id,
                        'year'          => $data['year'],
                    ],
                    [
                        'allocated_days' => $data['allocated_days'],
                        'used_days'      => 0,
                        'balance_days'   => $data['allocated_days'],
                    ]
                );
            }
        });

        return back()->with('success', "Leave allocated to {$employees->count()} employees.");
    }

    // ─── Leave Requests ───────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $status    = $request->status;
        $empId     = $request->employee_id;

        $requests = LeaveRequest::forCompany($companyId)
            ->with(['employee:id,first_name,last_name,employee_code', 'leaveType:id,name,code'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($empId,  fn ($q) => $q->where('employee_id', $empId))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'pending'  => LeaveRequest::forCompany($companyId)->where('status', 'pending')->count(),
            'approved' => LeaveRequest::forCompany($companyId)->where('status', 'approved')->count(),
            'rejected' => LeaveRequest::forCompany($companyId)->where('status', 'rejected')->count(),
        ];

        $employees = Employee::forCompany($companyId)->active()
            ->select('id', 'first_name', 'last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('Payroll/Leave/Index', [
            'requests'  => $requests,
            'stats'     => $stats,
            'employees' => $employees,
            'filters'   => $request->only(['status', 'employee_id']),
        ]);
    }

    public function apply(Request $request)
    {
        $companyId = $request->user()->company_id;

        $employees = Employee::forCompany($companyId)->active()
            ->select('id', 'first_name', 'last_name', 'employee_code')
            ->orderBy('first_name')
            ->get();

        $types = LeaveType::forCompany($companyId)->active()->get();

        return Inertia::render('Payroll/Leave/Apply', [
            'employees' => $employees,
            'types'     => $types,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'from_date'     => 'required|date',
            'to_date'       => 'required|date|after_or_equal:from_date',
            'reason'        => 'nullable|string|max:500',
        ]);

        $companyId = $request->user()->company_id;
        $from      = Carbon::parse($data['from_date']);
        $to        = Carbon::parse($data['to_date']);
        $days      = $from->diffInWeekdays($to) + 1;

        $leaveType = LeaveType::where('company_id', $companyId)->findOrFail($data['leave_type_id']);

        $allocation = LeaveAllocation::where([
            'company_id'    => $companyId,
            'employee_id'   => $data['employee_id'],
            'leave_type_id' => $data['leave_type_id'],
            'year'          => $from->year,
        ])->first();

        if ($allocation && $allocation->balance_days < $days) {
            return back()->withErrors(['days' => "Insufficient balance. Available: {$allocation->balance_days} days."]);
        }

        DB::transaction(function () use ($data, $days, $companyId, $leaveType, $allocation) {
            $status = $leaveType->requires_approval ? 'pending' : 'approved';

            LeaveRequest::create([
                'company_id'    => $companyId,
                'employee_id'   => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'from_date'     => $data['from_date'],
                'to_date'       => $data['to_date'],
                'days'          => $days,
                'reason'        => $data['reason'] ?? null,
                'status'        => $status,
            ]);

            if ($status === 'approved' && $allocation) {
                $allocation->increment('used_days', $days);
                $allocation->decrement('balance_days', $days);
            }
        });

        return redirect()->route('payroll.leave.index')->with('success', 'Leave request submitted.');
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $companyId = $request->user()->company_id;
        abort_unless($leaveRequest->company_id === $companyId, 403);
        abort_unless($leaveRequest->status === 'pending', 422, 'Request is not pending.');

        DB::transaction(function () use ($leaveRequest, $request) {
            $leaveRequest->update([
                'status'      => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            $allocation = LeaveAllocation::where([
                'company_id'    => $leaveRequest->company_id,
                'employee_id'   => $leaveRequest->employee_id,
                'leave_type_id' => $leaveRequest->leave_type_id,
                'year'          => Carbon::parse($leaveRequest->from_date)->year,
            ])->first();

            if ($allocation) {
                $allocation->increment('used_days', (int) $leaveRequest->days);
                $allocation->decrement('balance_days', (int) $leaveRequest->days);
            }
        });

        return back()->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $companyId = $request->user()->company_id;
        abort_unless($leaveRequest->company_id === $companyId, 403);
        abort_unless($leaveRequest->status === 'pending', 422, 'Request is not pending.');

        $request->validate(['rejection_reason' => 'nullable|string|max:500']);

        $leaveRequest->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by'      => $request->user()->id,
            'approved_at'      => now(),
        ]);

        return back()->with('success', 'Leave request rejected.');
    }

    public function cancel(Request $request, LeaveRequest $leaveRequest)
    {
        $companyId = $request->user()->company_id;
        abort_unless($leaveRequest->company_id === $companyId, 403);
        abort_unless(in_array($leaveRequest->status, ['pending', 'approved']), 422, 'Cannot cancel this request.');

        DB::transaction(function () use ($leaveRequest) {
            if ($leaveRequest->status === 'approved') {
                $allocation = LeaveAllocation::where([
                    'company_id'    => $leaveRequest->company_id,
                    'employee_id'   => $leaveRequest->employee_id,
                    'leave_type_id' => $leaveRequest->leave_type_id,
                    'year'          => Carbon::parse($leaveRequest->from_date)->year,
                ])->first();

                if ($allocation) {
                    $allocation->decrement('used_days', (int) $leaveRequest->days);
                    $allocation->increment('balance_days', (int) $leaveRequest->days);
                }
            }

            $leaveRequest->update(['status' => 'cancelled']);
        });

        return back()->with('success', 'Leave request cancelled.');
    }

    // ─── Employee Leave Balance ───────────────────────────────────────────────

    public function balance(Request $request)
    {
        $companyId  = $request->user()->company_id;
        $employeeId = $request->employee_id;
        $year       = $request->year ?? now()->year;

        $employees = Employee::forCompany($companyId)->active()
            ->select('id', 'first_name', 'last_name', 'employee_code', 'designation')
            ->orderBy('first_name')
            ->get();

        $employee = $employeeId
            ? Employee::forCompany($companyId)->find($employeeId)
            : null;

        $balances = [];
        $requests = [];

        if ($employee) {
            $balances = LeaveAllocation::where('company_id', $companyId)
                ->where('employee_id', $employeeId)
                ->where('year', $year)
                ->with('leaveType:id,name,code,pay_status')
                ->get();

            $requests = LeaveRequest::where('company_id', $companyId)
                ->where('employee_id', $employeeId)
                ->whereYear('from_date', $year)
                ->with('leaveType:id,name')
                ->orderByDesc('from_date')
                ->get();
        }

        return Inertia::render('Payroll/Leave/Balance', [
            'employees' => $employees,
            'employee'  => $employee,
            'balances'  => $balances,
            'requests'  => $requests,
            'year'      => (int) $year,
        ]);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private function authorizeCompany(Request $request, int $companyId): void
    {
        abort_unless($request->user()->company_id === $companyId, 403);
    }
}
