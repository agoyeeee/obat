<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JawabanKuisionerSeeder extends Seeder
{
    public function run(): void
    {
        $jawabans = [
            // Rekap 1 - Pasien 1 (skor tinggi = kepatuhan baik)
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 1, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 2, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 3, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 4, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 5, 'jawaban' => 'Ya',    'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 6, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 7, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 1, 'kuisioner_id' => 8, 'jawaban' => 'Tidak pernah', 'skor' => 0, 'created_at' => now(), 'updated_at' => now()],

            // Rekap 2 - Pasien 2 (skor sedang)
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 1, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 2, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 3, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 4, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 5, 'jawaban' => 'Ya',    'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 6, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 7, 'jawaban' => 'Tidak', 'skor' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 2, 'kuisioner_id' => 8, 'jawaban' => 'Sesekali', 'skor' => 0, 'created_at' => now(), 'updated_at' => now()],

            // Rekap 3 - Pasien 3 (skor rendah = kepatuhan buruk)
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 1, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 2, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 3, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 4, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 5, 'jawaban' => 'Tidak', 'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 6, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 7, 'jawaban' => 'Ya',    'skor' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['rekap_kuisioner_id' => 3, 'kuisioner_id' => 8, 'jawaban' => 'Selalu', 'skor' => 3, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('jawaban_kuisioner')->insert($jawabans);
    }
}
