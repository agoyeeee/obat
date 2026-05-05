<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pasien', function (Blueprint $table): void {
            $table->date('tgl_lahir')->nullable()->after('berat_badan');
            $table->string('status_pernikahan')->nullable()->after('tgl_lahir');
            $table->string('suku')->nullable()->after('status_pernikahan');
            $table->string('pendidikan')->nullable()->after('suku');
            $table->string('pekerjaan')->nullable()->after('pendidikan');
            $table->string('nomor_hp', 30)->nullable()->after('pekerjaan');
            $table->string('pendapatan')->nullable()->after('nomor_hp');
        });
    }

    public function down(): void
    {
        Schema::table('pasien', function (Blueprint $table): void {
            $table->dropColumn([
                'tgl_lahir',
                'status_pernikahan',
                'suku',
                'pendidikan',
                'pekerjaan',
                'nomor_hp',
                'pendapatan',
            ]);
        });
    }
};
