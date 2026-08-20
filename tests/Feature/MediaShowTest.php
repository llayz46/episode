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

test('an unknown media page returns a not found response', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'unknown'))
        ->assertNotFound();
});
