<?php

namespace App\Actions\Library;

use App\Models\Episode;
use App\Models\User;
use App\Models\UserEpisode;

class ToggleEpisodeWatched
{
    public function handle(User $user, Episode $episode): bool
    {
        $progress = UserEpisode::query()->firstOrCreate([
            'episode_id' => $episode->id,
            'user_id' => $user->id,
        ]);

        $progress->update([
            'watched_at' => $progress->watched_at ? null : now(),
        ]);

        return $progress->watched_at !== null;
    }
}
