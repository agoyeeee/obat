<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekapan_cairan', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->date('minggu_mulai');
            $table->enum('status_kepatuhan', ['PATUH', 'TIDAK_PATUH'])->default('TIDAK_PATUH');
            $table->timestamps();

            $table->unique(['pasien_id', 'minggu_mulai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekapan_cairan');
    }
};
