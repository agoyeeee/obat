<?php

namespace Database\Seeders;

use App\Models\Obat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ObatSeeder extends Seeder
{
    public function run(): void
    {
        $obats = [
            [
                'nama_obat' => 'Captopril',
                'klasifikasi' => 'Angiotensi Converting Enzim Inhibitor (ACE inhibitor)',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, pasca infark miokard',
                'dosis_inisiasi' => ['6.25 mg'],
                'dosis_lazim' => null,
                'dosis_target' => '50 mg',
                'frekuensi_default' => 3,
                'frekuensi_keterangan' => '3 x sehari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat captopril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Insufisiensi ginjal, hiperkalemia, neutropenia, trombositopenia, anemia, angiodema pada wajah',
                'monitoring' => 'Pantau tekanan darah, elektrolit, fungsi ginjal (misalnya serum kreatinin dan BUN)',
                'cara_pemakaian' => 'Dikonsumsi saat perut kosong/sebelum makan (1 jam sebelum makan) -> dibuat video',
            ],
            [
                'nama_obat' => 'Lisinopril',
                'klasifikasi' => 'Angiotensi Converting Enzim Inhibitor (ACE inhibitor)',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, infark miokard akut',
                'dosis_inisiasi' => ['10 mg'],
                'dosis_lazim' => null,
                'dosis_target' => '40 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat lisinopril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Hipotensi simtomatik dengan atau tanpa sinkop; efek hematologis (misalnya neutropenia atau agranulositosis, anemia, trombositopenia), batuk, hiperkalemia, ikterus kolestatik.',
                'monitoring' => 'Pantau tekanan darah, denyut jantung, BUN, CBC dengan diferensial, LFT, K serum, dan kadar kreatinin. Kaji tanda-tanda angioedema, penyakit kuning, atau gagal hati.',
                'cara_pemakaian' => 'Dapat diminum dengan atau tanpa makanan.',
            ],
            [
                // Dokumen menulis "Rampiril"; nama generik dinormalisasi menjadi "Ramipril".
                'nama_obat' => 'Ramipril',
                'klasifikasi' => 'Angiotensi Converting Enzim Inhibitor (ACE inhibitor)',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, Diabetik nefropati',
                'dosis_inisiasi' => ['2.5 mg'],
                'dosis_lazim' => '2,5 mg, 5 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat lisinopril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Angioedema (misalnya angioedema kepala dan leher, angioedema usus), hiperkalemia, hipotensi (dengan atau tanpa sinkop, ortostatik), ikterus kolestatik, sindrom hormon antidiuretik yang tidak sesuai (SIADH), hiponatremia; jarang, efek hematologi (misalnya neutropenia atau agranulositosis, trombositopenia, anemia); batuk, gangguan ginjal dan/atau peningkatan kreatinin serum, reaksi anafilaktoid/anafilaksis.',
                'monitoring' => 'Evaluasi fungsi ginjal dan elektrolit sebelum dan selama pengobatan. Pantau tekanan darah, BUN, kreatinin serum, kadar K dan kadar Na; CBC dengan diferensial. Pantau tanda-tanda angioedema. Kaji status kehamilan sebelum terapi.',
                'cara_pemakaian' => 'Dapat diminum dengan atau tanpa makanan.',
            ],
            [
                'nama_obat' => 'Sacubitril-Valsartan',
                'klasifikasi' => 'Angiotensi Receptor Nephrysillin Inhibitor (ARNI)',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, infark miokard akut',
                'dosis_inisiasi' => null,
                'dosis_lazim' => null,
                'dosis_target' => null,
                'frekuensi_default' => null,
                'frekuensi_keterangan' => null,
                'kontraindikasi' => null,
                'efek_samping' => null,
                'monitoring' => 'Pantau tekanan darah, denyut jantung, BUN, CBC dengan diferensial, LFT, K serum, dan kadar kreatinin. Kaji tanda-tanda angioedema, penyakit kuning, atau gagal hati.',
                'cara_pemakaian' => null,
            ],
            [
                'nama_obat' => 'Candesartan',
                'klasifikasi' => 'Angiotensi Reseptor Block (ARB)',
                'indikasi' => 'Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['4-8 mg'],
                'dosis_lazim' => null,
                'dosis_target' => '32 mg',
                // Dokumen mencantumkan rentang 1-2 kali sehari, bukan satu nilai default.
                'frekuensi_default' => null,
                'frekuensi_keterangan' => '1 - 2 x sehari',
                'kontraindikasi' => 'Kehamilan dan menyusui, gangguan hati berat, serta kombinasi dengan aliskiren',
                'efek_samping' => 'Angiodema, hipotensi hiperkalemia, gangguan ginjal',
                'monitoring' => 'Pantau tekanan darah, elektrolit, fungsi ginjal (misalnya serum kreatinin dan BUN), urinalisis, tanda dan gejala hipotensi, takikardia, serta tanda-tanda angiodema.',
                'cara_pemakaian' => 'Dapat dikonsumsi dengan atau tanpa makanan',
            ],
            [
                'nama_obat' => 'Valsartan',
                'klasifikasi' => 'Angiotensi Reseptor Block (ARB)',
                'indikasi' => 'Gagal jantung, Hipertensi',
                'dosis_inisiasi' => ['40 mg'],
                'dosis_lazim' => null,
                'dosis_target' => '160 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari',
                'kontraindikasi' => 'Kehamilan, gangguan hati berat, serta penggunaan bersamaan dengan aliskiren pada pasien diabetes',
                'efek_samping' => 'Cedera ginjal akut, peningkatan kreatinin serum, hiperkalemia, hipotensi, angioedema.',
                'monitoring' => 'Pantau tekanan darah, elektrolit (misalnya kadar K serum), dan fungsi ginjal secara teratur selama terapi. Kaji tanda-tanda angioedema.',
                'cara_pemakaian' => 'Dapat diminum dengan atau tanpa makanan.',
            ],
        ];

        DB::transaction(function () use ($obats): void {
            foreach ($obats as $data) {
                Obat::query()->updateOrCreate(
                    ['nama_obat' => $data['nama_obat']],
                    $data,
                );
            }
        });
    }
}
