<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tmdb_id');
            $table->enum('type', ['movie', 'tv']);
            $table->string('title');
            $table->string('original_title')->nullable();
            $table->string('slug')->unique();
            $table->text('synopsis')->nullable();
            $table->string('tagline')->nullable();
            $table->string('poster_path')->nullable();
            $table->string('backdrop_path')->nullable();
            $table->date('released_on')->nullable();
            $table->string('status')->nullable();
            $table->unsignedSmallInteger('runtime')->nullable();
            $table->decimal('vote_average', 3, 1)->nullable();
            $table->unsignedInteger('vote_count')->default(0);
            $table->json('genres')->nullable();
            $table->timestamp('tmdb_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['tmdb_id', 'type']);
            $table->index(['type', 'released_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
