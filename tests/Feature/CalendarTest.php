<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use App\Models\User;
use App\Models\UserMedia;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

test('the calendar only includes releases from the authenticated user library', function () {
    CarbonImmutable::setTestNow('2026-08-01');

    try {
        $user = User::factory()->create();
        $followedSeries = Media::factory()->create([
            'networks' => ['Apple TV+'],
            'slug' => 'silo-125988',
            'title' => 'Silo',
            'type' => 'tv',
        ]);
        $followedSeason = Season::factory()->for($followedSeries)->create([
            'number' => 3,
        ]);
        Episode::factory()->for($followedSeason)->create([
            'aired_on' => '2026-08-22',
            'number' => 7,
            'title' => 'La radio',
        ]);
        UserMedia::factory()->for($user)->for($followedSeries)->create([
            'status' => 'following',
        ]);

        $followedMovie = Media::factory()->create([
            'released_on' => '2026-08-28',
            'slug' => 'the-thursday-murder-club-123',
            'title' => 'The Thursday Murder Club',
            'type' => 'movie',
        ]);
        UserMedia::factory()->for($user)->for($followedMovie)->create([
            'status' => 'following',
        ]);

        $otherSeries = Media::factory()->create([
            'slug' => 'not-followed-456',
            'title' => 'Not followed',
            'type' => 'tv',
        ]);
        $otherSeason = Season::factory()->for($otherSeries)->create(['number' => 1]);
        Episode::factory()->for($otherSeason)->create([
            'aired_on' => '2026-08-23',
            'number' => 1,
            'title' => 'Invisible',
        ]);

        $this->actingAs($user)
            ->get(route('calendar', ['month' => '2026-08']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('calendar')
                ->where('month', '2026-08')
                ->where('view', 'month')
                ->has('events', 2)
                ->where('events.0.date', '2026-08-22')
                ->where('events.0.episode', 'S03E07')
                ->where('events.0.image', 'https://image.tmdb.org/t/p/w780/episode.jpg')
                ->where('events.0.media.title', 'Silo')
                ->where('events.0.media.image', 'https://image.tmdb.org/t/p/w342/poster.jpg')
                ->where('events.1.kind', 'movie')
                ->where('events.1.media.title', 'The Thursday Murder Club'));

        $this->actingAs($user)
            ->get(route('calendar', ['month' => '2026-08', 'view' => 'week']))
            ->assertInertia(fn (Assert $page) => $page->where('view', 'week'));
    } finally {
        CarbonImmutable::setTestNow();
    }
});
