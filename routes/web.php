<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/', 'home')->name('home');
    Route::redirect('dashboard', '/')->name('dashboard');
});

require __DIR__.'/settings.php';
