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
                'nama'       => 'apt. Meta Kartika Untari, M.Sc.',
                'no_hp'      => '081329005000',
                'password'   => Hash::make('coba'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('apoteker')->insert($apotekers);
    }
}
