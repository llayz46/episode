<?php

namespace App\Http\Controllers;

use App\Actions\Library\FollowMedia;
use App\Actions\Library\SetFeaturedMedia;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MediaLibraryController extends Controller
{
    public function follow(
        Request $request,
        Media $media,
        FollowMedia $followMedia,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $followMedia->handle($user, $media);

        return back();
    }

    public function feature(
        Request $request,
        Media $media,
        SetFeaturedMedia $setFeaturedMedia,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $setFeaturedMedia->handle($user, $media);

        return back();
    }
}
