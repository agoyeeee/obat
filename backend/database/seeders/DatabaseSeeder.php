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
            // Tabel master (tanpa dependensi)
            ApotekerSeeder::class,
            PasienSeeder::class,
            ObatSeeder::class,
            WaktuKonsumsiSeeder::class,
            KuisionerSeeder::class,

            // Tabel relasi (bergantung pada tabel master)
            KontakPasienSeeder::class,
            MerkSeeder::class,

            // Tabel transaksi (bergantung pada tabel relasi)
            ReminderObatSeeder::class,
            ReminderCairanSeeder::class,
            RekapKuisionerSeeder::class,
            JawabanKuisionerSeeder::class,
            LogKonsumsiObatSeeder::class,
            LogKonsumsiCairanSeeder::class,
        ]);
    }
}
