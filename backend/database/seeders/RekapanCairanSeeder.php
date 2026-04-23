<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RekapanCairanSeeder extends Seeder
{
    public function run(): void
    {
        $rekapans = [
            // Minggu 1 (14 Apr - 20 Apr 2026)
            ['pasien_id' => 1, 'minggu_mulai' => '2026-04-14', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'minggu_mulai' => '2026-04-14', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'minggu_mulai' => '2026-04-14', 'status_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 4, 'minggu_mulai' => '2026-04-14', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'minggu_mulai' => '2026-04-14', 'status_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now()],

            // Minggu 2 (21 Apr - 27 Apr 2026)
            ['pasien_id' => 1, 'minggu_mulai' => '2026-04-21', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'minggu_mulai' => '2026-04-21', 'status_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'minggu_mulai' => '2026-04-21', 'status_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 4, 'minggu_mulai' => '2026-04-21', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'minggu_mulai' => '2026-04-21', 'status_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('rekapan_cairan')->insert($rekapans);
    }
}
