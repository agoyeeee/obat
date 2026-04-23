<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KontakPasienSeeder extends Seeder
{
    public function run(): void
    {
        $kontaks = [
            // Apoteker 1 menangani pasien 1, 2, 3
            ['pasien_id' => 1, 'apoteker_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'apoteker_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'apoteker_id' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Apoteker 2 menangani pasien 3, 4
            ['pasien_id' => 3, 'apoteker_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 4, 'apoteker_id' => 2, 'created_at' => now(), 'updated_at' => now()],

            // Apoteker 3 menangani pasien 4, 5
            ['pasien_id' => 4, 'apoteker_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'apoteker_id' => 3, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('kontak_pasien')->insert($kontaks);
    }
}
