<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page from a media page', function () {
    $this->get(route('media.show', 'silo'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view a series page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'silo'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.kind', 'series')
            ->where('media.title', 'Silo'));
});

test('authenticated users can view a film page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'the-thursday-murder-club'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/show')
            ->where('media.kind', 'movie')
            ->where('media.title', 'The Thursday Murder Club'));
});

test('authenticated users can view the season control direction', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.season-control', 'silo'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('media/season-control')
            ->where('media.title', 'Silo')
            ->where(
                'media.backdrop',
                'https://image.tmdb.org/t/p/original/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg',
            )
            ->where(
                'media.poster',
                'https://image.tmdb.org/t/p/w780/gMYZZvnkVNTqSVnVCphWbPXwWwb.jpg',
            )
            ->where('media.episodeNavigation.1.code', 'S03E07')
            ->where('media.episodeNavigation.1.title', 'Radio')
            ->where('media.episodeNavigation.1.airDate', '13 août 2026')
            ->where(
                'media.episodeNavigation.1.image',
                'https://image.tmdb.org/t/p/w1280/hT47PUyS6fQrmukmbyXrL9nBgKc.jpg',
            )
            ->where(
                'media.cast.0.image',
                'https://image.tmdb.org/t/p/w342/dXYJxqSowCeyEr03cWYzbA7a33.jpg',
            )
            ->where('media.cast.1.name', 'Harriet Walter')
            ->where('media.seasons.2.image', 'https://image.tmdb.org/t/p/w500/eviZTbKOXOeSaR268iJ9yqtwTNU.jpg')
            ->where('media.rating.average', 8.2)
            ->where('media.creator.name', 'Graham Yost'));
});

test('an unknown media page returns a not found response', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('media.show', 'unknown'))
        ->assertNotFound();
});
