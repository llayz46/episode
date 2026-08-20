<?php

namespace App\Http\Controllers;

use App\Actions\Tmdb\SearchTmdbMedia;
use App\Http\Requests\TmdbSearchRequest;
use Illuminate\Http\JsonResponse;

class TmdbSearchController extends Controller
{
    public function __invoke(TmdbSearchRequest $request, SearchTmdbMedia $search): JsonResponse
    {
        $validated = $request->validated();

        return response()->json([
            'results' => $search->handle($validated['query'], $validated['type']),
        ]);
    }
}
