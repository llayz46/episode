<?php

namespace App\Services\Tmdb;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use LogicException;
use UnexpectedValueException;

final class TmdbService
{
    /**
     * Recherche des films, séries et personnes via le multi-search endpoint TMDB.
     *
     * @return array<string, mixed>
     */
    public function searchMulti(string $query, int $page = 1): array
    {
        return $this->searchEndpoint('search/multi', $query, $page);
    }

    /**
     * Recherche des films via le movie search endpoint TMDB.
     *
     * @return array<string, mixed>
     */
    public function searchMovies(string $query, int $page = 1): array
    {
        return $this->searchEndpoint('search/movie', $query, $page);
    }

    /**
     * Recherche des séries via le TV search endpoint TMDB.
     *
     * @return array<string, mixed>
     */
    public function searchSeries(string $query, int $page = 1): array
    {
        return $this->searchEndpoint('search/tv', $query, $page);
    }

    /**
     * Recherche des personnes via le person search endpoint TMDB.
     *
     * @return array<string, mixed>
     */
    public function searchPeople(string $query, int $page = 1): array
    {
        return $this->searchEndpoint('search/person', $query, $page);
    }

    /**
     * Récupère un film et ses métadonnées TMDB.
     *
     * @return array<string, mixed>
     */
    public function movie(int $tmdbId): array
    {
        return $this->get("movie/{$tmdbId}");
    }

    /**
     * Récupère une série et ses métadonnées TMDB.
     *
     * @return array<string, mixed>
     */
    public function series(int $tmdbId): array
    {
        return $this->get("tv/{$tmdbId}");
    }

    /**
     * Récupère une saison précise et ses épisodes depuis TMDB.
     *
     * @return array<string, mixed>
     */
    public function season(int $seriesTmdbId, int $seasonNumber): array
    {
        return $this->get("tv/{$seriesTmdbId}/season/{$seasonNumber}");
    }
    
    /**
     * Récupère un épisode précis depuis TMDB.
     *
     * @return array<string, mixed>
     */
    public function episode(int $seriesTmdbId, int $seasonNumber, int $episodeNumber): array
    {
        return $this->get("tv/{$seriesTmdbId}/season/{$seasonNumber}/episode/{$episodeNumber}");
    }

    /**
     * @param  array<string, int|string>  $query
     * @return array<string, mixed>
     */
    private function get(string $uri, array $query = []): array
    {
        $payload = $this->client()
            ->get($uri, [
                ...$query,
                'language' => config('tmdb.language'),
            ])
            ->throw()
            ->json();

        if (! is_array($payload)) {
            throw new UnexpectedValueException('TMDB a retourné une réponse invalide.');
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function searchEndpoint(string $endpoint, string $query, int $page): array
    {
        return $this->get($endpoint, [
            'page' => $page,
            'query' => $query,
        ]);
    }

    private function client(): PendingRequest
    {
        $token = config('tmdb.api_token');

        if (! is_string($token) || $token === '') {
            throw new LogicException('Le token API TMDB n’est pas configuré.');
        }

        return Http::acceptJson()
            ->baseUrl(rtrim((string) config('tmdb.api_url'), '/'))
            ->withToken($token)
            ->connectTimeout(3)
            ->timeout(10)
            ->retry([100, 500], throw: false);
    }
}
