<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // add cara_pemakaian to obat
        Schema::table('obat', function (Blueprint $table): void {
            if (!Schema::hasColumn('obat', 'cara_pemakaian')) {
                $table->text('cara_pemakaian')->nullable()->after('monitoring');
            }
        });

        // migrate existing cara_pemakaian values from reminders into obat (take first non-null per obat)
        try {
            \DB::statement(<<<'SQL'
                UPDATE obat
                SET cara_pemakaian = sub.cara
                FROM (
                    SELECT obat_id, MIN(cara_pemakaian) AS cara
                    FROM reminder_obat
                    WHERE cara_pemakaian IS NOT NULL AND cara_pemakaian <> ''
                    GROUP BY obat_id
                ) AS sub
                WHERE obat.id = sub.obat_id
            SQL
            );
        } catch (\Exception $e) {
            // ignore if DB doesn't support the above statement; try PHP approach
            try {
                $rows = \DB::table('reminder_obat')->select('obat_id', 'cara_pemakaian')->whereNotNull('cara_pemakaian')->get();
                $map = [];
                foreach ($rows as $r) {
                    if (empty($map[$r->obat_id]) && !empty($r->cara_pemakaian)) {
                        $map[$r->obat_id] = $r->cara_pemakaian;
                    }
                }
                foreach ($map as $obatId => $cara) {
                    \DB::table('obat')->where('id', $obatId)->update(['cara_pemakaian' => $cara]);
                }
            } catch (\Exception $e) {
                // last resort: skip migrating values
            }
        }

        // remove cara_pemakaian from reminder_obat if exists
        Schema::table('reminder_obat', function (Blueprint $table): void {
            if (Schema::hasColumn('reminder_obat', 'cara_pemakaian')) {
                $table->dropColumn('cara_pemakaian');
            }
        });
    }

    public function down(): void
    {
        // revert: add cara_pemakaian back to reminder_obat and drop from obat
        Schema::table('reminder_obat', function (Blueprint $table): void {
            if (!Schema::hasColumn('reminder_obat', 'cara_pemakaian')) {
                $table->text('cara_pemakaian')->nullable()->after('waktu_konsumsi_id');
            }
        });

        Schema::table('obat', function (Blueprint $table): void {
            if (Schema::hasColumn('obat', 'cara_pemakaian')) {
                $table->dropColumn('cara_pemakaian');
            }
        });
    }
};
