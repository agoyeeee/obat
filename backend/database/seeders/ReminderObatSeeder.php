<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReminderObatSeeder extends Seeder
{
    public function run(): void
    {
        $reminders = [
            [
                'pasien_id' => 1, 'obat_id' => 1, 'merk_id' => 1,
                'dosis' => '5 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 30,
                'waktu_konsumsi_id' => 1, 'cara_pemakaian' => 'Diminum 1 tablet setiap pagi sesudah makan.',
                'skor_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 1, 'obat_id' => 4, 'merk_id' => 7,
                'dosis' => '20 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 30,
                'waktu_konsumsi_id' => 4, 'cara_pemakaian' => 'Diminum 1 tablet setiap malam sebelum tidur.',
                'skor_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 2, 'obat_id' => 2, 'merk_id' => 3,
                'dosis' => '500 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 60,
                'waktu_konsumsi_id' => 1, 'cara_pemakaian' => 'Diminum 1 tablet sesudah makan pagi.',
                'skor_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 2, 'obat_id' => 2, 'merk_id' => 3,
                'dosis' => '500 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 60,
                'waktu_konsumsi_id' => 3, 'cara_pemakaian' => 'Diminum 1 tablet sesudah makan sore.',
                'skor_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 3, 'obat_id' => 3, 'merk_id' => 5,
                'dosis' => '12.5 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 90,
                'waktu_konsumsi_id' => 1, 'cara_pemakaian' => 'Diminum 1 tablet 1 jam sebelum makan.',
                'skor_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 4, 'obat_id' => 1, 'merk_id' => 2,
                'dosis' => '5 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 30,
                'waktu_konsumsi_id' => 1, 'cara_pemakaian' => 'Diminum 1 tablet setiap pagi.',
                'skor_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 5, 'obat_id' => 5, 'merk_id' => 9,
                'dosis' => '40 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 30,
                'waktu_konsumsi_id' => 1, 'cara_pemakaian' => 'Diminum 1 tablet pagi hari sesudah makan.',
                'skor_kepatuhan' => 'PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'pasien_id' => 5, 'obat_id' => 3, 'merk_id' => 6,
                'dosis' => '25 mg', 'sediaan' => 'Tablet', 'jumlah_obat' => 60,
                'waktu_konsumsi_id' => 4, 'cara_pemakaian' => 'Diminum 1 tablet malam hari sebelum makan.',
                'skor_kepatuhan' => 'TIDAK_PATUH', 'created_at' => now(), 'updated_at' => now(),
            ],
        ];

        DB::table('reminder_obat')->insert($reminders);
    }
}
