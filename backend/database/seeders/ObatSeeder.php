<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ObatSeeder extends Seeder
{
    public function run(): void
    {
        $obats = [
            [
                'nama_obat'        => 'Amlodipine',
                'indikasi'         => 'Hipertensi, angina pektoris stabil, angina vasospastik (Prinzmetal).',
                'dosis_inisiasi'   => json_encode(['dewasa' => '5 mg/hari', 'lansia' => '2.5 mg/hari']),
                'dosis_target'     => '10 mg/hari',
                'frekuensi_default' => 1,
                'kontraindikasi'   => 'Hipersensitivitas terhadap amlodipine atau golongan dihidropiridin lainnya.',
                'efek_samping'     => 'Edema perifer, pusing, kemerahan wajah, palpitasi.',
                'monitoring'       => 'Tekanan darah, denyut jantung, edema perifer.',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'nama_obat'        => 'Metformin',
                'indikasi'         => 'Diabetes mellitus tipe 2, terutama pada pasien dengan berat badan berlebih.',
                'dosis_inisiasi'   => json_encode(['dewasa' => '500 mg 2x/hari', 'lansia' => '500 mg 1x/hari']),
                'dosis_target'     => '2000 mg/hari',
                'frekuensi_default' => 2,
                'kontraindikasi'   => 'Gangguan ginjal berat (GFR <30), asidosis metabolik, ketoasidosis diabetik.',
                'efek_samping'     => 'Mual, diare, nyeri perut, rasa logam di mulut.',
                'monitoring'       => 'Kadar gula darah, fungsi ginjal (GFR), kadar vitamin B12.',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'nama_obat'        => 'Captopril',
                'indikasi'         => 'Hipertensi, gagal jantung kongestif, nefropati diabetik.',
                'dosis_inisiasi'   => json_encode(['dewasa' => '12.5 mg 2-3x/hari', 'lansia' => '6.25 mg 2x/hari']),
                'dosis_target'     => '150 mg/hari',
                'frekuensi_default' => 3,
                'kontraindikasi'   => 'Riwayat angioedema, kehamilan, stenosis arteri renalis bilateral.',
                'efek_samping'     => 'Batuk kering, hipotensi, pusing, gangguan pengecapan.',
                'monitoring'       => 'Tekanan darah, fungsi ginjal, kadar kalium serum.',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'nama_obat'        => 'Simvastatin',
                'indikasi'         => 'Hiperkolesterolemia, pencegahan penyakit kardiovaskular.',
                'dosis_inisiasi'   => json_encode(['dewasa' => '20 mg/hari', 'lansia' => '10 mg/hari']),
                'dosis_target'     => '40 mg/hari',
                'frekuensi_default' => 1,
                'kontraindikasi'   => 'Penyakit hati aktif, kehamilan, menyusui.',
                'efek_samping'     => 'Mialgia, nyeri perut, peningkatan enzim hati, rhabdomyolysis (jarang).',
                'monitoring'       => 'Profil lipid, fungsi hati (ALT/AST), gejala miopati.',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'nama_obat'        => 'Furosemide',
                'indikasi'         => 'Edema terkait gagal jantung kongestif, sirosis hati, penyakit ginjal.',
                'dosis_inisiasi'   => json_encode(['dewasa' => '20-40 mg/hari', 'lansia' => '20 mg/hari']),
                'dosis_target'     => '80 mg/hari',
                'frekuensi_default' => 1,
                'kontraindikasi'   => 'Anuria, hipersensitivitas terhadap furosemide, dehidrasi berat.',
                'efek_samping'     => 'Hipokalemia, dehidrasi, hipotensi ortostatik, hiperurisemia.',
                'monitoring'       => 'Elektrolit (kalium, natrium), fungsi ginjal, tekanan darah, berat badan.',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ];

        DB::table('obat')->insert($obats);
    }
}
