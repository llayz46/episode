<?php

namespace App\Actions\Tmdb;

use App\Services\Tmdb\TmdbService;
use Illuminate\Support\Str;

class SearchTmdbMedia
{
    public function __construct(private TmdbService $tmdb) {}

    /**
     * @return list<array{tmdbId: int, type: 'movie'|'tv', title: string, overview: string|null, year: string|null, posterUrl: string|null}>
     */
    public function handle(string $query, string $type): array
    {
        $payload = match ($type) {
            'movie' => $this->tmdb->searchMovies($query),
            'tv' => $this->tmdb->searchSeries($query),
            default => $this->tmdb->searchMulti($query),
        };

        return collect($payload['results'] ?? [])
            ->filter(fn (mixed $result): bool => is_array($result))
            ->map(function (array $result) use ($type): ?array {
                $resultType = $result['media_type'] ?? $type;

                if (! in_array($resultType, ['movie', 'tv'], true)) {
                    return null;
                }

                $title = $resultType === 'movie'
                    ? $result['title'] ?? null
                    : $result['name'] ?? null;

                if (! is_string($title) || $title === '') {
                    return null;
                }

                $releaseDate = $resultType === 'movie'
                    ? $result['release_date'] ?? null
                    : $result['first_air_date'] ?? null;

                return [
                    'tmdbId' => (int) ($result['id'] ?? 0),
                    'type' => $resultType,
                    'title' => $title,
                    'overview' => $this->firstSentence($result['overview'] ?? null),
                    'year' => is_string($releaseDate) && $releaseDate !== ''
                        ? Str::before($releaseDate, '-')
                        : null,
                    'posterUrl' => $this->imageUrl($result['poster_path'] ?? null),
                ];
            })
            ->filter(fn (?array $result): bool => $result !== null && $result['tmdbId'] > 0)
            ->take(12)
            ->values()
            ->all();
    }

    private function imageUrl(mixed $path): ?string
    {
        return is_string($path) && $path !== ''
            ? rtrim((string) config('tmdb.image_url'), '/')."/w185{$path}"
            : null;
    }

    private function firstSentence(mixed $overview): ?string
    {
        if (! is_string($overview) || $overview === '') {
            return null;
        }

        return preg_split('/(?<=[.!?])\s+/u', Str::squish($overview))[0] ?? null;
    }
}
