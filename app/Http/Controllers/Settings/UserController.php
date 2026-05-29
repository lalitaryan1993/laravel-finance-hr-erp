<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        // Map user_id → employee for this company
        $employeeByUserId = Employee::where('company_id', $companyId)
            ->whereNotNull('user_id')
            ->get(['id', 'user_id', 'first_name', 'last_name', 'employee_code'])
            ->keyBy('user_id');

        $users = User::where('company_id', $companyId)
            ->with('roles:id,name')
            ->when($request->search, fn ($q, $v) =>
                $q->where(fn ($q) =>
                    $q->where('name', 'like', "%{$v}%")
                      ->orWhere('email', 'like', "%{$v}%")))
            ->when($request->status, fn ($q, $v) => $q->where('is_active', $v === 'active'))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($u) use ($employeeByUserId) {
                $emp = $employeeByUserId->get($u->id);
                return [
                    'id'            => $u->id,
                    'name'          => $u->name,
                    'email'         => $u->email,
                    'phone'         => $u->phone,
                    'designation'   => $u->designation,
                    'is_active'     => $u->is_active,
                    'last_login_at' => $u->last_login_at?->diffForHumans(),
                    'created_at'    => $u->created_at->toDateString(),
                    'roles'         => $u->roles->pluck('name')->values()->all(),
                    'employee'      => $emp ? [
                        'id'   => $emp->id,
                        'name' => trim("{$emp->first_name} {$emp->last_name}"),
                        'code' => $emp->employee_code,
                    ] : null,
                ];
            });

        return Inertia::render('Settings/Users', [
            'users'   => $users,
            'roles'   => Role::pluck('name')->values()->all(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:8',
            'designation' => 'nullable|string|max:100',
            'phone'       => 'nullable|string|max:20',
            'is_active'   => 'boolean',
            'role'        => 'nullable|string|exists:roles,name',
        ]);

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'designation' => $data['designation'] ?? null,
            'phone'       => $data['phone'] ?? null,
            'is_active'   => $data['is_active'] ?? true,
            'company_id'  => $request->user()->company_id,
        ]);

        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email,' . $user->id,
            'designation' => 'nullable|string|max:100',
            'phone'       => 'nullable|string|max:20',
            'is_active'   => 'boolean',
            'password'    => 'nullable|string|min:8',
            'role'        => 'nullable|string|exists:roles,name',
        ]);

        $update = [
            'name'        => $data['name'],
            'email'       => $data['email'],
            'designation' => $data['designation'] ?? null,
            'phone'       => $data['phone'] ?? null,
            'is_active'   => $data['is_active'] ?? $user->is_active,
        ];

        if (!empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }

        $user->update($update);

        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return back()->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        if ($user->id === request()->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User removed.');
    }

    public function create()  { return redirect()->route('settings.users.index'); }
    public function show($id) { return redirect()->route('settings.users.index'); }
    public function edit($id) { return redirect()->route('settings.users.index'); }
}
