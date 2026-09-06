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
            [
                'nama_obat' => 'Hidroklorotiazid',
                'klasifikasi' => 'Diuretik thiazide',
                'indikasi' => 'Edema, Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['12.5 mg'],
                'dosis_lazim' => '12.5 mg, 25 mg, 50 mg',
                'dosis_target' => '100 mg (Hidroklorotiazid 25 mg 4 tablet)',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'Hipersensitif terhadap hidroklorotiazid, kehamilan, gangguan ginjal, gangguan hepar, hiperkalemia',
                'efek_samping' => "Sering buang air kecil/poliuria, hipotensi ortostatik, sakit kepala.\n\nCara Penanganan Efek Samping:\n1. Poliuria: Kondisi ketika tubuh memproduksi dan mengeluarkan urin secara berlebihan (> 3 liter/hari). Penanganan: Minum air putih secukupnya. Minum obat hidroklorotiazid di pagi hari.\n2. Hipotensi ortostatik: Penurunan tekanan darah tiba-tiba (sistolik turun >= 20 mmHg / diastolik turun >= 10 mmHg) dalam waktu 3 menit setelah berdiri. Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam/natrium, hindari mengubah posisi tubuh tiba-tiba dan berdiri terlalu lama.\n3. Sakit kepala:\n- Derajat 1: Nyeri tegang di kepala, aktivitas normal. Penanganan: Istirahat di tempat tenang, kompres dingin di dahi/tengkuk, cukupi cairan tubuh.\n- Derajat 2: Nyeri berdenyut/menekan, aktivitas terhambat. Penanganan: Konsumsi obat pereda nyeri jika diperlukan (seperti parasetamol).\n- Derajat 3: Nyeri sangat hebat (migrain berat/klaster), sulit bangun, mual/sensitif cahaya. Penanganan: Segera dirujuk ke rumah sakit.",
                'monitoring' => 'Pantau elektrolit serum (misalnya Na, K), tekanan darah, kreatinin. Menilai kulit untuk fotosensitifitas dan kanker kulit; ketajaman penglihatan dan nyeri mata. Dapat mempengaruhi tes fungsi paratiroid, dan hasil positif palsu Aldosteron Renin Ratio (ARR)',
                'cara_pemakaian' => 'Diminum pagi hari. Harus dikonsumsi dengan makanan. Obat ini dapat menyebabkan reaksi fotosensitifitas, hindari paparan sinar matahari langsung dan sinar UV serta gunakan tabir surya saat beraktivitas di luar ruangan.',
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
