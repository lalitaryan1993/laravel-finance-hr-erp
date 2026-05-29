<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class EmployeeAccountController extends Controller
{
    public function createAccount(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        abort_if($employee->user_id, 422, 'Employee already has a linked user account.');

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'role'     => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'company_id' => $employee->company_id,
        ]);

        $user->assignRole($data['role']);
        $employee->update(['user_id' => $user->id]);

        return back()->with('success', 'User account created and linked.');
    }

    public function linkAccount(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        abort_if($employee->user_id, 422, 'Employee already has a linked user account.');

        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $data['email'])->first();
        abort_unless($user->company_id === $employee->company_id, 403, 'User does not belong to this company.');

        $employee->update(['user_id' => $user->id]);

        return back()->with('success', 'User account linked.');
    }

    public function resetPassword(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        abort_unless($employee->user_id, 422, 'No user account linked.');

        $data = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $employee->user->update(['password' => Hash::make($data['password'])]);

        return back()->with('success', 'Password reset successfully.');
    }

    public function unlinkAccount(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        abort_unless($employee->user_id, 422, 'No user account linked.');

        $employee->update(['user_id' => null]);

        return back()->with('success', 'User account unlinked.');
    }

    private function authorizeEmployee(Request $request, Employee $employee): void
    {
        abort_unless($request->user()?->company_id === $employee->company_id, 403);
    }
}
