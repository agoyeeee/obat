<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekapan_obat', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->date('tanggal');
            $table->integer('total_skor');
            $table->timestamps();

            $table->unique(['pasien_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekapan_obat');
    }
};
