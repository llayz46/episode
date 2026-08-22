<?php

namespace App\Actions\Library;

use App\Models\Episode;
use App\Models\User;
use App\Models\UserEpisode;

class RateEpisode
{
    public function handle(User $user, Episode $episode, int $rating): void
    {
        UserEpisode::query()->updateOrCreate(
            [
                'episode_id' => $episode->id,
                'user_id' => $user->id,
            ],
            ['rating' => $rating],
        );
    }
}
