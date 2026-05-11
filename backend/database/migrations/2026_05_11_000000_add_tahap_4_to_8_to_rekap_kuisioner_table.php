<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            $table->json('tahap_4_kepatuhan')->nullable()->after('tahap_3_efek_samping');
            $table->json('tahap_5_efikasi')->nullable()->after('tahap_4_kepatuhan');
            $table->json('tahap_6_pengetahuan')->nullable()->after('tahap_5_efikasi');
            $table->json('tahap_7_kualitas_hidup')->nullable()->after('tahap_6_pengetahuan');
            $table->json('tahap_8_kccq')->nullable()->after('tahap_7_kualitas_hidup');
        });
    }

    public function down(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            $table->dropColumn([
                'tahap_4_kepatuhan',
                'tahap_5_efikasi',
                'tahap_6_pengetahuan',
                'tahap_7_kualitas_hidup',
                'tahap_8_kccq',
            ]);
        });
    }
};
