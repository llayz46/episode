<?php

namespace App\Actions\Tmdb;

use App\Services\Tmdb\TmdbService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Throwable;

final class GetTrendingSeries
{
    public function __construct(private TmdbService $tmdb) {}

    /**
     * @return list<array{description: string|null, image: string, kind: 'series', platform: string, rating: float|null, status: 'binge-ready', subtitle: string, title: string, tmdbId: int, voteCount: int, year: string}>
     */
    public function handle(): array
    {
        if (! is_string(config('tmdb.api_token')) || config('tmdb.api_token') === '') {
            return [];
        }

        try {
            return Cache::flexible('tmdb:trending-series:week', [3600, 7200], fn (): array => $this->mapResults($this->tmdb->trendingSeries()));
        } catch (Throwable $exception) {
            report($exception);

            return [];
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{description: string|null, image: string, kind: 'series', platform: string, rating: float|null, status: 'binge-ready', subtitle: string, title: string, tmdbId: int, voteCount: int, year: string}>
     */
    private function mapResults(array $payload): array
    {
        return collect($payload['results'] ?? [])
            ->filter(fn (mixed $result): bool => is_array($result))
            ->map(function (array $result): ?array {
                $tmdbId = (int) ($result['id'] ?? 0);
                $title = $result['name'] ?? null;
                $image = $this->imageUrl($result['backdrop_path'] ?? $result['poster_path'] ?? null);

                if ($tmdbId < 1 || ! is_string($title) || $title === '' || $image === null) {
                    return null;
                }

                $firstAirDate = $result['first_air_date'] ?? null;

                return [
                    'description' => is_string($result['overview'] ?? null) ? $result['overview'] : null,
                    'image' => $image,
                    'kind' => 'series',
                    'platform' => 'Tendance TMDB',
                    'popularity' => (float) ($result['popularity'] ?? 0),
                    'rating' => isset($result['vote_average']) ? (float) $result['vote_average'] : null,
                    'status' => 'binge-ready',
                    'subtitle' => 'Tendance cette semaine',
                    'title' => $title,
                    'tmdbId' => $tmdbId,
                    'voteCount' => (int) ($result['vote_count'] ?? 0),
                    'year' => is_string($firstAirDate) && $firstAirDate !== '' ? Str::before($firstAirDate, '-') : '',
                ];
            })
            ->filter()
            ->sortByDesc('popularity')
            ->map(fn (array $result): array => collect($result)->except('popularity')->all())
            ->take(10)
            ->values()
            ->all();
    }

    private function imageUrl(mixed $path): ?string
    {
        return is_string($path) && $path !== ''
            ? rtrim((string) config('tmdb.image_url'), '/')."/w1280{$path}"
            : null;
    }
}
