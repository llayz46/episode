<?php

namespace App\Actions\Tmdb;

use App\Services\Tmdb\TmdbService;
use Illuminate\Support\Str;

class SearchTmdbMedia
{
    private const MINIMUM_VOTE_COUNT = 5;

    public function __construct(private TmdbService $tmdb) {}

    /**
     * @return list<array{tmdbId: int, type: 'movie'|'tv', title: string, overview: string|null, year: string|null, posterUrl: string|null}>
     */
    public function handle(string $query, string $type): array
    {
        $payload = $type === 'movie'
            ? $this->tmdb->searchMovies($query)
            : $this->tmdb->searchSeries($query);

        return collect($payload['results'] ?? [])
            ->filter(fn (mixed $result): bool => is_array($result))
            ->filter(fn (array $result): bool => (int) ($result['vote_count'] ?? 0) >= self::MINIMUM_VOTE_COUNT)
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
                    'popularity' => (float) ($result['popularity'] ?? 0),
                    'result' => [
                        'tmdbId' => (int) ($result['id'] ?? 0),
                        'type' => $resultType,
                        'title' => $title,
                        'overview' => $this->firstSentence($result['overview'] ?? null),
                        'year' => is_string($releaseDate) && $releaseDate !== ''
                            ? Str::before($releaseDate, '-')
                            : null,
                        'posterUrl' => $this->imageUrl($result['poster_path'] ?? null),
                    ],
                    'voteCount' => (int) ($result['vote_count'] ?? 0),
                ];
            })
            ->filter(fn (?array $result): bool => $result !== null && $result['result']['tmdbId'] > 0)
            ->sort(function (array $left, array $right): int {
                $popularityComparison = $right['popularity'] <=> $left['popularity'];

                return $popularityComparison !== 0
                    ? $popularityComparison
                    : $right['voteCount'] <=> $left['voteCount'];
            })
            ->map(fn (array $result): array => $result['result'])
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
