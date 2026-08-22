<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;

class BuildCollection
{
    /**
     * @return array{items: array<int, array{image: string, isFeatured: bool, kind: 'film'|'series', libraryStatus: string, platform: string, slug: string, status: 'airing'|'binge-ready', subtitle: string, title: string, year: string}>, total: int}
     */
    public function handle(User $user): array
    {
        $entries = $user->mediaLibrary()
            ->with('media')
            ->orderByDesc('is_featured')
            ->latest('updated_at')
            ->get();

        return [
            'items' => $entries
                ->map(fn (UserMedia $entry): ?array => $entry->media
                    ? $this->item($entry)
                    : null)
                ->filter()
                ->values()
                ->all(),
            'total' => $entries->count(),
        ];
    }

    /**
     * @return array{image: string, isFeatured: bool, kind: 'film'|'series', libraryStatus: string, platform: string, slug: string, status: 'airing'|'binge-ready', subtitle: string, title: string, year: string}
     */
    private function item(UserMedia $entry): array
    {
        /** @var Media $media */
        $media = $entry->media;

        return [
            'image' => $this->imageUrl($media->poster_path, 'w500')
                ?? $this->imageUrl($media->backdrop_path, 'w780')
                ?? '',
            'isFeatured' => $entry->is_featured,
            'kind' => $media->type === 'tv' ? 'series' : 'film',
            'libraryStatus' => $entry->status,
            'platform' => $media->networks[0] ?? 'TMDB',
            'slug' => $media->slug,
            'status' => 'binge-ready',
            'subtitle' => $media->type === 'tv' ? 'Série' : 'Film',
            'title' => $media->title,
            'year' => $media->released_on?->format('Y') ?? '',
        ];
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }
}
