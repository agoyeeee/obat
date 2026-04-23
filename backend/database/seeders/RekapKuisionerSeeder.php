<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RekapKuisionerSeeder extends Seeder
{
    public function run(): void
    {
        $rekaps = [
            ['pasien_id' => 1, 'tanggal' => '2026-04-20', 'total_skor' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'tanggal' => '2026-04-20', 'total_skor' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'tanggal' => '2026-04-20', 'total_skor' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 4, 'tanggal' => '2026-04-22', 'total_skor' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'tanggal' => '2026-04-21', 'total_skor' => 4, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('rekap_kuisioner')->insert($rekaps);
    }
}
