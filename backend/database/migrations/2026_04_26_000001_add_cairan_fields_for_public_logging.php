<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminder_cairan', function (Blueprint $table): void {
            $table->string('minuman', 100)->nullable()->after('waktu');
            $table->string('catatan_asupan', 255)->nullable()->after('minuman');
        });

        Schema::table('log_konsumsi_cairan', function (Blueprint $table): void {
            $table->string('minuman', 100)->nullable()->after('waktu');
            $table->integer('jumlah_ml')->nullable()->after('minuman');
            $table->string('catatan_asupan', 255)->nullable()->after('jumlah_ml');
        });
    }

    public function down(): void
    {
        Schema::table('log_konsumsi_cairan', function (Blueprint $table): void {
            $table->dropColumn(['minuman', 'jumlah_ml', 'catatan_asupan']);
        });

        Schema::table('reminder_cairan', function (Blueprint $table): void {
            $table->dropColumn(['minuman', 'catatan_asupan']);
        });
    }
};
