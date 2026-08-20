<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\MediaCredit;
use App\Models\Person;
use App\Models\Season;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    config()->set('tmdb.api_token', 'test-token');
    config()->set('tmdb.api_url', 'https://api.themoviedb.org/3');
    config()->set('tmdb.image_url', 'https://image.tmdb.org/t/p');
    config()->set('tmdb.language', 'fr-FR');

    Http::preventStrayRequests();
});

test('it searches TMDB for films and series only', function () {
    Http::fake([
        'https://api.themoviedb.org/3/search/multi*' => Http::response([
            'results' => [
                [
                    'id' => 125988,
                    'media_type' => 'tv',
                    'name' => 'Silo',
                    'first_air_date' => '2023-05-04',
                    'overview' => 'Des survivants vivent sous terre. Leurs secrets restent enfouis.',
                    'poster_path' => '/silo.jpg',
                ],
                [
                    'id' => 287,
                    'media_type' => 'person',
                    'name' => 'Brad Pitt',
                ],
            ],
        ]),
    ]);

    $this->actingAs(User::factory()->create())
        ->getJson(route('tmdb.search', ['query' => 'Silo', 'type' => 'all']))
        ->assertSuccessful()
        ->assertJsonPath('results.0', [
            'tmdbId' => 125988,
            'type' => 'tv',
            'title' => 'Silo',
            'overview' => 'Des survivants vivent sous terre.',
            'year' => '2023',
            'posterUrl' => 'https://image.tmdb.org/t/p/w185/silo.jpg',
        ])
        ->assertJsonCount(1, 'results');

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.themoviedb.org/3/search/multi?page=1&query=Silo&language=fr-FR');
});

test('it imports a series with its seasons and episodes from TMDB', function () {
    Http::fake([
        'https://api.themoviedb.org/3/tv/125988/credits*' => Http::response([
            'cast' => [[
                'id' => 287,
                'name' => 'Rebecca Ferguson',
                'character' => 'Juliette Nichols',
                'profile_path' => '/rebecca.jpg',
                'known_for_department' => 'Acting',
                'order' => 0,
            ]],
        ]),
        'https://api.themoviedb.org/3/tv/125988/season/1*' => Http::response([
            'id' => 1001,
            'season_number' => 1,
            'name' => 'Saison 1',
            'overview' => 'La première saison.',
            'poster_path' => '/season.jpg',
            'air_date' => '2023-05-04',
            'vote_average' => 8.1,
            'vote_count' => 120,
            'episodes' => [
                [
                    'id' => 2001,
                    'episode_number' => 1,
                    'name' => 'Freedom Day',
                    'overview' => 'Le premier épisode.',
                    'still_path' => '/episode.jpg',
                    'air_date' => '2023-05-05',
                    'runtime' => 59,
                    'vote_average' => 8.3,
                    'vote_count' => 45,
                ],
            ],
        ]),
        'https://api.themoviedb.org/3/tv/125988*' => Http::response([
            'id' => 125988,
            'name' => 'Silo',
            'original_name' => 'Silo',
            'overview' => 'Des survivants vivent sous terre.',
            'tagline' => 'Le futur est enfoui.',
            'poster_path' => '/poster.jpg',
            'backdrop_path' => '/backdrop.jpg',
            'first_air_date' => '2023-05-04',
            'status' => 'Returning Series',
            'episode_run_time' => [55],
            'vote_average' => 8.2,
            'vote_count' => 2457,
            'genres' => [['name' => 'Science-fiction'], ['name' => 'Drame']],
            'production_countries' => [[
                'iso_3166_1' => 'US',
                'name' => 'United States of America',
            ]],
            'networks' => [['name' => 'Apple TV']],
            'seasons' => [['id' => 1001, 'season_number' => 1]],
        ]),
    ]);

    $this->actingAs(User::factory()->create())
        ->post(route('media.import'), ['tmdb_id' => 125988, 'type' => 'tv'])
        ->assertRedirect(route('media.show', 'silo-125988'));

    $media = Media::query()->where('tmdb_id', 125988)->where('type', 'tv')->firstOrFail();
    $season = Season::query()->where('tmdb_id', 1001)->firstOrFail();
    $episode = Episode::query()->where('tmdb_id', 2001)->firstOrFail();
    $person = Person::query()->where('tmdb_id', 287)->firstOrFail();
    $credit = MediaCredit::query()->whereBelongsTo($media)->firstOrFail();

    expect($media->title)->toBe('Silo')
        ->and($media->genres)->toBe(['Science-fiction', 'Drame'])
        ->and($media->countries)->toBe(['US'])
        ->and($media->networks)->toBe(['Apple TV'])
        ->and($season->media->is($media))->toBeTrue()
        ->and($episode->season->is($season))->toBeTrue()
        ->and($credit->person->is($person))->toBeTrue();

    $this->actingAs(User::factory()->create())
        ->get(route('media.show', $media->slug))
        ->assertInertia(fn ($page) => $page
            ->component('media/show')
            ->where('media.title', 'Silo')
            ->where('media.countryCode', 'US')
            ->where('media.platform', 'Apple TV')
            ->where('media.cast.0.name', 'Rebecca Ferguson')
            ->where('media.cast.0.role', 'Juliette Nichols')
            ->where('media.seasons.0.episodeCount', 1)
            ->where('media.episodeNavigation.0.code', 'S01E01'));
});
