<?php

namespace App\Http\Controllers;

use App\Actions\Home\BuildHomeDashboard;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class HomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, BuildHomeDashboard $dashboard): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('home', $dashboard->handle($user));
    }
}
