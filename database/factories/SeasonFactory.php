<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\Season;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Season>
 */
class SeasonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'media_id' => Media::factory(),
            'tmdb_id' => fake()->unique()->numberBetween(1, 9_999_999),
            'number' => fake()->unique()->numberBetween(0, 20),
            'title' => fake()->sentence(3),
            'synopsis' => fake()->paragraph(),
            'poster_path' => '/season.jpg',
            'aired_on' => fake()->dateTimeBetween('-10 years', '+1 year'),
            'episode_count' => fake()->numberBetween(0, 30),
            'vote_average' => fake()->randomFloat(1, 0, 10),
            'vote_count' => fake()->numberBetween(0, 100_000),
            'tmdb_synced_at' => now(),
        ];
    }
}
