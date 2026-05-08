<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminder_obat', function (Blueprint $table): void {
            if (!Schema::hasColumn('reminder_obat', 'jumlah_per_minum')) {
                $table->integer('jumlah_per_minum')->default(1)->after('jumlah_obat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reminder_obat', function (Blueprint $table): void {
            if (Schema::hasColumn('reminder_obat', 'jumlah_per_minum')) {
                $table->dropColumn('jumlah_per_minum');
            }
        });
    }
};
