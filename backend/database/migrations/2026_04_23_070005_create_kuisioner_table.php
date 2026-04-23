<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuisioner', function (Blueprint $table): void {
            $table->id();
            $table->text('pertanyaan');
            $table->enum('tipe', ['ya_tidak', 'skala', 'pilihan']);
            $table->json('opsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuisioner');
    }
};
