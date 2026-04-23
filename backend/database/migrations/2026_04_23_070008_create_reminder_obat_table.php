<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminder_obat', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignId('obat_id')->constrained('obat')->cascadeOnDelete();
            $table->foreignId('merk_id')->nullable()->constrained('merk')->nullOnDelete();
            $table->string('dosis');
            $table->string('sediaan');
            $table->integer('jumlah_obat');
            $table->foreignId('waktu_konsumsi_id')->constrained('waktu_konsumsi')->cascadeOnDelete();
            $table->text('cara_pemakaian');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminder_obat');
    }
};
