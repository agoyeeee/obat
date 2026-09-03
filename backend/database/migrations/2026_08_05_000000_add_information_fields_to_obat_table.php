<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('obat', function (Blueprint $table): void {
            if (!Schema::hasColumn('obat', 'klasifikasi')) {
                $table->text('klasifikasi')->nullable()->after('nama_obat');
            }

            if (!Schema::hasColumn('obat', 'dosis_lazim')) {
                $table->text('dosis_lazim')->nullable()->after('dosis_inisiasi');
            }

            if (!Schema::hasColumn('obat', 'frekuensi_keterangan')) {
                $table->string('frekuensi_keterangan')->nullable()->after('frekuensi_default');
            }

            $table->string('dosis_target')->nullable()->change();
            $table->integer('frekuensi_default')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('obat', function (Blueprint $table): void {
            if (Schema::hasColumn('obat', 'frekuensi_keterangan')) {
                $table->dropColumn('frekuensi_keterangan');
            }

            if (Schema::hasColumn('obat', 'dosis_lazim')) {
                $table->dropColumn('dosis_lazim');
            }

            if (Schema::hasColumn('obat', 'klasifikasi')) {
                $table->dropColumn('klasifikasi');
            }

            $table->string('dosis_target')->nullable(false)->change();
            $table->integer('frekuensi_default')->nullable(false)->change();
        });
    }
};
