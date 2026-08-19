<?php

return [

    /*
    |--------------------------------------------------------------------------
    | The Movie Database (TMDB)
    |--------------------------------------------------------------------------
    |
    | Configuration utilisée pour authentifier les requêtes et construire les
    | URL de l’API et des images TMDB. Garder les identifiants dans les
    | variables d’environnement.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Token de lecture API
    |--------------------------------------------------------------------------
    |
    | Le token utilisé pour authentifier les requêtes vers l’API TMDB.
    |
    */
    'api_token' => env('TMDB_API_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Langue des réponses
    |--------------------------------------------------------------------------
    |
    | La locale envoyée par défaut à TMDB lors des requêtes de contenus traduits.
    |
    */
    'language' => env('TMDB_LANGUAGE', 'en-US'),

    /*
    |--------------------------------------------------------------------------
    | URL de base de l’API
    |--------------------------------------------------------------------------
    |
    | Ne pas terminer cette URL par un slash : les points d’entrée API y sont
    | ajoutés avec un slash.
    |
    */
    'api_url' => env('TMDB_API_URL', 'https://api.themoviedb.org/3'),

    /*
    |--------------------------------------------------------------------------
    | URL de base des images
    |--------------------------------------------------------------------------
    |
    | Ne pas terminer cette URL par un slash : les tailles et chemins d’images
    | y sont ajoutés avec un slash.
    |
    */
    'image_url' => env('TMDB_IMAGE_URL', 'https://image.tmdb.org/t/p'),
];
