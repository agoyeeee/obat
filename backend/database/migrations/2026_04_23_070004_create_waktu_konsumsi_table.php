<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waktu_konsumsi', function (Blueprint $table): void {
            $table->id();
            $table->string('label_waktu');
            $table->time('jam');
            $table->integer('frekuensi');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waktu_konsumsi');
    }
};
