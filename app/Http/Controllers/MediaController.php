<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\MediaCredit;
use App\Models\Season;
use Carbon\CarbonInterface;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MediaController extends Controller
{
    public function show(string $slug): InertiaResponse
    {
        return Inertia::render('media/show', [
            'media' => $this->catalogueMedia($slug) ?? $this->mediaFor($slug),
        ]);
    }

    /**
     * Affiche la direction Season Control de la fiche série.
     */
    public function seasonControl(string $slug): InertiaResponse
    {
        return Inertia::render('media/season-control', [
            'media' => $this->catalogueMedia($slug) ?? $this->mediaFor($slug),
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function catalogueMedia(string $slug): ?array
    {
        $media = Media::query()
            ->where('slug', $slug)
            ->with(['credits.person', 'seasons.episodes'])
            ->first();

        if (! $media) {
            return null;
        }

        $seasons = $media->seasons
            ->sortBy('number')
            ->values();
        $currentSeason = $seasons
            ->where('number', '>', 0)
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
            'cast' => $media->credits
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
                ->all(),
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

    /**
     * @return array<string, mixed>
     */
    private function mediaFor(string $slug): array
    {
        return match ($slug) {
            'silo' => [
                'backdrop' => 'https://image.tmdb.org/t/p/original/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg',
                'description' => 'Dans un futur toxique et en ruines, des milliers de personnes vivent dans un gigantesque silo souterrain. Après qu’un shérif ait enfreint une règle cardinale et que des habitants meurent mystérieusement, l’ingénieure Juliette commence à révéler les secrets du silo.',
                'cast' => [
                    ['image' => 'https://image.tmdb.org/t/p/w342/dXYJxqSowCeyEr03cWYzbA7a33.jpg', 'name' => 'Clare Perkins', 'role' => 'Carla McLain'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/vH8JrqdHaoFeGos44XeKTNuQMKE.jpg', 'name' => 'Harriet Walter', 'role' => 'Martha Walker'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/xmdcJQVhrnFdTv9KkrU3EnBWFfV.jpg', 'name' => 'Avi Nash', 'role' => 'Lukas Kyle'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/gmVYPHJgmRVIzhaVYMns4kgBVqm.jpg', 'name' => 'Rick Gomez', 'role' => 'Patrick Kennedy'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/t5DalUvivVVV3DY9s2wWM0rjMD5.jpg', 'name' => 'Olatunji Ayofe', 'role' => 'Teddy'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/tRPHovRBLwZTeWodLBqUD2arrlH.jpg', 'name' => 'Sophie Thompson', 'role' => 'Gloria Hildebrandt'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/rlV6XFgDSXwOttkqza1LeWvBpkz.jpg', 'name' => 'Chipo Chung', 'role' => 'Sandy'],
                    ['image' => 'https://image.tmdb.org/t/p/w342/aMoal7n4vRy5q3NL0jZb9b998p5.jpg', 'name' => 'Caitlin Zoz', 'role' => 'Kathleen Billings'],
                ],
                'countryCode' => 'US',
                'creator' => ['image' => 'https://image.tmdb.org/t/p/w185/zbaUcbYdFU28bGoi6F2lJo0XUaX.jpg', 'name' => 'Graham Yost'],
                'episodeNavigation' => [
                    [
                        'airDate' => '6 août 2026',
                        'code' => 'S03E06',
                        'description' => 'Billings et Hank tombent sur un nouveau mystère. Daniel et Helen reçoivent une proposition surprenante.',
                        'duration' => '55 min',
                        'image' => 'https://image.tmdb.org/t/p/w1280/hCUVzq1FghJlS75KIG2Ttxua4AL.jpg',
                        'isAvailable' => true,
                        'number' => 6,
                        'title' => 'The Drive',
                    ],
                    [
                        'airDate' => '13 août 2026',
                        'code' => 'S03E07',
                        'description' => 'Juliette envoie Lukas et Kennedy en mission, tandis qu’une Camille désespérée menace Robert pour qu’il dise la vérité.',
                        'duration' => '55 min',
                        'image' => 'https://image.tmdb.org/t/p/w1280/hT47PUyS6fQrmukmbyXrL9nBgKc.jpg',
                        'isAvailable' => true,
                        'number' => 7,
                        'title' => 'Radio',
                    ],
                    [
                        'airDate' => '20 août 2026',
                        'code' => 'S03E08',
                        'description' => 'Le père de Knox, Gus, fait une confession. Charlotte prend une décision qui change sa vie.',
                        'duration' => '56 min',
                        'image' => 'https://image.tmdb.org/t/p/w1280/qZiRIiFbjCSttNe3uNHsi6hoxWV.jpg',
                        'isAvailable' => false,
                        'number' => 8,
                        'title' => 'Gray Goo',
                    ],
                ],
                'episodes' => [
                    ['airDate' => '20 août 2026', 'isAvailable' => false, 'number' => 8, 'title' => 'Gray Goo'],
                    ['airDate' => '27 août 2026', 'isAvailable' => false, 'number' => 9, 'title' => 'Farewell'],
                    ['airDate' => '3 septembre 2026', 'isAvailable' => false, 'number' => 10, 'title' => 'Troy'],
                ],
                'firstAirDate' => '4 mai 2023',
                'genres' => ['Science-fiction et fantasy', 'Drame'],
                'kind' => 'series',
                'lastAirDate' => '13 août 2026',
                'nextRelease' => 'Épisode 8 · jeudi 20 août',
                'platform' => 'Apple TV',
                'poster' => 'https://image.tmdb.org/t/p/w780/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg',
                'progress' => ['released' => 7, 'total' => 10, 'watched' => 0],
                'rating' => ['average' => 8.2, 'count' => 2457],
                'season' => 'Saison 3',
                'seasonComplete' => 'Jeudi 3 septembre 2026',
                'seasons' => [
                    ['episodeCount' => 10, 'image' => 'https://image.tmdb.org/t/p/w500/ay0fwyIFEZ71NBXzyaN6d0OGxgu.jpg', 'number' => 1, 'status' => 'Terminée'],
                    ['episodeCount' => 10, 'image' => 'https://image.tmdb.org/t/p/w500/rY2LTYNkLdfWJAoa7whge0HGFik.jpg', 'number' => 2, 'status' => 'Terminée'],
                    ['episodeCount' => 10, 'image' => 'https://image.tmdb.org/t/p/w500/eviZTbKOXOeSaR268iJ9yqtwTNU.jpg', 'number' => 3, 'status' => 'En diffusion'],
                    ['episodeCount' => 0, 'image' => null, 'number' => 4, 'status' => 'Annoncée'],
                ],
                'status' => 'En diffusion',
                'tagline' => 'La clé du futur se trouve dans le passé.',
                'title' => 'Silo',
                'year' => '2023',
            ],
            'the-thursday-murder-club' => [
                'backdrop' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=85',
                'description' => 'Quatre amis improbables, réunis par leur passion pour les affaires non résolues, se retrouvent soudain au cœur d’un vrai mystère. Leur méthode est peut-être peu orthodoxe, mais leur curiosité est intacte.',
                'cast' => [
                    ['image' => 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80', 'name' => 'Helen Mirren', 'role' => 'Elizabeth'],
                    ['image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80', 'name' => 'Pierce Brosnan', 'role' => 'Ron'],
                    ['image' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80', 'name' => 'Ben Kingsley', 'role' => 'Ibrahim'],
                ],
                'episodeNavigation' => [],
                'episodes' => [],
                'genres' => ['Comédie', 'Mystère', 'Crime'],
                'kind' => 'movie',
                'nextRelease' => 'Disponible le jeudi 28 août',
                'platform' => 'Netflix',
                'poster' => 'https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&w=900&q=85',
                'progress' => null,
                'season' => null,
                'seasonComplete' => null,
                'seasons' => [],
                'status' => 'À venir',
                'title' => 'The Thursday Murder Club',
                'year' => '2025',
            ],
            default => abort(404),
        };
    }
}
