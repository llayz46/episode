<?php

use App\Services\Tmdb\TmdbService;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    config()->set('tmdb.api_token', 'test-token');
    config()->set('tmdb.api_url', 'https://api.themoviedb.org/3');
    config()->set('tmdb.language', 'fr-FR');

    Http::preventStrayRequests();
});

it('recherche TMDB via chaque search endpoint pris en charge', function (): void {
    Http::fake([
        'https://api.themoviedb.org/3/search/multi*' => Http::response([
            'results' => [['id' => 125988, 'media_type' => 'tv', 'name' => 'Silo']],
        ]),
        'https://api.themoviedb.org/3/search/movie*' => Http::response([
            'results' => [['id' => 13, 'title' => 'Forrest Gump']],
        ]),
        'https://api.themoviedb.org/3/search/tv*' => Http::response([
            'results' => [['id' => 125988, 'name' => 'Silo']],
        ]),
        'https://api.themoviedb.org/3/search/person*' => Http::response([
            'results' => [['id' => 287, 'name' => 'Brad Pitt']],
        ]),
    ]);

    $service = app(TmdbService::class);

    expect($service->searchMulti('Silo', 2)['results'][0]['name'])->toBe('Silo')
        ->and($service->searchMovies('Forrest Gump')['results'][0]['title'])->toBe('Forrest Gump')
        ->and($service->searchSeries('Silo')['results'][0]['name'])->toBe('Silo')
        ->and($service->searchPeople('Brad Pitt')['results'][0]['name'])->toBe('Brad Pitt');

    Http::assertSentCount(4);

    Http::assertSent(function (Request $request): bool {
        return $request->url() === 'https://api.themoviedb.org/3/search/multi?page=2&query=Silo&language=fr-FR'
            && $request->header('Authorization') === ['Bearer test-token'];
    });

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.themoviedb.org/3/search/movie?page=1&query=Forrest%20Gump&language=fr-FR');
    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.themoviedb.org/3/search/tv?page=1&query=Silo&language=fr-FR');
    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.themoviedb.org/3/search/person?page=1&query=Brad%20Pitt&language=fr-FR');
});

it('récupère un film', function (): void {
    Http::fake([
        'https://api.themoviedb.org/3/movie/13*' => Http::response([
            'id' => 13,
            'title' => 'Forrest Gump',
        ]),
    ]);

    $movie = app(TmdbService::class)->movie(13);

    expect($movie)->toMatchArray([
        'id' => 13,
        'title' => 'Forrest Gump',
    ]);
});

it('récupère une série et l’une de ses saisons et un épisode', function (): void {
    Http::fake([
        'https://api.themoviedb.org/3/tv/125988/season/3/episode/2*' => Http::response([
            'id' => 7173958,
            'season_number' => 3,
            'episode_number' => 2,
            'name' => 'It\'s All Good',
            'air_date' => '2026-07-09'
        ]),
        'https://api.themoviedb.org/3/tv/125988/season/3*' => Http::response([
            'id' => 305133,
            'season_number' => 3,
            'episodes' => [],
        ]),
        'https://api.themoviedb.org/3/tv/125988*' => Http::response([
            'id' => 125988,
            'name' => 'Silo',
        ]),
    ]);

    $series = app(TmdbService::class)->series(125988);
    $season = app(TmdbService::class)->season(125988, 3);
    $episode = app(TmdbService::class)->episode(125988, 3, 2);

    expect($series['name'])->toBe('Silo')
        ->and($season['season_number'])->toBe(3)
        ->and($episode['id'])->toBe(7173958);
});

it('lève l’exception de réponse TMDB lorsqu’une réponse échoue', function (): void {
    Http::fake([
        'https://api.themoviedb.org/3/movie/404*' => Http::response([
            'status_message' => 'The resource you requested could not be found.',
        ], 404),
    ]);

    expect(fn (): array => app(TmdbService::class)->movie(404))
        ->toThrow(RequestException::class);
});

it('échoue avant toute requête lorsque le token TMDB est absent', function (): void {
    config()->set('tmdb.api_token', null);

    expect(fn (): array => app(TmdbService::class)->searchMulti('Silo'))
        ->toThrow(LogicException::class, 'Le token API TMDB n’est pas configuré.');
});
