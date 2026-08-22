<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserEpisode;
use App\Models\UserMedia;
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

    $user = User::factory()->create();
    UserMedia::factory()->for($user)->for($series)->create([
        'is_featured' => true,
        'reminders_enabled' => true,
        'status' => 'following',
    ]);

    $this->actingAs($user)
        ->get(route('media.show', $series->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.kind', 'series')
            ->where('media.library.isFeatured', true)
            ->where('media.library.isFollowed', true)
            ->where('media.library.remindersEnabled', true)
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

test('authenticated users can access the current season from a series page', function () {
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
    Season::factory()->for($series)->create(['number' => 4]);

    $this->actingAs(User::factory()->create())
        ->get(route('media.show', $series->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.title', 'Silo')
            ->where('media.currentSeasonNumber', 3));
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

test('authenticated users can view an episode', function () {
    $series = Media::factory()->create([
        'type' => 'tv',
        'title' => 'Silo',
        'slug' => 'silo-125988',
        'networks' => ['Apple TV+'],
    ]);
    $season = Season::factory()->for($series)->create([
        'number' => 3,
        'title' => 'Saison 3',
    ]);
    Episode::factory()->for($season)->create([
        'number' => 4,
        'title' => 'L’ombre',
    ]);
    $selectedEpisode = Episode::factory()->for($season)->create([
        'number' => 5,
        'title' => 'Le passage',
        'synopsis' => 'Juliette découvre un nouveau passage.',
        'aired_on' => '2026-08-14',
        'runtime' => 55,
        'still_path' => '/le-passage.jpg',
        'vote_average' => 8.4,
        'vote_count' => 1245,
    ]);
    Episode::factory()->for($season)->create([
        'number' => 6,
        'title' => 'La porte',
    ]);

    $user = User::factory()->create();
    UserEpisode::factory()->for($user)->for($selectedEpisode)->create([
        'rating' => 8,
        'watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('media.episode', [
            'slug' => $series->slug,
            'season' => $season->number,
            'episode' => 5,
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/episode')
            ->where('media.title', 'Silo')
            ->where('media.platform', 'Apple TV+')
            ->where('season.title', 'Saison 3')
            ->where('episode.number', 5)
            ->where('episode.previousNumber', 4)
            ->where('episode.nextNumber', 6)
            ->where('episode.isWatched', true)
            ->where('episode.runtime', 55)
            ->where('episode.userRating', 8)
            ->where('episode.voteCount', 1245));
});

test('a user can mark an episode as watched and rate it', function () {
    $user = User::factory()->create();
    $episode = Episode::factory()->create();

    $this->actingAs($user)
        ->post(route('episodes.watched', $episode))
        ->assertRedirect();

    expect(UserEpisode::query()
        ->where('user_id', $user->id)
        ->where('episode_id', $episode->id)
        ->first())
        ->watched_at->not->toBeNull();

    $this->actingAs($user)
        ->post(route('episodes.rating', $episode), ['rating' => 9])
        ->assertRedirect();

    expect(UserEpisode::query()
        ->where('user_id', $user->id)
        ->where('episode_id', $episode->id)
        ->first())
        ->rating->toBe(9);
});

test('an unknown media page returns a not found response', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'unknown'))
        ->assertNotFound();
});
