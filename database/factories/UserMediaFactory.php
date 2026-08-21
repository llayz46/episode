<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\User;
use App\Models\UserMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserMedia>
 */
class UserMediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'completed_at' => null,
            'is_featured' => false,
            'media_id' => Media::factory(),
            'started_at' => null,
            'status' => 'watchlist',
            'user_id' => User::factory(),
        ];
    }
}
