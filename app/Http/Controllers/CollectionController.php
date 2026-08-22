<?php

namespace App\Http\Controllers;

use App\Actions\Library\BuildCollection;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CollectionController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, BuildCollection $collection): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('collection', $collection->handle($user));
    }
}
