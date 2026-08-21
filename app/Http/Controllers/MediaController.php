<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\MediaCredit;
use App\Models\Season;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MediaController extends Controller
{
    public function show(string $slug): InertiaResponse
    {
        return Inertia::render('media/show', [
            'media' => $this->catalogueMedia($slug),
        ]);
    }

    /**
     * Affiche la direction Season Control de la fiche série.
     */
    public function seasonControl(string $slug): InertiaResponse
    {
        return Inertia::render('media/season-control', [
            'media' => $this->catalogueMedia($slug),
        ]);
    }

    public function season(string $slug, int $season): InertiaResponse
    {
        $media = Media::query()
            ->where('slug', $slug)
            ->with([
                'seasons' => fn (HasMany $query): HasMany => $query
                    ->where('number', $season)
                    ->with(['episodes' => fn (HasMany $query): HasMany => $query->orderBy('number')]),
            ])
            ->firstOrFail();
        $selectedSeason = $media->seasons->first();

        if (! $selectedSeason) {
            abort(404);
        }

        $seasonNumbers = $media->seasons()
            ->orderBy('number')
            ->pluck('number')
            ->map(fn (mixed $number): int => (int) $number);

        return Inertia::render('media/season', [
            'media' => [
                'backdrop' => $this->imageUrl($media->backdrop_path, 'original')
                    ?? $this->imageUrl($media->poster_path, 'w1280')
                    ?? '',
                'slug' => $media->slug,
                'title' => $media->title,
            ],
            'season' => [
                'episodeCount' => $selectedSeason->episode_count,
                'episodes' => $selectedSeason->episodes
                    ->map(fn ($episode): array => [
                        'airedOn' => $this->formatDate($episode->aired_on),
                        'image' => $this->imageUrl($episode->still_path, 'w780')
                            ?? $this->imageUrl($media->backdrop_path, 'w780')
                            ?? $this->imageUrl($media->poster_path, 'w780')
                            ?? '',
                        'number' => $episode->number,
                        'overview' => $episode->synopsis,
                        'rating' => $episode->vote_average !== null ? (float) $episode->vote_average : null,
                        'runtime' => $episode->runtime,
                        'title' => $episode->title,
                        'voteCount' => $episode->vote_count,
                    ])
                    ->values()
                    ->all(),
                'number' => $selectedSeason->number,
                'nextNumber' => $seasonNumbers
                    ->filter(fn (int $number): bool => $number > $selectedSeason->number)
                    ->first(),
                'previousNumber' => $seasonNumbers
                    ->filter(fn (int $number): bool => $number < $selectedSeason->number)
                    ->last(),
                'title' => $selectedSeason->title ?? "Saison {$selectedSeason->number}",
            ],
        ]);
    }

    public function episode(string $slug, int $season, int $episode): InertiaResponse
    {
        $media = Media::query()
            ->where('slug', $slug)
            ->with([
                'credits.person',
                'seasons' => fn (HasMany $query): HasMany => $query
                    ->where('number', $season)
                    ->with(['episodes' => fn (HasMany $query): HasMany => $query->orderBy('number')]),
            ])
            ->firstOrFail();
        $selectedSeason = $media->seasons->first();
        $selectedEpisode = $selectedSeason?->episodes->firstWhere('number', $episode);

        if (! $selectedSeason || ! $selectedEpisode) {
            abort(404);
        }

        $episodeNumbers = $selectedSeason->episodes
            ->pluck('number')
            ->map(fn (mixed $number): int => (int) $number);

        return Inertia::render('media/episode', [
            'media' => [
                'backdrop' => $this->imageUrl($media->backdrop_path, 'original')
                    ?? $this->imageUrl($media->poster_path, 'w1280')
                    ?? '',
                'cast' => $this->cast($media),
                'platform' => $media->networks[0] ?? 'TMDB',
                'poster' => $this->imageUrl($media->poster_path, 'w780')
                    ?? $this->imageUrl($media->backdrop_path, 'w1280')
                    ?? '',
                'slug' => $media->slug,
                'title' => $media->title,
            ],
            'season' => [
                'number' => $selectedSeason->number,
                'title' => $selectedSeason->title ?? "Saison {$selectedSeason->number}",
            ],
            'episode' => [
                'airedOn' => $this->formatDate($selectedEpisode->aired_on),
                'image' => $this->imageUrl($selectedEpisode->still_path, 'w1280')
                    ?? $this->imageUrl($media->backdrop_path, 'w1280')
                    ?? $this->imageUrl($media->poster_path, 'w780')
                    ?? '',
                'isAvailable' => $selectedEpisode->aired_on?->lessThanOrEqualTo(now()->startOfDay()) ?? false,
                'nextNumber' => $episodeNumbers
                    ->filter(fn (int $number): bool => $number > $selectedEpisode->number)
                    ->first(),
                'number' => $selectedEpisode->number,
                'overview' => $selectedEpisode->synopsis
                    ?? 'Aucun synopsis n’est disponible pour cet épisode.',
                'previousNumber' => $episodeNumbers
                    ->filter(fn (int $number): bool => $number < $selectedEpisode->number)
                    ->last(),
                'rating' => $selectedEpisode->vote_average !== null ? (float) $selectedEpisode->vote_average : null,
                'runtime' => $selectedEpisode->runtime,
                'title' => $selectedEpisode->title,
                'voteCount' => $selectedEpisode->vote_count,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function catalogueMedia(string $slug): array
    {
        $media = Media::query()
            ->where('slug', $slug)
            ->with(['credits.person', 'seasons.episodes'])
            ->firstOrFail();

        $seasons = $media->seasons
            ->sortBy('number')
            ->values();
        $currentSeason = $seasons
            ->filter(
                fn (Season $season): bool => $season->number > 0 && $season->episodes->isNotEmpty(),
            )
            ->sortByDesc('number')
            ->first();
        $seasonEpisodes = $currentSeason?->episodes
            ->sortBy('number')
            ->values() ?? collect();
        $today = now()->startOfDay();
        $releasedEpisodes = $seasonEpisodes
            ->filter(fn ($episode): bool => $episode->aired_on?->lessThanOrEqualTo($today))
            ->values();
        $upcomingEpisodes = $seasonEpisodes
            ->filter(fn ($episode): bool => $episode->aired_on?->greaterThan($today))
            ->values();
        $latestEpisode = $releasedEpisodes->last();
        $nextEpisode = $upcomingEpisodes->first();

        return [
            'backdrop' => $this->imageUrl($media->backdrop_path, 'original')
                ?? $this->imageUrl($media->poster_path, 'w1280')
                ?? '',
            'cast' => $this->cast($media),
            'countryCode' => $this->countryCode($media->countries[0] ?? null),
            'description' => $media->synopsis ?? 'Aucun synopsis n’est disponible pour le moment.',
            'episodeNavigation' => $seasonEpisodes
                ->filter(fn ($episode): bool => $episode->still_path !== null)
                ->map(fn ($episode): array => [
                    'airDate' => $this->formatDate($episode->aired_on),
                    'code' => sprintf('S%02dE%02d', $currentSeason?->number ?? 0, $episode->number),
                    'description' => $episode->synopsis ?? 'Aucun synopsis n’est disponible pour cet épisode.',
                    'duration' => $episode->runtime ? "{$episode->runtime} min" : 'Durée inconnue',
                    'image' => $this->imageUrl($episode->still_path, 'w1280') ?? '',
                    'isAvailable' => $episode->aired_on?->lessThanOrEqualTo($today) ?? false,
                    'number' => $episode->number,
                    'title' => $episode->title,
                ])
                ->values()
                ->all(),
            'episodes' => $upcomingEpisodes
                ->take(3)
                ->map(fn ($episode): array => [
                    'airDate' => $this->formatDate($episode->aired_on),
                    'isAvailable' => false,
                    'number' => $episode->number,
                    'title' => $episode->title,
                ])
                ->all(),
            'firstAirDate' => $this->formatDate($media->released_on),
            'genres' => $media->genres ?? [],
            'kind' => $media->type === 'tv' ? 'series' : 'movie',
            'lastAirDate' => $this->formatDate($latestEpisode?->aired_on),
            'nextRelease' => $nextEpisode
                ? "Épisode {$nextEpisode->number} · {$this->formatDate($nextEpisode->aired_on)}"
                : 'Aucune sortie annoncée',
            'platform' => $media->networks[0] ?? 'TMDB',
            'poster' => $this->imageUrl($media->poster_path, 'w780')
                ?? $this->imageUrl($media->backdrop_path, 'w1280')
                ?? '',
            'slug' => $media->slug,
            'progress' => $media->type === 'tv' && $currentSeason
                ? [
                    'released' => $releasedEpisodes->count(),
                    'total' => $currentSeason->episode_count,
                    'watched' => 0,
                ]
                : null,
            'rating' => $media->vote_average !== null
                ? ['average' => (float) $media->vote_average, 'count' => $media->vote_count]
                : null,
            'season' => $currentSeason ? "Saison {$currentSeason->number}" : null,
            'seasonComplete' => $currentSeason
                ? $this->formatDate($seasonEpisodes->max('aired_on'))
                : null,
            'seasons' => $seasons
                ->map(fn (Season $season): array => [
                    'episodeCount' => $season->episode_count,
                    'image' => $this->imageUrl($season->poster_path, 'w500'),
                    'number' => $season->number,
                    'status' => $this->seasonStatus($season, $today),
                ])
                ->all(),
            'status' => $this->displayStatus($media->status),
            'tagline' => $media->tagline,
            'title' => $media->title,
            'year' => $media->released_on?->format('Y') ?? '',
        ];
    }

    private function displayStatus(?string $status): string
    {
        return match ($status) {
            'Returning Series', 'In Production' => 'En diffusion',
            'Released' => 'Disponible',
            'Ended', 'Canceled' => 'Terminée',
            'Planned', 'Post Production' => 'À venir',
            default => $status ?? 'À venir',
        };
    }

    /**
     * @return array<int, array{image: string, name: string, role: string}>
     */
    private function cast(Media $media): array
    {
        return $media->credits
            ->where('credit_type', 'cast')
            ->sortBy('display_order')
            ->filter(fn (MediaCredit $credit): bool => $credit->person?->profile_path !== null)
            ->take(12)
            ->map(fn (MediaCredit $credit): array => [
                'image' => $this->imageUrl($credit->person->profile_path, 'w342') ?? '',
                'name' => $credit->person->name,
                'role' => $credit->character_name ?? 'Distribution',
            ])
            ->values()
            ->all();
    }

    private function countryCode(mixed $country): ?string
    {
        if (! is_string($country) || ! preg_match('/^[A-Z]{2}$/', $country)) {
            return null;
        }

        return $country;
    }

    private function formatDate(?CarbonInterface $date): ?string
    {
        return $date?->locale('fr')->translatedFormat('j F Y');
    }

    private function imageUrl(?string $path, string $size): ?string
    {
        return $path
            ? rtrim((string) config('tmdb.image_url'), '/')."/{$size}{$path}"
            : null;
    }

    private function seasonStatus(Season $season, CarbonInterface $today): string
    {
        $episodes = $season->episodes;

        if ($episodes->isEmpty() || $episodes->first()?->aired_on?->greaterThan($today)) {
            return 'Annoncée';
        }

        if ($episodes->every(fn ($episode): bool => $episode->aired_on?->lessThanOrEqualTo($today) ?? false)) {
            return 'Terminée';
        }

        return 'En diffusion';
    }
}
