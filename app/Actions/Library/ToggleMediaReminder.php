<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;

class ToggleMediaReminder
{
    public function handle(User $user, Media $media): bool
    {
        $entry = UserMedia::query()->firstOrCreate(
            [
                'media_id' => $media->id,
                'user_id' => $user->id,
            ],
            ['status' => 'following'],
        );

        $entry->update(['reminders_enabled' => ! $entry->reminders_enabled]);

        return $entry->reminders_enabled;
    }
}
