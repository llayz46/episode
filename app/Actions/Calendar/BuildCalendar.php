<?php

namespace App\Actions\Calendar;

use App\Models\Episode;
use App\Models\Media;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class BuildCalendar
{
    /**
     * @return array{events: array<int, array{date: string, episode?: string, image: string, kind: 'episode'|'movie', media: array{image: string, platform: string, slug: string, title: string}, title: string}>, month: string}
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
     * @return array<int, array{date: string, episode: string, image: string, kind: 'episode', media: array{image: string, platform: string, slug: string, title: string}, title: string}>
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
            ->with('season.media')
            ->get()
            ->map(function (Episode $episode): array {
                $season = $episode->season;
                $media = $season->media;
                $mediaItem = $this->media($media);

                return [
                    'date' => $episode->aired_on->toDateString(),
                    'episode' => sprintf('S%02dE%02d', $season->number, $episode->number),
                    'image' => $this->imageUrl($episode->still_path, 'w780')
                        ?? $mediaItem['image'],
                    'kind' => 'episode',
                    'media' => $mediaItem,
                    'title' => $episode->title,
                ];
            })
            ->sortBy('date')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{date: string, image: string, kind: 'movie', media: array{image: string, platform: string, slug: string, title: string}, title: string}>
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
            ->get()
            ->map(function (Media $media): array {
                $mediaItem = $this->media($media);

                return [
                    'date' => $media->released_on->toDateString(),
                    'image' => $mediaItem['image'],
                    'kind' => 'movie',
                    'media' => $mediaItem,
                    'title' => $media->title,
                ];
            })
            ->sortBy('date')
            ->values()
            ->all();
    }

    /**
     * @return array{image: string, platform: string, slug: string, title: string}
     */
    private function media(Media $media): array
    {
        return [
            'image' => $this->imageUrl($media->poster_path, 'w342')
                ?? $this->imageUrl($media->backdrop_path, 'w780')
                ?? '',
            'platform' => $media->networks[0] ?? 'TMDB',
            'slug' => $media->slug,
            'title' => $media->title,
        ];
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }
}
