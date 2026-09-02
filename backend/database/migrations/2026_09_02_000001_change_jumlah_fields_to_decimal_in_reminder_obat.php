<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminder_obat', function (Blueprint $table): void {
            $table->decimal('jumlah_obat', 10, 2)->default(0)->change();
            $table->decimal('jumlah_per_minum', 10, 2)->default(1)->change();
        });
    }

    public function down(): void
    {
        Schema::table('reminder_obat', function (Blueprint $table): void {
            $table->integer('jumlah_obat')->default(0)->change();
            $table->integer('jumlah_per_minum')->default(1)->change();
        });
    }
};
