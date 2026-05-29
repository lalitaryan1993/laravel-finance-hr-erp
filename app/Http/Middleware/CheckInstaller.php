<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstaller
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isInstalled = file_exists(storage_path('installed'));

        if (!$isInstalled && !$request->is('install*')) {
            return redirect()->route('installer.index');
        }

        if ($isInstalled && $request->is('install*')) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
