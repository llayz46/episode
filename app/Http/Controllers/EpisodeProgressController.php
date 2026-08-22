<?php

namespace App\Http\Controllers;

use App\Actions\Library\RateEpisode;
use App\Actions\Library\ToggleEpisodeWatched;
use App\Http\Requests\StoreEpisodeRatingRequest;
use App\Models\Episode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EpisodeProgressController extends Controller
{
    public function toggleWatched(
        Episode $episode,
        ToggleEpisodeWatched $toggleEpisodeWatched,
        Request $request,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $toggleEpisodeWatched->handle($user, $episode);

        return back();
    }

    public function rate(
        Episode $episode,
        RateEpisode $rateEpisode,
        StoreEpisodeRatingRequest $request,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();

        $rateEpisode->handle($user, $episode, $validated['rating']);

        return back();
    }
}
