<?php

namespace App\Models;

use Database\Factories\UserMediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'media_id',
    'status',
    'is_featured',
    'reminders_enabled',
    'rating',
    'started_at',
    'completed_at',
])]
class UserMedia extends Model
{
    /** @use HasFactory<UserMediaFactory> */
    use HasFactory;

    /** @var array<string, bool> */
    protected $attributes = [
        'reminders_enabled' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'is_featured' => 'boolean',
            'reminders_enabled' => 'boolean',
            'rating' => 'integer',
            'started_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
