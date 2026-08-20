<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tmdb_id' => fake()->unique()->numberBetween(1, 9_999_999),
            'type' => fake()->randomElement(['movie', 'tv']),
            'title' => fake()->sentence(3),
            'original_title' => fake()->sentence(3),
            'slug' => Str::slug(fake()->unique()->sentence(3)),
            'synopsis' => fake()->paragraph(),
            'tagline' => fake()->sentence(),
            'poster_path' => '/poster.jpg',
            'backdrop_path' => '/backdrop.jpg',
            'released_on' => fake()->dateTimeBetween('-10 years', '+1 year'),
            'status' => fake()->randomElement(['Released', 'Returning Series']),
            'runtime' => fake()->numberBetween(20, 180),
            'vote_average' => fake()->randomFloat(1, 0, 10),
            'vote_count' => fake()->numberBetween(0, 100_000),
            'genres' => [fake()->word(), fake()->word()],
            'countries' => ['US'],
            'networks' => ['Apple TV'],
            'tmdb_synced_at' => now(),
        ];
    }
}
