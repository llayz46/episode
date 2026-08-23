<?php

use App\Models\Media;
use App\Models\Person;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config()->set('tmdb.api_token', 'test-token');
    config()->set('tmdb.api_url', 'https://api.themoviedb.org/3');
    config()->set('tmdb.image_url', 'https://image.tmdb.org/t/p');
    config()->set('tmdb.language', 'fr-FR');

    Http::preventStrayRequests();
});

test('guests are redirected to the login page from a person page', function () {
    $person = Person::factory()->create();

    $this->get(route('people.show', $person->slug))
        ->assertRedirect(route('login'));
});

test('authenticated users can view a person page and its filmography', function () {
    $person = Person::factory()->create([
        'tmdb_id' => 287,
        'name' => 'Rebecca Ferguson',
        'slug' => 'rebecca-ferguson',
        'profile_path' => '/rebecca.jpg',
    ]);
    $media = Media::factory()->create([
        'tmdb_id' => 125988,
        'type' => 'tv',
        'slug' => 'silo-125988',
    ]);

    Http::fake([
        'https://api.themoviedb.org/3/person/287*' => Http::response([
            'name' => 'Rebecca Ferguson',
            'birthday' => '1983-10-19',
            'biography' => 'Actrice suédoise.',
            'place_of_birth' => 'Stockholm, Suède',
            'profile_path' => '/rebecca.jpg',
            'known_for_department' => 'Acting',
            'combined_credits' => [
                'cast' => [
                    [
                        'id' => 125988,
                        'media_type' => 'tv',
                        'name' => 'Silo',
                        'first_air_date' => '2023-05-04',
                        'poster_path' => '/silo.jpg',
                        'character' => 'Juliette Nichols',
                    ],
                ],
                'crew' => [
                    [
                        'id' => 101,
                        'media_type' => 'movie',
                        'title' => 'Mission: Impossible',
                        'release_date' => '2023-07-10',
                        'poster_path' => '/mission.jpg',
                        'job' => 'Productrice',
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('people.show', $person->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('people/show')
            ->where('person.name', 'Rebecca Ferguson')
            ->where('person.age', (int) CarbonImmutable::parse('1983-10-19')->diffInYears(now()))
            ->where('person.birthDate', '19 octobre 1983')
            ->where('person.biography', 'Actrice suédoise.')
            ->where('person.filmography.0.title', 'Mission: Impossible')
            ->where('person.filmography.0.slug', null)
            ->where('person.filmography.1.title', 'Silo')
            ->where('person.filmography.1.slug', $media->slug)
            ->where('person.filmography.1.role', 'Juliette Nichols'));
});

test('an unknown person page returns a not found response', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('people.show', 'inconnue'))
        ->assertNotFound();
});
