<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merk', function (Blueprint $table): void {
            $table->id();
            $table->string('nama_merk');
            $table->foreignId('obat_id')->constrained('obat')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merk');
    }
};
