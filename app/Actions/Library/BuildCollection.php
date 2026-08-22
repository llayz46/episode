<?php

namespace App\Actions\Library;

use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserMedia;
use Carbon\CarbonInterface;

class BuildCollection
{
    /**
     * @return array{items: array<int, array{image: string, isFeatured: bool, kind: 'film'|'series', libraryStatus: string, platform: string, slug: string, status: 'airing'|'binge-ready', subtitle: string, title: string, year: string}>, total: int}
     */
    public function handle(User $user): array
    {
        $entries = $user->mediaLibrary()
            ->with('media.seasons.episodes')
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
     * @return array<string, mixed>
     */
    private function item(UserMedia $entry): array
    {
        /** @var Media $media */
        $media = $entry->media;
        $season = $this->currentSeason($media);
        $episodes = $season?->episodes->sortBy('number')->values() ?? collect();
        $today = now()->startOfDay();
        $releasedEpisodes = $episodes
            ->filter(fn ($episode): bool => $episode->aired_on?->lessThanOrEqualTo($today) ?? false)
            ->values();
        $nextEpisode = $episodes
            ->first(fn ($episode): bool => $episode->aired_on?->greaterThan($today) ?? false);
        $isAiring = $media->type === 'tv' && $nextEpisode !== null;

        return array_filter([
            'description' => $media->synopsis,
            'genres' => $media->genres,
            'image' => $this->imageUrl($media->backdrop_path, 'w1280')
                ?? $this->imageUrl($media->poster_path, 'w780')
                ?? '',
            'isFeatured' => $entry->is_featured,
            'isFollowed' => in_array($entry->status, ['following', 'watching'], true),
            'kind' => $media->type === 'tv' ? 'series' : 'film',
            'libraryStatus' => $entry->status,
            'platform' => $media->networks[0] ?? 'TMDB',
            'poster' => $this->imageUrl($media->poster_path, 'w500')
                ?? $this->imageUrl($media->backdrop_path, 'w780')
                ?? '',
            'nextEpisode' => $nextEpisode
                ? "Prochain épisode · {$this->formatDate($nextEpisode->aired_on)}"
                : null,
            'rating' => $media->vote_average !== null ? (float) $media->vote_average : null,
            'releasedEpisodes' => $season ? $releasedEpisodes->count() : null,
            'remindersEnabled' => $entry->reminders_enabled,
            'seasonComplete' => $season ? $this->formatDate($episodes->max('aired_on')) : null,
            'slug' => $media->slug,
            'status' => $isAiring ? 'airing' : 'binge-ready',
            'subtitle' => $season ? "Saison {$season->number}" : 'Film',
            'title' => $media->title,
            'totalEpisodes' => $season?->episode_count,
            'userRating' => $entry->rating,
            'voteCount' => $media->vote_count,
            'year' => $media->released_on?->format('Y') ?? '',
        ], fn (mixed $value): bool => $value !== null);
    }

    private function currentSeason(Media $media): ?Season
    {
        return $media->seasons
            ->filter(fn (Season $season): bool => $season->number > 0 && $season->episodes->isNotEmpty())
            ->sortByDesc('number')
            ->first();
    }

    private function formatDate(?CarbonInterface $date): ?string
    {
        return $date?->locale('fr')->translatedFormat('j F');
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }
}
