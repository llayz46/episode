<?php

namespace App\Http\Controllers;

use App\Actions\Tmdb\ImportTmdbMedia;
use App\Http\Requests\ImportTmdbMediaRequest;
use Illuminate\Http\RedirectResponse;

class MediaImportController extends Controller
{
    public function store(ImportTmdbMediaRequest $request, ImportTmdbMedia $import): RedirectResponse
    {
        $validated = $request->validated();
        $media = $import->handle($validated['tmdb_id'], $validated['type']);

        return to_route('media.show', $media->slug);
    }
}
