<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KuisionerSeeder extends Seeder
{
    public function run(): void
    {
        $kuisioners = [
            [
                'pertanyaan' => 'Apakah Anda pernah lupa minum obat?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Selain lupa, apakah ada hari di mana Anda tidak minum obat?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Apakah Anda pernah mengurangi atau berhenti minum obat tanpa konsultasi dokter karena merasa lebih buruk saat meminumnya?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Saat bepergian atau meninggalkan rumah, apakah Anda pernah lupa membawa obat?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Apakah Anda minum obat kemarin?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Saat merasa kondisi kesehatan Anda sudah terkontrol, apakah Anda pernah berhenti minum obat?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Apakah Anda merasa terganggu harus minum obat setiap hari?',
                'tipe'       => 'ya_tidak',
                'opsi'       => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pertanyaan' => 'Seberapa sering Anda kesulitan mengingat untuk minum semua obat Anda?',
                'tipe'       => 'skala',
                'opsi'       => json_encode([
                    'Tidak pernah',
                    'Sesekali',
                    'Kadang-kadang',
                    'Sering',
                    'Selalu',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('kuisioner')->insert($kuisioners);
    }
}
