<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Urutan seeder disesuaikan dengan dependensi foreign key antar tabel.
     */
    public function run(): void
    {
        $this->call([
            // Master data yang aman untuk database fresh/production.
            // Data demo akun, pasien, reminder, log, dan rekap tidak dijalankan otomatis.
            ObatSeeder::class,
            MerkSeeder::class,
            WaktuKonsumsiSeeder::class,
            KuisionerSeeder::class,
        ]);
    }
}
