<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            $table->json('tahap_1_identitas')->nullable()->after('total_skor');
            $table->json('tahap_2_riwayat')->nullable()->after('tahap_1_identitas');
            $table->json('tahap_3_efek_samping')->nullable()->after('tahap_2_riwayat');
        });
    }

    public function down(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            $table->dropColumn([
                'tahap_1_identitas',
                'tahap_2_riwayat',
                'tahap_3_efek_samping',
            ]);
        });
    }
};
