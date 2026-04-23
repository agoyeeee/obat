<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MerkSeeder extends Seeder
{
    public function run(): void
    {
        $merks = [
            // Merk untuk Amlodipine (obat_id = 1)
            ['nama_merk' => 'Norvasc',    'obat_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['nama_merk' => 'Tensivask',  'obat_id' => 1, 'created_at' => now(), 'updated_at' => now()],

            // Merk untuk Metformin (obat_id = 2)
            ['nama_merk' => 'Glucophage', 'obat_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['nama_merk' => 'Diabex',     'obat_id' => 2, 'created_at' => now(), 'updated_at' => now()],

            // Merk untuk Captopril (obat_id = 3)
            ['nama_merk' => 'Capoten',    'obat_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['nama_merk' => 'Farmoten',   'obat_id' => 3, 'created_at' => now(), 'updated_at' => now()],

            // Merk untuk Simvastatin (obat_id = 4)
            ['nama_merk' => 'Zocor',      'obat_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['nama_merk' => 'Lipinorm',   'obat_id' => 4, 'created_at' => now(), 'updated_at' => now()],

            // Merk untuk Furosemide (obat_id = 5)
            ['nama_merk' => 'Lasix',      'obat_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['nama_merk' => 'Farsix',     'obat_id' => 5, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('merk')->insert($merks);
    }
}
