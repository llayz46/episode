<?php

use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/', 'home')->name('home');
    Route::redirect('dashboard', '/')->name('dashboard');
    Route::get('media/{slug}/season-control', [MediaController::class, 'seasonControl'])
        ->name('media.season-control');
    Route::get('media/{slug}', [MediaController::class, 'show'])->name('media.show');
});

require __DIR__.'/settings.php';
