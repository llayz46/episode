<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;

class RateMedia
{
    public function handle(User $user, Media $media, int $rating): void
    {
        UserMedia::query()->updateOrCreate(
            [
                'media_id' => $media->id,
                'user_id' => $user->id,
            ],
            ['rating' => $rating],
        );
    }
}
