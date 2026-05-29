<?php

namespace App\Http\Controllers\Approvals;

use App\Http\Controllers\Controller;
use App\Models\ApprovalRequest;
use App\Models\ApprovalLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    public function index(Request $request)
    {
        $user      = $request->user();
        $companyId = $user->company_id;

        $query = ApprovalRequest::where('company_id', $companyId)
            ->with(['requester:id,name,email', 'approvable'])
            ->latest();

        if ($request->tab === 'mine') {
            $query->where('current_approver_id', $user->id);
        } elseif ($request->tab === 'pending') {
            $query->where('status', 'pending');
        } elseif ($request->tab === 'completed') {
            $query->whereIn('status', ['approved', 'rejected', 'cancelled']);
        }

        if ($request->module) {
            $query->where('module', $request->module);
        }

        $approvals = $query->paginate(20)->withQueryString();

        $stats = [
            'pending'   => ApprovalRequest::where('company_id', $companyId)->where('status', 'pending')->count(),
            'mine'      => ApprovalRequest::where('company_id', $companyId)->where('current_approver_id', $user->id)->where('status', 'pending')->count(),
            'approved'  => ApprovalRequest::where('company_id', $companyId)->where('status', 'approved')->count(),
            'rejected'  => ApprovalRequest::where('company_id', $companyId)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Approvals/Index', [
            'approvals' => $approvals,
            'stats'     => $stats,
            'filters'   => $request->only(['tab', 'module']),
        ]);
    }

    public function approve(Request $request, ApprovalRequest $approval)
    {
        $request->validate(['comment' => 'nullable|string|max:1000']);

        $approval->update([
            'status'       => 'approved',
            'completed_at' => now(),
        ]);

        ApprovalLog::create([
            'approval_request_id' => $approval->id,
            'approver_id'         => $request->user()->id,
            'step'                => $approval->current_step,
            'action'              => 'approved',
            'comment'             => $request->comment,
            'acted_at'            => now(),
        ]);

        // Sync status back to the approvable model if it supports it
        $approvable = $approval->approvable;
        if ($approvable && method_exists($approvable, 'fill')) {
            if (in_array('status', $approvable->getFillable())) {
                $approvable->update(['status' => 'approved']);
            }
        }

        return back()->with('success', 'Request approved.');
    }

    public function reject(Request $request, ApprovalRequest $approval)
    {
        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $approval->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->comment,
            'completed_at'     => now(),
        ]);

        ApprovalLog::create([
            'approval_request_id' => $approval->id,
            'approver_id'         => $request->user()->id,
            'step'                => $approval->current_step,
            'action'              => 'rejected',
            'comment'             => $request->comment,
            'acted_at'            => now(),
        ]);

        $approvable = $approval->approvable;
        if ($approvable && method_exists($approvable, 'fill')) {
            if (in_array('status', $approvable->getFillable())) {
                $approvable->update([
                    'status'           => 'rejected',
                    'rejection_reason' => $request->comment,
                ]);
            }
        }

        return back()->with('success', 'Request rejected.');
    }
}
