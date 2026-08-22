<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserMedia;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page from the home page', function () {
    $response = $this->get(route('home'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the home page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('home'));
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->where('featuredMedia', null)
        ->has('trackedMedia', 0)
        ->has('bingeReady', 0)
        ->has('upcomingReleases', 0)
        ->where('week.releaseCount', 0));
});

test('authenticated users can visit their collection', function () {
    $user = User::factory()->create();
    $media = Media::factory()->create([
        'slug' => 'silo-125988',
        'title' => 'Silo',
    ]);
    UserMedia::factory()->for($user)->for($media)->create([
        'is_featured' => true,
        'status' => 'following',
    ]);

    $this->actingAs($user)
        ->get(route('collection'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('collection')
            ->where('total', 1)
            ->where('items.0.title', 'Silo')
            ->where('items.0.libraryStatus', 'following')
            ->where('items.0.isFeatured', true));
});

test('the home page prioritizes the user featured media and followed media', function () {
    $user = User::factory()->create();
    $featuredMedia = Media::factory()->create([
        'slug' => 'silo-125988',
        'title' => 'Silo',
        'type' => 'tv',
    ]);
    $trackedMedia = Media::factory()->create([
        'slug' => 'severance-95396',
        'title' => 'Severance',
        'type' => 'tv',
    ]);
    UserMedia::factory()->for($user)->for($featuredMedia)->create([
        'is_featured' => true,
        'status' => 'following',
    ]);
    UserMedia::factory()->for($user)->for($trackedMedia)->create([
        'status' => 'following',
    ]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('featuredMedia.title', 'Silo')
            ->where('featuredMedia.slug', 'silo-125988')
            ->has('trackedMedia', 2)
            ->where('trackedMedia.0.title', 'Silo')
            ->where('trackedMedia.1.title', 'Severance'));
});

test('the home page derives binge-ready media and upcoming releases from the user library', function () {
    $user = User::factory()->create();
    $airingMedia = Media::factory()->create([
        'slug' => 'silo-125988',
        'title' => 'Silo',
        'type' => 'tv',
    ]);
    $airingSeason = Season::factory()->for($airingMedia)->create([
        'episode_count' => 2,
        'number' => 1,
    ]);
    Episode::factory()->for($airingSeason)->create([
        'aired_on' => now()->subWeek(),
        'number' => 1,
    ]);
    Episode::factory()->for($airingSeason)->create([
        'aired_on' => now()->addDays(2),
        'number' => 2,
        'title' => 'Le prochain épisode',
    ]);
    $bingeReadyMedia = Media::factory()->create([
        'slug' => 'severance-95396',
        'title' => 'Severance',
        'type' => 'tv',
    ]);
    $bingeReadySeason = Season::factory()->for($bingeReadyMedia)->create([
        'episode_count' => 2,
        'number' => 1,
    ]);
    Episode::factory()->for($bingeReadySeason)->create([
        'aired_on' => now()->subDays(2),
        'number' => 1,
    ]);
    Episode::factory()->for($bingeReadySeason)->create([
        'aired_on' => now()->subDay(),
        'number' => 2,
    ]);
    $upcomingFilm = Media::factory()->create([
        'released_on' => now()->addDays(3),
        'slug' => 'the-thursday-murder-club-502356',
        'title' => 'The Thursday Murder Club',
        'type' => 'movie',
    ]);
    UserMedia::factory()->for($user)->for($airingMedia)->create([
        'is_featured' => true,
        'status' => 'following',
    ]);
    UserMedia::factory()->for($user)->for($bingeReadyMedia)->create([
        'rating' => 9,
        'status' => 'watchlist',
    ]);
    UserMedia::factory()->for($user)->for($upcomingFilm)->create([
        'status' => 'following',
    ]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('bingeReady.0.title', 'Severance')
            ->where('bingeReady.0.userRating', 9)
            ->where('upcomingReleases.0.title', 'Silo')
            ->where('upcomingReleases.0.episode', 'S01E02')
            ->where('upcomingReleases.1.title', 'The Thursday Murder Club')
            ->where('week.highlight.title', 'Silo')
            ->where('week.releaseCount', 2));
});

test('a user can set a media as their home featured media', function () {
    $user = User::factory()->create();
    $previousMedia = Media::factory()->create();
    $media = Media::factory()->create(['slug' => 'silo-125988']);
    UserMedia::factory()->for($user)->for($previousMedia)->create([
        'is_featured' => true,
        'status' => 'watching',
    ]);

    $this->actingAs($user)
        ->post(route('media.feature', $media->slug))
        ->assertRedirect();

    expect(UserMedia::query()
        ->where('user_id', $user->id)
        ->where('media_id', $previousMedia->id)
        ->first())
        ->is_featured->toBeFalse();
    expect(UserMedia::query()
        ->where('user_id', $user->id)
        ->where('media_id', $media->id)
        ->first())
        ->status->toBe('following')
        ->is_featured->toBeTrue();
});

test('a user can follow media for their home dashboard', function () {
    $user = User::factory()->create();
    $media = Media::factory()->create(['slug' => 'severance-95396']);

    $this->actingAs($user)
        ->post(route('media.follow', $media->slug))
        ->assertRedirect();

    expect(UserMedia::query()
        ->where('user_id', $user->id)
        ->where('media_id', $media->id)
        ->first())
        ->status->toBe('following')
        ->is_featured->toBeFalse();
});

test('a user can rate media from their library', function () {
    $user = User::factory()->create();
    $media = Media::factory()->create(['slug' => 'severance-95396']);

    $this->actingAs($user)
        ->post(route('media.rating', $media->slug), ['rating' => 9])
        ->assertRedirect();

    expect(UserMedia::query()
        ->whereBelongsTo($user)
        ->whereBelongsTo($media)
        ->first())
        ->rating->toBe(9)
        ->status->toBe('watchlist');
});

test('a user can toggle reminders for a followed media', function () {
    $user = User::factory()->create();
    $media = Media::factory()->create(['slug' => 'silo-125988']);

    $this->actingAs($user)
        ->post(route('media.reminder', $media->slug))
        ->assertRedirect();

    expect(UserMedia::query()
        ->where('user_id', $user->id)
        ->where('media_id', $media->id)
        ->first())
        ->status->toBe('following')
        ->reminders_enabled->toBeTrue();

    $this->actingAs($user)
        ->post(route('media.reminder', $media->slug))
        ->assertRedirect();

    expect(UserMedia::query()
        ->where('user_id', $user->id)
        ->where('media_id', $media->id)
        ->first())
        ->reminders_enabled->toBeFalse();
});

test('the previous dashboard URL redirects to the home page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertRedirectToRoute('home');
});

test('authenticated users can visit the button gallery', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('buttons'))->assertSuccessful();
});
