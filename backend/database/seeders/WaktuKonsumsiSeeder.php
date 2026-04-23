<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WaktuKonsumsiSeeder extends Seeder
{
    public function run(): void
    {
        $waktus = [
            [
                'label_waktu' => 'Pagi',
                'jam'         => '07:00:00',
                'frekuensi'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'label_waktu' => 'Siang',
                'jam'         => '12:00:00',
                'frekuensi'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'label_waktu' => 'Sore',
                'jam'         => '17:00:00',
                'frekuensi'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'label_waktu' => 'Malam',
                'jam'         => '20:00:00',
                'frekuensi'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'label_waktu' => 'Sebelum Tidur',
                'jam'         => '22:00:00',
                'frekuensi'   => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('waktu_konsumsi')->insert($waktus);
    }
}
