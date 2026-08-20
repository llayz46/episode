<?php

namespace App\Models;

use Database\Factories\PersonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tmdb_id',
    'name',
    'profile_path',
    'known_for_department',
])]
class Person extends Model
{
    /** @use HasFactory<PersonFactory> */
    use HasFactory;

    /**
     * @return HasMany<MediaCredit, $this>
     */
    public function credits(): HasMany
    {
        return $this->hasMany(MediaCredit::class);
    }
}
