<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tmdb_id',
    'type',
    'title',
    'original_title',
    'slug',
    'synopsis',
    'tagline',
    'poster_path',
    'backdrop_path',
    'released_on',
    'status',
    'runtime',
    'vote_average',
    'vote_count',
    'genres',
    'countries',
    'networks',
    'tmdb_synced_at',
])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'genres' => 'array',
            'countries' => 'array',
            'networks' => 'array',
            'released_on' => 'date',
            'tmdb_synced_at' => 'datetime',
            'vote_average' => 'decimal:1',
        ];
    }

    /**
     * @return HasMany<Season, $this>
     */
    public function seasons(): HasMany
    {
        return $this->hasMany(Season::class);
    }

    /**
     * @return HasMany<MediaCredit, $this>
     */
    public function credits(): HasMany
    {
        return $this->hasMany(MediaCredit::class);
    }

    /**
     * @return HasMany<UserMedia, $this>
     */
    public function userLibraries(): HasMany
    {
        return $this->hasMany(UserMedia::class);
    }
}
