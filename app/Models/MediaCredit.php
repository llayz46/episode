<?php

namespace App\Models;

use Database\Factories\MediaCreditFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'media_id',
    'person_id',
    'credit_type',
    'character_name',
    'job',
    'department',
    'display_order',
])]
class MediaCredit extends Model
{
    /** @use HasFactory<MediaCreditFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * @return BelongsTo<Person, $this>
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
