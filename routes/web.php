<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MediaImportController;
use App\Http\Controllers\MediaLibraryController;
use App\Http\Controllers\TmdbSearchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', HomeController::class)->name('home');
    Route::redirect('dashboard', '/')->name('dashboard');
    Route::get('tmdb/search', TmdbSearchController::class)->name('tmdb.search');
    Route::post('media/import', [MediaImportController::class, 'store'])->name('media.import');
    Route::post('media/{media:slug}/follow', [MediaLibraryController::class, 'follow'])
        ->name('media.follow');
    Route::post('media/{media:slug}/feature', [MediaLibraryController::class, 'feature'])
        ->name('media.feature');
    Route::get('media/{slug}/season-control', [MediaController::class, 'seasonControl'])
        ->name('media.season-control');
    Route::get('media/{slug}/seasons/{season}/episodes/{episode}', [MediaController::class, 'episode'])
        ->whereNumber(['season', 'episode'])
        ->name('media.episode');
    Route::get('media/{slug}/seasons/{season}', [MediaController::class, 'season'])
        ->whereNumber('season')
        ->name('media.season');
    Route::get('media/{slug}', [MediaController::class, 'show'])->name('media.show');
});

require __DIR__.'/settings.php';
