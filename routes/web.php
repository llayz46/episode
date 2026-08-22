<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\EpisodeProgressController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MediaImportController;
use App\Http\Controllers\MediaLibraryController;
use App\Http\Controllers\TmdbSearchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', HomeController::class)->name('home');
    Route::get('calendar', CalendarController::class)->name('calendar');
    Route::get('collection', CollectionController::class)->name('collection');
    Route::redirect('dashboard', '/')->name('dashboard');
    Route::get('tmdb/search', TmdbSearchController::class)->name('tmdb.search');
    Route::post('media/import', [MediaImportController::class, 'store'])->name('media.import');
    Route::post('media/{media:slug}/follow', [MediaLibraryController::class, 'follow'])
        ->name('media.follow');
    Route::post('media/{media:slug}/feature', [MediaLibraryController::class, 'feature'])
        ->name('media.feature');
    Route::post('media/{media:slug}/reminder', [MediaLibraryController::class, 'toggleReminder'])
        ->name('media.reminder');
    Route::post('media/{media:slug}/rating', [MediaLibraryController::class, 'rate'])
        ->name('media.rating');
    Route::post('episodes/{episode}/watched', [EpisodeProgressController::class, 'toggleWatched'])
        ->name('episodes.watched');
    Route::post('episodes/{episode}/rating', [EpisodeProgressController::class, 'rate'])
        ->name('episodes.rating');
    Route::get('media/{slug}/seasons/{season}/episodes/{episode}', [MediaController::class, 'episode'])
        ->whereNumber(['season', 'episode'])
        ->name('media.episode');
    Route::get('media/{slug}/seasons/{season}', [MediaController::class, 'season'])
        ->whereNumber('season')
        ->name('media.season');
    Route::get('media/{slug}', [MediaController::class, 'show'])->name('media.show');
});

require __DIR__.'/settings.php';
