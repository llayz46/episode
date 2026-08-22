<?php

namespace App\Actions\Calendar;

use App\Models\Episode;
use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuildCalendar
{
    /**
     * @return array<string, mixed>
     */
    public function handle(User $user, CarbonImmutable $month): array
    {
        $start = $month->startOfMonth();
        $end = $month->endOfMonth();

        return [
            'events' => collect([
                ...$this->episodeEvents($user, $start, $end),
                ...$this->movieEvents($user, $start, $end),
            ])
                ->sortBy('date')
                ->values()
                ->all(),
            'month' => $month->format('Y-m'),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function episodeEvents(User $user, CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Episode::query()
            ->whereDate('aired_on', '>=', now()->startOfDay())
            ->whereBetween('aired_on', [$start, $end])
            ->whereHas('season.media.userLibraries', function (Builder $query) use ($user): void {
                $query
                    ->whereBelongsTo($user)
                    ->whereIn('status', ['following', 'watching']);
            })
            ->with([
                'season.media.userLibraries' => fn (HasMany $query): HasMany => $query->whereBelongsTo($user),
            ])
            ->get()
            ->map(function (Episode $episode): array {
                $season = $episode->season;
                $media = $season->media;
                $mediaItem = $this->media($media, $media->userLibraries->first());

                return [
                    'date' => $episode->aired_on->toDateString(),
                    'episode' => sprintf('S%02dE%02d', $season->number, $episode->number),
                    'image' => $this->imageUrl($episode->still_path, 'w780')
                        ?? $mediaItem['image'],
                    'kind' => 'episode',
                    'media' => $mediaItem,
                    'overview' => $episode->synopsis ?? $media->synopsis,
                    'runtime' => $episode->runtime,
                    'season' => $season->title ?? "Saison {$season->number}",
                    'title' => $episode->title,
                    'voteAverage' => $episode->vote_average !== null ? (float) $episode->vote_average : null,
                    'voteCount' => $episode->vote_count,
                ];
            })
            ->sortBy('date')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function movieEvents(User $user, CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Media::query()
            ->where('type', 'movie')
            ->whereDate('released_on', '>=', now()->startOfDay())
            ->whereBetween('released_on', [$start, $end])
            ->whereHas('userLibraries', function (Builder $query) use ($user): void {
                $query
                    ->whereBelongsTo($user)
                    ->whereIn('status', ['following', 'watching']);
            })
            ->with([
                'userLibraries' => fn (HasMany $query): HasMany => $query->whereBelongsTo($user),
            ])
            ->get()
            ->map(function (Media $media): array {
                $mediaItem = $this->media($media, $media->userLibraries->first());

                return [
                    'date' => $media->released_on->toDateString(),
                    'image' => $mediaItem['image'],
                    'kind' => 'movie',
                    'media' => $mediaItem,
                    'overview' => $media->synopsis,
                    'runtime' => $media->runtime,
                    'title' => $media->title,
                    'voteAverage' => $media->vote_average !== null ? (float) $media->vote_average : null,
                    'voteCount' => $media->vote_count,
                ];
            })
            ->sortBy('date')
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function media(Media $media, ?UserMedia $entry): array
    {
        return [
            'backdrop' => $this->imageUrl($media->backdrop_path, 'w1280')
                ?? $this->imageUrl($media->poster_path, 'w780')
                ?? '',
            'description' => $media->synopsis,
            'genres' => $media->genres ?? [],
            'image' => $this->imageUrl($media->poster_path, 'w342')
                ?? $this->imageUrl($media->backdrop_path, 'w780')
                ?? '',
            'isFeatured' => $entry?->is_featured ?? false,
            'remindersEnabled' => $entry?->reminders_enabled ?? false,
            'platform' => $media->networks[0] ?? 'TMDB',
            'slug' => $media->slug,
            'title' => $media->title,
            'userRating' => $entry?->rating,
        ];
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }
}
