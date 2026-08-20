<?php

namespace App\Actions\Tmdb;

use App\Models\Episode;
use App\Models\Media;
use App\Models\MediaCredit;
use App\Models\Person;
use App\Models\Season;
use App\Services\Tmdb\TmdbService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportTmdbMedia
{
    public function __construct(private TmdbService $tmdb) {}

    public function handle(int $tmdbId, string $type): Media
    {
        $payload = $type === 'movie'
            ? $this->tmdb->movie($tmdbId)
            : $this->tmdb->series($tmdbId);
        $creditsPayload = $type === 'movie'
            ? $this->tmdb->movieCredits($tmdbId)
            : $this->tmdb->seriesCredits($tmdbId);

        $seasonPayloads = $type === 'tv'
            ? $this->seasonPayloads($tmdbId, $payload)
            : [];

        return DB::transaction(function () use ($creditsPayload, $payload, $seasonPayloads, $tmdbId, $type): Media {
            $media = Media::query()->updateOrCreate(
                ['tmdb_id' => $tmdbId, 'type' => $type],
                $this->mediaAttributes($payload, $tmdbId, $type),
            );

            $this->importCredits($media, $creditsPayload);

            foreach ($seasonPayloads as $seasonPayload) {
                $season = Season::query()->updateOrCreate(
                    ['tmdb_id' => (int) $seasonPayload['id']],
                    [
                        'media_id' => $media->id,
                        'number' => (int) $seasonPayload['season_number'],
                        'title' => $this->nullableString($seasonPayload['name'] ?? null),
                        'synopsis' => $this->nullableString($seasonPayload['overview'] ?? null),
                        'poster_path' => $this->nullableString($seasonPayload['poster_path'] ?? null),
                        'aired_on' => $this->nullableString($seasonPayload['air_date'] ?? null),
                        'episode_count' => count($seasonPayload['episodes'] ?? []),
                        'vote_average' => $this->nullableFloat($seasonPayload['vote_average'] ?? null),
                        'vote_count' => $this->nullableInteger($seasonPayload['vote_count'] ?? null) ?? 0,
                        'tmdb_synced_at' => now(),
                    ],
                );

                foreach ($seasonPayload['episodes'] ?? [] as $episodePayload) {
                    if (! is_array($episodePayload) || ! isset($episodePayload['id'], $episodePayload['episode_number'], $episodePayload['name'])) {
                        continue;
                    }

                    Episode::query()->updateOrCreate(
                        ['tmdb_id' => (int) $episodePayload['id']],
                        [
                            'season_id' => $season->id,
                            'number' => (int) $episodePayload['episode_number'],
                            'title' => (string) $episodePayload['name'],
                            'synopsis' => $this->nullableString($episodePayload['overview'] ?? null),
                            'still_path' => $this->nullableString($episodePayload['still_path'] ?? null),
                            'aired_on' => $this->nullableString($episodePayload['air_date'] ?? null),
                            'runtime' => $this->nullableInteger($episodePayload['runtime'] ?? null),
                            'vote_average' => $this->nullableFloat($episodePayload['vote_average'] ?? null),
                            'vote_count' => $this->nullableInteger($episodePayload['vote_count'] ?? null) ?? 0,
                            'tmdb_synced_at' => now(),
                        ],
                    );
                }
            }

            return $media->fresh(['credits.person', 'seasons.episodes']);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array<string, mixed>>
     */
    private function seasonPayloads(int $tmdbId, array $payload): array
    {
        return collect($payload['seasons'] ?? [])
            ->filter(fn (mixed $season): bool => is_array($season) && isset($season['season_number']))
            ->map(fn (array $season): array => $this->tmdb->season($tmdbId, (int) $season['season_number']))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function mediaAttributes(array $payload, int $tmdbId, string $type): array
    {
        $title = $type === 'movie'
            ? (string) ($payload['title'] ?? '')
            : (string) ($payload['name'] ?? '');
        $releaseDate = $type === 'movie'
            ? $payload['release_date'] ?? null
            : $payload['first_air_date'] ?? null;
        $runtime = $type === 'movie'
            ? $payload['runtime'] ?? null
            : ($payload['episode_run_time'][0] ?? null);

        return [
            'title' => $title,
            'original_title' => $this->nullableString(
                $type === 'movie'
                    ? $payload['original_title'] ?? null
                    : $payload['original_name'] ?? null,
            ),
            'slug' => Str::slug("{$title}-{$tmdbId}"),
            'synopsis' => $this->nullableString($payload['overview'] ?? null),
            'tagline' => $this->nullableString($payload['tagline'] ?? null),
            'poster_path' => $this->nullableString($payload['poster_path'] ?? null),
            'backdrop_path' => $this->nullableString($payload['backdrop_path'] ?? null),
            'released_on' => $this->nullableString($releaseDate),
            'status' => $this->nullableString($payload['status'] ?? null),
            'runtime' => $this->nullableInteger($runtime),
            'vote_average' => $this->nullableFloat($payload['vote_average'] ?? null),
            'vote_count' => $this->nullableInteger($payload['vote_count'] ?? null) ?? 0,
            'genres' => collect($payload['genres'] ?? [])
                ->pluck('name')
                ->filter(fn (mixed $genre): bool => is_string($genre) && $genre !== '')
                ->values()
                ->all(),
            'countries' => $this->countries($payload),
            'networks' => collect($payload['networks'] ?? [])
                ->pluck('name')
                ->filter(fn (mixed $network): bool => is_string($network) && $network !== '')
                ->values()
                ->all(),
            'tmdb_synced_at' => now(),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function importCredits(Media $media, array $payload): void
    {
        foreach ($payload['cast'] ?? [] as $creditPayload) {
            if (! is_array($creditPayload) || ! isset($creditPayload['id'], $creditPayload['name'])) {
                continue;
            }

            $person = Person::query()->updateOrCreate(
                ['tmdb_id' => (int) $creditPayload['id']],
                [
                    'name' => (string) $creditPayload['name'],
                    'profile_path' => $this->nullableString($creditPayload['profile_path'] ?? null),
                    'known_for_department' => $this->nullableString($creditPayload['known_for_department'] ?? null),
                ],
            );

            MediaCredit::query()->updateOrCreate(
                [
                    'media_id' => $media->id,
                    'person_id' => $person->id,
                    'credit_type' => 'cast',
                ],
                [
                    'character_name' => $this->nullableString($creditPayload['character'] ?? null),
                    'job' => null,
                    'department' => $this->nullableString($creditPayload['known_for_department'] ?? null),
                    'display_order' => $this->nullableInteger($creditPayload['order'] ?? null) ?? 0,
                ],
            );
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<string>
     */
    private function countries(array $payload): array
    {
        $countries = collect($payload['production_countries'] ?? [])
            ->pluck('iso_3166_1')
            ->filter(fn (mixed $country): bool => is_string($country) && $country !== '');

        return $countries->isNotEmpty()
            ? $countries->values()->all()
            : collect($payload['origin_country'] ?? [])
                ->filter(fn (mixed $country): bool => is_string($country) && $country !== '')
                ->values()
                ->all();
    }

    private function nullableFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private function nullableInteger(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
