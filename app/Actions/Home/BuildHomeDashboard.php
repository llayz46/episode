<?php

namespace App\Actions\Home;

use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserMedia;
use Carbon\CarbonInterface;

class BuildHomeDashboard
{
    /**
     * @return array{featuredMedia: array<string, mixed>|null, trackedMedia: array<int, array<string, mixed>>}
     */
    public function handle(User $user): array
    {
        $trackedEntries = $user->mediaLibrary()
            ->whereIn('status', ['following', 'watching'])
            ->with(['media.seasons.episodes'])
            ->orderByDesc('is_featured')
            ->latest('updated_at')
            ->get();
        $featuredEntry = $user->mediaLibrary()
            ->where('is_featured', true)
            ->with(['media.seasons.episodes'])
            ->first();
        $featuredMedia = $featuredEntry?->media
            ?? $trackedEntries->first()?->media
            ?? Media::query()
                ->with(['seasons.episodes'])
                ->orderByDesc('vote_count')
                ->first();

        return [
            'featuredMedia' => $featuredMedia ? $this->mediaItem($featuredMedia) : null,
            'trackedMedia' => $trackedEntries
                ->map(fn (UserMedia $entry): ?array => $entry->media ? $this->mediaItem($entry->media) : null)
                ->filter()
                ->take(3)
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array{image: string, kind: 'film'|'series', nextEpisode?: string, platform: string, releasedEpisodes?: int, seasonComplete?: string, slug: string, status: 'airing'|'binge-ready', subtitle: string, title: string, totalEpisodes?: int, year: string}
     */
    private function mediaItem(Media $media): array
    {
        $season = $media->seasons
            ->filter(fn (Season $season): bool => $season->number > 0 && $season->episodes->isNotEmpty())
            ->sortByDesc('number')
            ->first();
        $episodes = $season?->episodes->sortBy('number')->values() ?? collect();
        $today = now()->startOfDay();
        $releasedEpisodes = $episodes
            ->filter(fn ($episode): bool => $episode->aired_on?->lessThanOrEqualTo($today) ?? false)
            ->values();
        $nextEpisode = $episodes
            ->first(fn ($episode): bool => $episode->aired_on?->greaterThan($today) ?? false);
        $isAiring = $media->type === 'tv' && $season && $nextEpisode !== null;

        return array_filter([
            'image' => $this->imageUrl($media->backdrop_path, 'w1280')
                ?? $this->imageUrl($media->poster_path, 'w780')
                ?? '',
            'kind' => $media->type === 'tv' ? 'series' : 'film',
            'nextEpisode' => $nextEpisode
                ? "Prochain épisode · {$this->formatDate($nextEpisode->aired_on)}"
                : null,
            'platform' => $media->networks[0] ?? 'TMDB',
            'releasedEpisodes' => $season ? $releasedEpisodes->count() : null,
            'seasonComplete' => $season ? $this->formatDate($episodes->max('aired_on')) : null,
            'slug' => $media->slug,
            'status' => $isAiring ? 'airing' : 'binge-ready',
            'subtitle' => $season ? "Saison {$season->number}" : 'Film',
            'title' => $media->title,
            'totalEpisodes' => $season?->episode_count,
            'year' => $media->released_on?->format('Y') ?? '',
        ], fn (mixed $value): bool => $value !== null);
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
