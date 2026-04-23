<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('log_konsumsi_obat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reminder_obat_id')->constrained('reminder_obat')->cascadeOnDelete();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('waktu');
            $table->enum('status', ['diminum', 'terlewat'])->default('terlewat');
            $table->integer('skor')->default(0);
            $table->timestamps();

            // Constraints & Indexes
            $table->unique(['reminder_obat_id', 'tanggal', 'waktu'], 'unique_consumption_log');
            $table->index(['pasien_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_konsumsi_obat');
    }
};
