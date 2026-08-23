<?php

namespace App\Actions\Tmdb;

use App\Models\Media;
use App\Models\Person;
use App\Services\Tmdb\TmdbService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class ShowPerson
{
    public function __construct(private TmdbService $tmdb) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(Person $person): array
    {
        $payload = $this->tmdb->person($person->tmdb_id);
        $filmography = $this->filmography($payload);
        $importedMedia = $this->importedMedia($filmography);

        return [
            'age' => $this->age($payload['birthday'] ?? null, $payload['deathday'] ?? null),
            'biography' => $this->nullableString($payload['biography'] ?? null),
            'birthDate' => $this->formatDate($payload['birthday'] ?? null),
            'deathDate' => $this->formatDate($payload['deathday'] ?? null),
            'filmography' => $filmography
                ->map(fn (array $credit): array => [
                    ...$credit,
                    'slug' => $importedMedia->get("{$credit['type']}:{$credit['tmdbId']}"),
                ])
                ->values()
                ->all(),
            'knownForDepartment' => $this->nullableString($payload['known_for_department'] ?? null)
                ?? $person->known_for_department,
            'name' => $this->nullableString($payload['name'] ?? null) ?? $person->name,
            'placeOfBirth' => $this->nullableString($payload['place_of_birth'] ?? null),
            'profile' => $this->imageUrl(
                $this->nullableString($payload['profile_path'] ?? null) ?? $person->profile_path,
                'h632',
            ),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return Collection<int, array{poster: ?string, role: ?string, sortDate: string, title: string, tmdbId: int, type: string, year: string}>
     */
    private function filmography(array $payload): Collection
    {
        $credits = $payload['combined_credits'] ?? [];
        $cast = is_array($credits) && is_array($credits['cast'] ?? null) ? $credits['cast'] : [];
        $crew = is_array($credits) && is_array($credits['crew'] ?? null) ? $credits['crew'] : [];

        return collect([...$cast, ...$crew])
            ->filter(fn (mixed $credit): bool => is_array($credit)
                && in_array($credit['media_type'] ?? null, ['movie', 'tv'], true)
                && isset($credit['id']))
            ->map(function (array $credit): array {
                $type = (string) $credit['media_type'];
                $releasedOn = $this->nullableString(
                    $type === 'movie'
                        ? $credit['release_date'] ?? null
                        : $credit['first_air_date'] ?? null,
                );

                return [
                    'poster' => $this->imageUrl($this->nullableString($credit['poster_path'] ?? null), 'w500'),
                    'role' => $this->nullableString($credit['character'] ?? null)
                        ?? $this->nullableString($credit['job'] ?? null),
                    'sortDate' => $releasedOn ?? '0000-00-00',
                    'title' => (string) ($type === 'movie' ? $credit['title'] ?? '' : $credit['name'] ?? ''),
                    'tmdbId' => (int) $credit['id'],
                    'type' => $type,
                    'year' => $releasedOn ? substr($releasedOn, 0, 4) : '',
                ];
            })
            ->filter(fn (array $credit): bool => $credit['title'] !== '')
            ->groupBy(fn (array $credit): string => "{$credit['type']}:{$credit['tmdbId']}")
            ->map(function (Collection $credits): array {
                $firstCredit = $credits->first();

                return [
                    ...$firstCredit,
                    'role' => $credits->pluck('role')->filter()->unique()->implode(' · ') ?: null,
                ];
            })
            ->sortByDesc('sortDate')
            ->values();
    }

    /**
     * @param  Collection<int, array{tmdbId: int, type: string}>  $filmography
     * @return Collection<string, string>
     */
    private function importedMedia(Collection $filmography): Collection
    {
        $tmdbIds = $filmography->pluck('tmdbId')->unique()->all();

        return Media::query()
            ->select(['tmdb_id', 'slug', 'type'])
            ->whereIn('tmdb_id', $tmdbIds)
            ->get()
            ->mapWithKeys(fn (Media $media): array => ["{$media->type}:{$media->tmdb_id}" => $media->slug]);
    }

    private function age(mixed $birthday, mixed $deathday): ?int
    {
        if (! is_string($birthday) || $birthday === '') {
            return null;
        }

        $birthDate = CarbonImmutable::parse($birthday);
        $endDate = is_string($deathday) && $deathday !== ''
            ? CarbonImmutable::parse($deathday)
            : now();

        return $birthDate->diffInYears($endDate);
    }

    private function formatDate(mixed $date): ?string
    {
        if (! is_string($date) || $date === '') {
            return null;
        }

        return CarbonImmutable::parse($date)->locale('fr')->translatedFormat('j F Y');
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
