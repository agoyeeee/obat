<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_konsumsi_cairan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reminder_cairan_id')->constrained('reminder_cairan')->cascadeOnDelete();
            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('waktu');
            $table->enum('status', ['diminum', 'terlewat'])->default('terlewat');
            $table->integer('skor')->default(0);
            $table->timestamps();

            $table->unique(['reminder_cairan_id', 'tanggal', 'waktu'], 'unique_cairan_log');
            $table->index(['pasien_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_konsumsi_cairan');
    }
};
