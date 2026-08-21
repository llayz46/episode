<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;

class FollowMedia
{
    public function handle(User $user, Media $media): void
    {
        UserMedia::query()->firstOrCreate(
            [
                'media_id' => $media->id,
                'user_id' => $user->id,
            ],
            ['status' => 'following'],
        );
    }
}
