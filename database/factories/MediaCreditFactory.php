<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\MediaCredit;
use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaCredit>
 */
class MediaCreditFactory extends Factory
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
            'person_id' => Person::factory(),
            'credit_type' => 'cast',
            'character_name' => fake()->name(),
            'job' => null,
            'department' => 'Acting',
            'display_order' => 0,
        ];
    }
}
