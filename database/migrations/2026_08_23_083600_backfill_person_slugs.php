<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $usedSlugs = [];

        DB::table('people')
            ->select(['id', 'name', 'tmdb_id'])
            ->orderBy('id')
            ->each(function (object $person) use (&$usedSlugs): void {
                $baseSlug = Str::slug((string) $person->name) ?: 'person';
                $slug = $baseSlug;
                $suffix = 1;

                while (isset($usedSlugs[$slug])) {
                    $slug = $suffix === 1
                        ? "{$baseSlug}-{$person->tmdb_id}"
                        : "{$baseSlug}-{$person->tmdb_id}-{$suffix}";
                    $suffix++;
                }

                $usedSlugs[$slug] = true;

                DB::table('people')
                    ->where('id', $person->id)
                    ->update(['slug' => $slug]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('people')->update(['slug' => null]);
    }
};
