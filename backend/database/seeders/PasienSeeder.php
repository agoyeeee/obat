<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PasienSeeder extends Seeder
{
    public function run(): void
    {
        $pasiens = [
            [
                'nama'          => 'Ahmad Fauzi',
                'usia'          => 55,
                'jenis_kelamin' => 'L',
                'berat_badan'   => 72.5,
                'tgl_diagnosa'  => '2025-06-15',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'nama'          => 'Rina Marlina',
                'usia'          => 48,
                'jenis_kelamin' => 'P',
                'berat_badan'   => 60.0,
                'tgl_diagnosa'  => '2025-08-20',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'nama'          => 'Hendra Wijaya',
                'usia'          => 63,
                'jenis_kelamin' => 'L',
                'berat_badan'   => 80.3,
                'tgl_diagnosa'  => '2025-03-10',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'nama'          => 'Sari Dewi',
                'usia'          => 35,
                'jenis_kelamin' => 'P',
                'berat_badan'   => 55.0,
                'tgl_diagnosa'  => '2025-11-05',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'nama'          => 'Bambang Supriadi',
                'usia'          => 70,
                'jenis_kelamin' => 'L',
                'berat_badan'   => 68.0,
                'tgl_diagnosa'  => '2024-12-01',
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('pasien')->insert($pasiens);
    }
}
