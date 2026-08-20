<?php

use App\Models\Episode;
use App\Models\Media;
use App\Models\Season;
use Carbon\CarbonInterface;

test('a series owns its seasons and their episodes', function () {
    $media = Media::factory()->create(['type' => 'tv']);
    $season = Season::factory()->for($media)->create();
    $episode = Episode::factory()->for($season)->create();

    expect($media->seasons)->toHaveCount(1)
        ->and($media->seasons->first()->is($season))->toBeTrue()
        ->and($season->episodes)->toHaveCount(1)
        ->and($season->episodes->first()->is($episode))->toBeTrue()
        ->and($episode->season->is($season))->toBeTrue();
});

test('media catalogue dates and TMDB payload fields are cast correctly', function () {
    $media = Media::factory()->create([
        'genres' => ['Drame', 'Science-fiction'],
        'released_on' => '2023-05-04',
        'tmdb_synced_at' => '2026-08-20 10:00:00',
    ]);

    expect($media->genres)->toBe(['Drame', 'Science-fiction'])
        ->and($media->released_on)->toBeInstanceOf(CarbonInterface::class)
        ->and($media->tmdb_synced_at)->toBeInstanceOf(CarbonInterface::class);
});
