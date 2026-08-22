<?php

namespace Database\Factories;

use App\Models\Episode;
use App\Models\User;
use App\Models\UserEpisode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserEpisode>
 */
class UserEpisodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'episode_id' => Episode::factory(),
            'rating' => null,
            'user_id' => User::factory(),
            'watched_at' => null,
        ];
    }
}
