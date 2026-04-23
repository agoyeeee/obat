<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasien', function (Blueprint $table): void {
            $table->id();
            $table->string('nama');
            $table->integer('usia');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->float('berat_badan');
            $table->date('tgl_diagnosa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasien');
    }
};
