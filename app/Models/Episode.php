<?php

namespace App\Models;

use Database\Factories\EpisodeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'season_id',
    'tmdb_id',
    'number',
    'title',
    'synopsis',
    'still_path',
    'aired_on',
    'runtime',
    'vote_average',
    'vote_count',
    'tmdb_synced_at',
])]
class Episode extends Model
{
    /** @use HasFactory<EpisodeFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'aired_on' => 'date',
            'tmdb_synced_at' => 'datetime',
            'vote_average' => 'decimal:1',
        ];
    }

    /**
     * @return BelongsTo<Season, $this>
     */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /**
     * @return HasMany<UserEpisode, $this>
     */
    public function userProgress(): HasMany
    {
        return $this->hasMany(UserEpisode::class);
    }
}
