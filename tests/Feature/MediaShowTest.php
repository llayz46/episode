<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page from a media page', function () {
    $media = Media::factory()->create();

    $this->get(route('media.show', $media->slug))
        ->assertRedirect(route('login'));
});

test('authenticated users can view a series page', function () {
    $series = Media::factory()->create([
        'type' => 'tv',
        'title' => 'Silo',
        'slug' => 'silo-125988',
    ]);
    $season = Season::factory()->for($series)->create([
        'number' => 1,
        'episode_count' => 1,
    ]);
    Episode::factory()->for($season)->create([
        'number' => 1,
        'aired_on' => now()->subDay(),
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('media.show', $series->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.kind', 'series')
            ->where('media.title', 'Silo'));
});

test('authenticated users can view a film page', function () {
    $film = Media::factory()->create([
        'type' => 'movie',
        'title' => 'The Thursday Murder Club',
        'slug' => 'the-thursday-murder-club-502356',
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('media.show', $film->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.kind', 'movie')
            ->where('media.title', 'The Thursday Murder Club'));
});

test('authenticated users can view the season control direction', function () {
    $series = Media::factory()->create([
        'type' => 'tv',
        'title' => 'Silo',
        'slug' => 'silo-125988',
    ]);
    $season = Season::factory()->for($series)->create([
        'number' => 3,
        'episode_count' => 1,
    ]);
    Episode::factory()->for($season)->create([
        'number' => 7,
        'title' => 'Radio',
        'aired_on' => now()->subDay(),
        'still_path' => '/radio.jpg',
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('media.season-control', $series->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/season-control')
            ->where('media.title', 'Silo')
            ->where('media.episodeNavigation.0.code', 'S03E07')
            ->where('media.episodeNavigation.0.title', 'Radio'));
});

test('authenticated users can view a season and its episodes', function () {
    $series = Media::factory()->create([
        'type' => 'tv',
        'title' => 'Silo',
        'slug' => 'silo-125988',
    ]);
    $season = Season::factory()->for($series)->create([
        'number' => 3,
        'title' => 'Saison 3',
        'synopsis' => 'La saison qui change tout.',
        'episode_count' => 1,
    ]);
    Season::factory()->for($series)->create(['number' => 1]);
    Season::factory()->for($series)->create(['number' => 4]);
    Episode::factory()->for($season)->create([
        'number' => 5,
        'title' => 'Le passage',
        'synopsis' => 'Juliette découvre un nouveau passage.',
        'aired_on' => '2026-08-14',
        'runtime' => 55,
        'still_path' => '/le-passage.jpg',
        'vote_average' => 8.4,
        'vote_count' => 1245,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('media.season', ['slug' => $series->slug, 'season' => $season->number]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/season')
            ->where('media.slug', 'silo-125988')
            ->where('season.number', 3)
            ->where('season.previousNumber', 1)
            ->where('season.nextNumber', 4)
            ->where('season.title', 'Saison 3')
            ->where('season.episodes.0.number', 5)
            ->where('season.episodes.0.title', 'Le passage')
            ->where('season.episodes.0.image', 'https://image.tmdb.org/t/p/w780/le-passage.jpg')
            ->where('season.episodes.0.runtime', 55)
            ->where('season.episodes.0.voteCount', 1245));
});

test('an unknown media page returns a not found response', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'unknown'))
        ->assertNotFound();
});
