<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            // Drop existing columns
            $table->dropColumn([
                'tahap_6_pengetahuan',
                'tahap_7_kualitas_hidup',
                'tahap_8_kccq',
            ]);
        });

        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            // Add with new names (renumbered)
            $table->json('tahap_6_kualitas_hidup')->nullable()->after('tahap_5_efikasi');
            $table->json('tahap_7_kccq')->nullable()->after('tahap_6_kualitas_hidup');
        });
    }

    public function down(): void
    {
        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            $table->dropColumn([
                'tahap_6_kualitas_hidup',
                'tahap_7_kccq',
            ]);
        });

        Schema::table('rekap_kuisioner', function (Blueprint $table): void {
            // Restore old structure
            $table->json('tahap_6_pengetahuan')->nullable()->after('tahap_5_efikasi');
            $table->json('tahap_7_kualitas_hidup')->nullable()->after('tahap_6_pengetahuan');
            $table->json('tahap_8_kccq')->nullable()->after('tahap_7_kualitas_hidup');
        });
    }
};
