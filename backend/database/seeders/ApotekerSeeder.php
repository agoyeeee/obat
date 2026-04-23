<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ApotekerSeeder extends Seeder
{
    public function run(): void
    {
        $apotekers = [
            [
                'nama'       => 'Siti Rahmawati',
                'no_hp'      => '081234567890',
                'password'   => Hash::make('coba'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama'       => 'Budi Santoso',
                'no_hp'      => '081234567891',
                'password'   => Hash::make('coba'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama'       => 'Dewi Lestari',
                'no_hp'      => '081234567892',
                'password'   => Hash::make('coba'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('apoteker')->insert($apotekers);
    }
}
