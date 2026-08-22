<?php

namespace App\Actions\Home;

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserMedia;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class BuildHomeDashboard
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        $libraryEntries = $user->mediaLibrary()
            ->whereIn('status', ['following', 'watching', 'watchlist'])
            ->with(['media.seasons.episodes'])
            ->orderByDesc('is_featured')
            ->latest('updated_at')
            ->get();
        $trackedEntries = $libraryEntries
            ->whereIn('status', ['following', 'watching'])
            ->values();
        $featuredEntry = $libraryEntries->firstWhere('is_featured', true);
        $featuredEntry ??= $trackedEntries->first();
        $featuredMedia = $featuredEntry?->media
            ?? Media::query()
                ->with(['seasons.episodes'])
                ->orderByDesc('vote_count')
                ->first();
        $today = CarbonImmutable::today();
        $releases = $this->upcomingReleases($trackedEntries, $today);
        $weekEnd = $today->addDays(6);
        $weekReleases = $releases
            ->filter(fn (array $release): bool => $release['date']->lessThanOrEqualTo($weekEnd))
            ->values();
        $weekHighlight = $trackedEntries
            ->map(fn (UserMedia $entry): ?array => $entry->media ? $this->mediaItem($entry->media, $entry) : null)
            ->first(fn (?array $media): bool => $media !== null && $media['status'] === 'airing');

        return [
            'bingeReady' => $libraryEntries
                ->filter(fn (UserMedia $entry): bool => $entry->media !== null && $this->isBingeReady($entry->media, $today))
                ->map(fn (UserMedia $entry): array => $this->mediaItem($entry->media, $entry))
                ->take(8)
                ->values()
                ->all(),
            'featuredMedia' => $featuredMedia ? $this->mediaItem($featuredMedia, $featuredEntry) : null,
            'trackedMedia' => $trackedEntries
                ->map(fn (UserMedia $entry): ?array => $entry->media ? $this->mediaItem($entry->media, $entry) : null)
                ->filter()
                ->take(3)
                ->values()
                ->all(),
            'upcomingReleases' => $releases
                ->take(5)
                ->map(fn (array $release): array => $this->serializeRelease($release))
                ->all(),
            'week' => [
                'days' => collect(range(0, 6))
                    ->map(function (int $offset) use ($today, $weekReleases): array {
                        $date = $today->addDays($offset);

                        return [
                            'date' => $date->toDateString(),
                            'hasRelease' => $weekReleases->contains(
                                fn (array $release): bool => $release['date']->isSameDay($date),
                            ),
                        ];
                    })
                    ->all(),
                'highlight' => $weekHighlight,
                'releaseCount' => $weekReleases->count(),
            ],
        ];
    }

    /**
     * @param  Collection<int, UserMedia>  $entries
     * @return Collection<int, array<string, mixed>>
     */
    private function upcomingReleases(Collection $entries, CarbonImmutable $today): Collection
    {
        $episodeReleases = $entries
            ->filter(fn (UserMedia $entry): bool => $entry->media?->type === 'tv')
            ->flatMap(function (UserMedia $entry) use ($today): Collection {
                $media = $entry->media;

                return $media->seasons->flatMap(
                    fn (Season $season): Collection => $season->episodes
                        ->filter(fn (Episode $episode): bool => $episode->aired_on?->greaterThanOrEqualTo($today) ?? false)
                        ->map(fn (Episode $episode): array => $this->episodeRelease($entry, $season, $episode)),
                );
            });
        $movieReleases = $entries
            ->filter(function (UserMedia $entry) use ($today): bool {
                $releasedOn = $entry->media?->released_on;

                return $entry->media?->type === 'movie' && $releasedOn?->greaterThanOrEqualTo($today);
            })
            ->map(fn (UserMedia $entry): array => $this->movieRelease($entry));

        return $episodeReleases
            ->merge($movieReleases)
            ->sortBy('date')
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function episodeRelease(UserMedia $entry, Season $season, Episode $episode): array
    {
        $media = $entry->media;
        $mediaItem = $this->mediaItem($media, $entry);

        return [
            'date' => $episode->aired_on,
            'episode' => sprintf('S%02dE%02d', $season->number, $episode->number),
            'image' => $this->imageUrl($episode->still_path, 'w342') ?? $mediaItem['image'],
            'media' => $mediaItem,
            'title' => $media->title,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function movieRelease(UserMedia $entry): array
    {
        $media = $entry->media;
        $mediaItem = $this->mediaItem($media, $entry);

        return [
            'date' => $media->released_on,
            'episode' => 'Film · Sortie',
            'image' => $mediaItem['image'],
            'media' => $mediaItem,
            'title' => $media->title,
        ];
    }

    /**
     * @param  array<string, mixed>  $release
     * @return array<string, mixed>
     */
    private function serializeRelease(array $release): array
    {
        return [
            ...$release,
            'date' => $release['date']->toDateString(),
        ];
    }

    private function isBingeReady(Media $media, CarbonImmutable $today): bool
    {
        if ($media->type === 'movie') {
            return $media->released_on?->lessThanOrEqualTo($today) ?? false;
        }

        $season = $this->currentSeason($media);

        return $season !== null
            && $season->episode_count > 0
            && $season->episodes->count() >= $season->episode_count
            && $season->episodes->every(
                fn (Episode $episode): bool => $episode->aired_on?->lessThanOrEqualTo($today) ?? false,
            );
    }

    /**
     * @return array{image: string, kind: 'film'|'series', nextEpisode?: string, platform: string, releasedEpisodes?: int, seasonComplete?: string, slug: string, status: 'airing'|'binge-ready', subtitle: string, title: string, totalEpisodes?: int, year: string}
     */
    private function mediaItem(Media $media, ?UserMedia $entry = null): array
    {
        $season = $this->currentSeason($media);
        $episodes = $season?->episodes->sortBy('number')->values() ?? collect();
        $today = now()->startOfDay();
        $releasedEpisodes = $episodes
            ->filter(fn ($episode): bool => $episode->aired_on?->lessThanOrEqualTo($today) ?? false)
            ->values();
        $nextEpisode = $episodes
            ->first(fn ($episode): bool => $episode->aired_on?->greaterThan($today) ?? false);
        $isAiring = $media->type === 'tv' && $season && $nextEpisode !== null;

        return array_filter([
            'description' => $media->synopsis,
            'genres' => $media->genres,
            'image' => $this->imageUrl($media->backdrop_path, 'w1280')
                ?? $this->imageUrl($media->poster_path, 'w780')
                ?? '',
            'isFeatured' => $entry?->is_featured ?? false,
            'isFollowed' => in_array($entry?->status, ['following', 'watching'], true),
            'kind' => $media->type === 'tv' ? 'series' : 'film',
            'nextEpisode' => $nextEpisode
                ? "Prochain épisode · {$this->formatDate($nextEpisode->aired_on)}"
                : null,
            'platform' => $media->networks[0] ?? 'TMDB',
            'releasedEpisodes' => $season ? $releasedEpisodes->count() : null,
            'rating' => $media->vote_average !== null ? (float) $media->vote_average : null,
            'remindersEnabled' => $entry?->reminders_enabled ?? false,
            'seasonComplete' => $season ? $this->formatDate($episodes->max('aired_on')) : null,
            'slug' => $media->slug,
            'status' => $isAiring ? 'airing' : 'binge-ready',
            'subtitle' => $season ? "Saison {$season->number}" : 'Film',
            'title' => $media->title,
            'totalEpisodes' => $season?->episode_count,
            'userRating' => $entry?->rating,
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
