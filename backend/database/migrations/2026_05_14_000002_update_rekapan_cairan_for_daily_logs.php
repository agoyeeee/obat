<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('rekapan_cairan', 'tanggal')) {
            Schema::table('rekapan_cairan', function (Blueprint $table): void {
                $table->date('tanggal')->nullable()->after('pasien_id');
                $table->time('waktu')->nullable()->after('tanggal');
                $table->string('minuman', 100)->nullable()->after('waktu');
                $table->integer('jumlah_ml')->nullable()->after('minuman');
                $table->string('catatan_asupan', 255)->nullable()->after('jumlah_ml');
                $table->index('pasien_id');
            });
        }

        Schema::table('rekapan_cairan', function (Blueprint $table): void {
            $table->dropForeign(['pasien_id']);
            $table->dropUnique('rekapan_cairan_pasien_id_minggu_mulai_unique');
            $table->foreign('pasien_id')->references('id')->on('pasien')->cascadeOnDelete();
        });

        DB::statement("ALTER TABLE rekapan_cairan MODIFY status_kepatuhan ENUM('PATUH', 'TIDAK_PATUH') NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE rekapan_cairan MODIFY status_kepatuhan ENUM('PATUH', 'TIDAK_PATUH') NOT NULL DEFAULT 'TIDAK_PATUH'");

        Schema::table('rekapan_cairan', function (Blueprint $table): void {
            $table->dropForeign(['pasien_id']);
            $table->dropIndex(['pasien_id']);
            $table->unique(['pasien_id', 'minggu_mulai']);
            $table->dropColumn(['tanggal', 'waktu', 'minuman', 'jumlah_ml', 'catatan_asupan']);
            $table->foreign('pasien_id')->references('id')->on('pasien')->cascadeOnDelete();
        });
    }
};
