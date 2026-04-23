<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekap_kuisioner', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->date('tanggal');
            $table->integer('total_skor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekap_kuisioner');
    }
};
