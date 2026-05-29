<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user'        => $user ? [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'avatar_url'  => $user->avatar_url,
                    'initials'    => $user->initials,
                    'company_id'  => $user->company_id,
                    'branch_id'   => $user->branch_id,
                    'designation' => $user->designation,
                ] : null,
                'role'        => $user?->getRoleNames()->first(),
                'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'company'    => $user?->company ? [
                'id'              => $user->company->id,
                'name'            => $user->company->name,
                'currency'        => $user->company->currency,
                'currency_symbol' => $user->company->currency_symbol,
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
            'notifications' => $user ? \App\Models\SystemNotification::where('notifiable_id', $user->id)
                ->where('notifiable_type', \App\Models\User::class)
                ->whereNull('read_at')
                ->latest()
                ->take(10)
                ->get(['id', 'type', 'title', 'message', 'action_url', 'read_at', 'created_at']) : [],
        ]);
    }
}
