<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;
use Illuminate\Support\Facades\DB;

class SetFeaturedMedia
{
    public function handle(User $user, Media $media): void
    {
        DB::transaction(function () use ($media, $user): void {
            $user->mediaLibrary()->update(['is_featured' => false]);

            $entry = UserMedia::query()->firstOrCreate(
                [
                    'media_id' => $media->id,
                    'user_id' => $user->id,
                ],
                ['status' => 'following'],
            );

            $entry->update(['is_featured' => true]);
        });
    }
}
