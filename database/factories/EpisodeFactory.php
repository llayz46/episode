<?php

namespace Database\Factories;

use App\Models\Episode;
use App\Models\Season;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Episode>
 */
class EpisodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'season_id' => Season::factory(),
            'tmdb_id' => fake()->unique()->numberBetween(1, 9_999_999),
            'number' => fake()->unique()->numberBetween(1, 30),
            'title' => fake()->sentence(3),
            'synopsis' => fake()->paragraph(),
            'still_path' => '/episode.jpg',
            'aired_on' => fake()->dateTimeBetween('-10 years', '+1 year'),
            'runtime' => fake()->numberBetween(20, 90),
            'vote_average' => fake()->randomFloat(1, 0, 10),
            'vote_count' => fake()->numberBetween(0, 100_000),
            'tmdb_synced_at' => now(),
        ];
    }
}
