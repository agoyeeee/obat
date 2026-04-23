<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jawaban_kuisioner', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('rekap_kuisioner_id')->constrained('rekap_kuisioner')->cascadeOnDelete();
            $table->foreignId('kuisioner_id')->constrained('kuisioner')->cascadeOnDelete();
            $table->string('jawaban');
            $table->integer('skor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jawaban_kuisioner');
    }
};
