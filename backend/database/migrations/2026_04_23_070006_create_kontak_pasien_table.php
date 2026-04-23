<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kontak_pasien', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignId('apoteker_id')->constrained('apoteker')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['pasien_id', 'apoteker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kontak_pasien');
    }
};
