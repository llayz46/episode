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
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('tmdb_id')->unique();
            $table->unsignedSmallInteger('number');
            $table->string('title');
            $table->text('synopsis')->nullable();
            $table->string('still_path')->nullable();
            $table->date('aired_on')->nullable();
            $table->unsignedSmallInteger('runtime')->nullable();
            $table->decimal('vote_average', 3, 1)->nullable();
            $table->unsignedInteger('vote_count')->default(0);
            $table->timestamp('tmdb_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['season_id', 'number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
