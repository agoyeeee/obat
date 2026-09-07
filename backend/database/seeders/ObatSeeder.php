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
                'klasifikasi' => 'Penghambat Enzim Pengubah Angiotensin',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, pasca infark miokard',
                'dosis_inisiasi' => ['12.5 mg', '25 mg', '50 mg'],
                'dosis_lazim' => '12.5 mg, 25 mg, 50 mg',
                'dosis_target' => '50 mg',
                'frekuensi_default' => 3,
                'frekuensi_keterangan' => '3 x sehari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat captopril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Batuk kering, pusing atau sakit kepala, Hipotensi: Tekanan darah turun secara drastic, Ruam kulit terkadang disertai rasa gatal, anemia, angiodema pada wajah

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Batuk kering :  Batuk yang tidak mengeluarkan dahak, rasa gatal atau iritasi di tenggorokan yang memicu refleks batuk terus-menerus.
   • Ringan : Batuk sesekali, tenggorokan hanya terasa sedikit gatal atau menggelitik.: Tidak memerlukan intervensi
   • Sedang : Batuk terjadi dalam rangkaian pendek (frequent cough) dan dada mulai terasa agak kencang.: Hubungi apoteker. Jika di rumah tersedia antitusif, seperti dekstrometorpan dapat digunakan.
   • Berat : Batuk menggonggong atau terjadi terus-menerus tanpa henti (paroksismal) hingga memicu mual, nyeri otot dada, atau sakit kepala.: Dirujuk ke dokter

3. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dirujuk ke dokter.

4. Anemia : kondisi ketika jumlah sel darah merah dalam tubuh rendah dan tidak berfungsi dengan baik. Kondisi ini membuat tubuh tidak mendapat cukup oksigen sehingga kulit akan terlihat lebih pucat dan tubuh terasa mudah lelah.
   Penanganan: Dirujuk ke dokter

5. Ruam Kulit : Terjadi perubahan pada warna, tekstur atau bentuk permukaan kulit yang terlihat kemerahan, meradang, merata atau menonjol. Kondisi ini sering terasa gatal, kering, nyeri, atau bersisik.
   • Derajat 1 : Ruam bersifat lokal, mengenai kurang dari 10% luas permukaan tubuh, dengan kemerahan minimal dan gatal ringan tanpa disertai luka terbuka: Gunakan pelembap bebas pewangi (seperti losion calamine atau aloe vera)
   • Derajat 2 : Ruam mencakup 10% hingga 50% area tubuh, warna kulit merah jelas, mulai muncul bintik-bintik menonjol (papul), dan memicu rasa gatal yang mengganggu aktivitas: Konsumsi obat antihistamin yang dijual bebas seperti loratadine untuk meredakan gatal. Dan gunakan krim hidrokortison 1% atau krim anti-inflamasi sesuai petunjuk untuk mengurangi radang.
   • Derajat 3 : Ruam meluas hingga lebih dari 50% area tubuh, berwarna merah tua atau keunguan, disertai pelepuhan, kulit mengelupas, atau luka terbuka yang rentan infeksi sekunder: Dirujuk ke rumah sakit
   • Derajat 4 : Ruam parah berskala luas yang disertai dengan kematian jaringan kulit (nekrosis), lepuhan masif di seluruh tubuh dan mukosa (mulut/mata), serta kegagalan fungsi organ
   • Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dirujuk ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, elektrolit, fungsi ginjal, ( mis serum kreatinin)',
                'cara_pemakaian' => 'Diminum pada pagi, siang, dan malam setiap 8 jam. Dikonsumsi saat perut kosong/sebelum makan (1 jam sebelum makan)',
            ],            [
                'nama_obat' => 'Lisinopril',
                'klasifikasi' => 'Penghambat Enzim Pengubah Angiotensin',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, infark miokard akut',
                'dosis_inisiasi' => ['5 mg', '10 mg'],
                'dosis_lazim' => '5 mg, 10 mg',
                'dosis_target' => '40 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari malam hari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat lisinopril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Hipotensi, Batuk kering, Pusing/Sakit kepala, mual, muntah, Rasa lemas yang tidak biasa saat awal terapi, Angioedema

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Batuk kering :  Batuk yang tidak mengeluarkan dahak, rasa gatal atau iritasi di tenggorokan yang memicu refleks batuk terus-menerus.
   • Ringan : Batuk sesekali, tenggorokan hanya terasa sedikit gatal atau menggelitik.: Tidak memerlukan intervensi
   • Sedang : Batuk terjadi dalam rangkaian pendek (frequent cough) dan dada mulai terasa agak kencang.: Hubungi apoteker. Jika di rumah tersedia antitusif, seperti dekstrometorpan dapat digunakan.
   • Berat : Batuk menggonggong atau terjadi terus-menerus tanpa henti (paroksismal) hingga memicu mual, nyeri otot dada, atau sakit kepala.: Dirujuk ke dokter

3. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dirujuk ke dokter.

4. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dirujuk ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit

5. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

6. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, denyut jantung, BUN, CBC dengan diferensial, LFT, K serum, dan kadar kreatinin. Kaji tanda-tanda angioedema, penyakit kuning, atau gagal hati.',
                'cara_pemakaian' => 'Diminum malam hari. Dapat diminum dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Enalapril',
                'klasifikasi' => 'Penghambat Enzim Pengubah Angiotensin',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, infark miokard akut',
                'dosis_inisiasi' => ['5 mg', '10 mg'],
                'dosis_lazim' => '5 mg, 10 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari pagi dan malam hari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat enalapril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Hipotensi, Batuk kering, Pusing/Sakit kepala, mual, muntah, Rasa lemas yang tidak biasa saat awal terapi, Angioedema

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Batuk kering :  Batuk yang tidak mengeluarkan dahak, rasa gatal atau iritasi di tenggorokan yang memicu refleks batuk terus-menerus.
   • Ringan : Batuk sesekali, tenggorokan hanya terasa sedikit gatal atau menggelitik.: Tidak memerlukan intervensi
   • Sedang : Batuk terjadi dalam rangkaian pendek (frequent cough) dan dada mulai terasa agak kencang.: Hubungi apoteker. Jika di rumah tersedia antitusif, seperti dekstrometorpan dapat digunakan.
   • Berat : Batuk menggonggong atau terjadi terus-menerus tanpa henti (paroksismal) hingga memicu mual, nyeri otot dada, atau sakit kepala.: Dikonsultasikan ke dokter

3. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dikonsultasikan ke dokter.

4. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dikonsultasikan ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit

5. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi. Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

6. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, denyut jantung, serum kreatinin, K serum. Kaji tanda-tanda angioedema, penyakit kuning, atau gagal hati.',
                'cara_pemakaian' => 'Diminum pagi dan malam hari. Dapat diminum sesudah makan.',
            ],            [
                'nama_obat' => 'Ramipril',
                'klasifikasi' => 'Penghambat Enzim Pengubah Angiotensin',
                'indikasi' => 'Hipertensi, gagal jantung kongestif, Diabetik nefropati',
                'dosis_inisiasi' => ['2.5 mg', '5 mg', '10 mg'],
                'dosis_lazim' => '2.5 mg, 5 mg, 10 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => null,
                'frekuensi_keterangan' => 'Dosis inisiasi: 1 x sehari malam hari; dosis target: 2 x sehari pagi dan malam hari',
                'kontraindikasi' => 'Kehamilan, sedang meminum obat yang mengandung aliskiren dan sacubitril, alergi terhadap obat ramipril atau obat golongan ACE Inhibitor lainnya.',
                'efek_samping' => 'Hipotensi, Batuk kering, Pusing/Sakit kepala, Angioedema

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Batuk kering :  Batuk yang tidak mengeluarkan dahak, rasa gatal atau iritasi di tenggorokan yang memicu refleks batuk terus-menerus.
   • Ringan : Batuk sesekali, tenggorokan hanya terasa sedikit gatal atau menggelitik.: Tidak memerlukan intervensi
   • Sedang : Batuk terjadi dalam rangkaian pendek (frequent cough) dan dada mulai terasa agak kencang.: Hubungi apoteker. Jika di rumah tersedia antitusif, seperti dekstrometorpan dapat digunakan.
   • Berat : Batuk menggonggong atau terjadi terus-menerus tanpa henti (paroksismal) hingga memicu mual, nyeri otot dada, atau sakit kepala.: Dikonsultasikan ke dokter

3. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dikonsultasikan ke dokter.

4. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dikonsultasikan ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit',
                'monitoring' => 'Evaluasi fungsi ginjal dan elektrolit sebelum dan selama pengobatan. Pantau tekanan darah, kreatinin serum, kadar K dan kadar Na; CBC dengan diferensial. Pantau tanda-tanda angioedema. Kaji status kehamilan sebelum terapi.',
                'cara_pemakaian' => 'Diminum pagi dan malam hari. Dapat diminum dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Perindopril',
                'klasifikasi' => 'Penghambat Enzim Pengubah Angiotensin',
                'indikasi' => 'Gagal jantung dengan fraksi ejeksi rendah (HFrEF)',
                'dosis_inisiasi' => ['2 mg'],
                'dosis_lazim' => null,
                'dosis_target' => '8 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari',
                'kontraindikasi' => null,
                'efek_samping' => null,
                'monitoring' => null,
                'cara_pemakaian' => null,
            ],            [
                'nama_obat' => 'Sacubitril-Valsartan',
                'klasifikasi' => 'Penghambat Nephrysillin di Reseptor Angiotensin',
                'indikasi' => 'gagal jantung kronik',
                'dosis_inisiasi' => ['50 mg', '100 mg', '200 mg'],
                'dosis_lazim' => '50 mg, 100 mg, 200 mg',
                'dosis_target' => '200 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari',
                'kontraindikasi' => 'alergi terhadap sacubitril-valsartan, kehamilan, Riwayat angioedema, penggunaan Bersama ACE Inhibitor',
                'efek_samping' => 'Hipotensi, batuk, angioedema

Cara Penanganan Efek Samping:
1. Batuk kering :  Batuk yang tidak mengeluarkan dahak, rasa gatal atau iritasi di tenggorokan yang memicu refleks batuk terus-menerus.
   • Ringan : Batuk sesekali, tenggorokan hanya terasa sedikit gatal atau menggelitik.: Tidak memerlukan intervensi
   • Sedang : Batuk terjadi dalam rangkaian pendek (frequent cough) dan dada mulai terasa agak kencang.: Hubungi apoteker. Jika di rumah tersedia antitusif, seperti dekstrometorpan dapat digunakan.
   • Berat : Batuk menggonggong atau terjadi terus-menerus tanpa henti (paroksismal) hingga memicu mual, nyeri otot dada, atau sakit kepala.: Dikonsultasikan ke dokter

2. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dikonsultasikan ke dokter.

3. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dikonsultasikan ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, denyut jantung, K serum, dan kadar kreatinin. Kaji tanda-tanda angioedema, penyakit kuning, atau gagal hati.',
                'cara_pemakaian' => 'Diminum pagi hari dan malam hari. Dapat diminum dengan atau tanpa makanan.
Jika sebelumnya Anda meminum obat golongan ACE inhibitor, wajib menunggu minimal 36 jam sebelum mulai meminum sacubitril-valsartan guna mencegah risiko pembengkakan berbahaya (angioedema).',
            ],            [
                'nama_obat' => 'Candesartan',
                'klasifikasi' => 'Penyekat Reseptor Angiotensin',
                'indikasi' => 'Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['4 mg', '8 mg', '16 mg'],
                'dosis_lazim' => '4 mg, 8 mg, 16 mg',
                'dosis_target' => '32 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari malam hari',
                'kontraindikasi' => 'Kehamilan dan menyusui, gangguan hati berat, serta kombinasi dengan aliskiren',
                'efek_samping' => 'Pusing, sakit kepala, kelelahan, mual, angiodema, hipotensi

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit. Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

3. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dikonsultasikan ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit

4. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dikonsultasikan ke dokter.',
                'monitoring' => 'Pantau tekanan darah, elektrolit, fungsi ginjal, ( mis serum kreatinin, BUN), urinalisis, tanda dan gejala hipotensi, takikardia, tanda- tanda angiodema.',
                'cara_pemakaian' => 'Diminum malam hari.  Dapat dikonsumsi dengan atau tanpa makanan',
            ],            [
                'nama_obat' => 'Valsartan',
                'klasifikasi' => 'Penyekat Reseptor Angiotensin',
                'indikasi' => 'Gagal jantung, Hipertensi',
                'dosis_inisiasi' => ['80 mg', '160 mg'],
                'dosis_lazim' => '80 mg, 160 mg',
                'dosis_target' => '160 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari',
                'kontraindikasi' => 'kehamilan, gangguan hati berat, serta penggunaan bersamaan dengan aliskiren pada pasien diabetes',
                'efek_samping' => 'Sakit kepala, hipotensi, angioedema.

Cara Penanganan Efek Samping:
1. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

2. Angiodema : kondisi pembengkakan mendadak yang terjadi pada lapisan kulit yang lebih dalam, paling sering di area wajah seperti bibir, kelopak mata, atau lidah.
   • Derajat ringan : Pembengkakan bersifat lokal dan terbatas pada area luar wajah yang tidak mengganggu fungsi vital: Melakukan kompres dingin pada wajah yang bengkak, Konsumsi obat antihistamin yang dijual bebas seperti loratadine
   • Derajat sedang : Pembengkakan mulai meluas ke jaringan mukosa mulut yang lebih dalam: Dikonsultasikan ke dokter
   • Derajat berat : Pembengkakan telah mencapai saluran pernapasan atas dan merupakan kondisi  kegawatdaruratan medis.: Dirujuk ke rumah sakit

3. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dikonsultasikan ke dokter.',
                'monitoring' => 'Pantau tekanan darah, elektrolit (misalnya kadar K serum), dan fungsi ginjal secara teratur selama terapi. Kaji tanda-tanda angioedema.',
                'cara_pemakaian' => 'Diminum pada pagi dan malam hari. Dapat diminum dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Bisoprolol',
                'klasifikasi' => 'Selective Beta blcoker',
                'indikasi' => 'Gagal jantung kronis',
                'dosis_inisiasi' => ['1.25 mg', '2.5 mg', '5 mg', '10 mg'],
                'dosis_lazim' => '1.25 mg, 2.5 mg, 5 mg, 10 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'denyut jantung lambat di bawah 50 kali per menit, tekanan darah sangat rendah atau hipotensi, syok kardiogenik, gagal jantung akut, asma berat, serta blok jantung derajat dua atau tiga',
                'efek_samping' => 'Bradikardia (denyut jantung melambat secara ekstrem), pusing, sakit kepala, dan kelelahan, gangguan pencernaan (seperti mual, muntah, diare, atau sembelit), tangan dan kaki terasa dingin, pembengkakan pada kaki atau tangan

Cara Penanganan Efek Samping:
1. Bradikardia : kondisi ketika jantung berdetak lebih lambat daripada detak normal. Detak jantung normal pada orang dewasa adalah sekitar 60–100 detak per menit. Detak jantung normal pada orang yang sedang tidur atau istirahat berkisar antara 40–60 detak per menit.
   • Derajat I : tidak bergejala, sering tidak disadari, dan detak jantung sering kali masih dalam batas normal atau sedikit di bawah normal: Tidak memerlukan intervensi, pantau denyut jantung dan konsultasikan ke dokter
   • Derajat II : Dapat menimbulkan gejala seperti pusing, lemas, atau rasa tidak beraturan pada denyut jantung: Dirujuk ke rumah sakit
   • Derajat III : Merupakan kondisi paling berbahaya yang sering memicu sesak napas, nyeri dada, pusing berat, hingga pingsan (sinkop): Dirujuk ke rumah sakit

2. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

3. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit. Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

4. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

5. Diare : Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer.
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit
   • Sembelit atau konstipasi : kondisi ketika seseorang mengalami kesulitan buang air besar (BAB), frekuensi BAB kurang dari tiga kali dalam seminggu, atau tekstur tinja menjadi keras, kering, dan sulit dikeluarkan: Sembelit atau konstipasi : kondisi ketika seseorang mengalami kesulitan buang air besar (BAB), frekuensi BAB kurang dari tiga kali dalam seminggu, atau tekstur tinja menjadi keras, kering, dan sulit dikeluarkan

6. Sembelit Akut (Ringan/Sesaat): Berlangsung kurang dari 3 bulan
   • Sembelit Kronis (Berat):  Berlangsung selama 3 bulan atau lebih.: Konsultasikan ke dokter

7. Kelelahan : kondisi ketika selalu merasa lelah, lesu, atau kurang tenaga
   Penanganan: Minum air putih yang cukup dan konsumsi makanan sehat serta seimbang untuk menjaga energi tubuh

8. Kaki dan tangan terasa dingin
   Penanganan: menghangatkan tubuh secara fisik dan berkonsultasi dengan dokter untuk evaluasi dosis tanpa menghentikan obat sendiri

9. pembengkakan pada kaki atau tangan
   Penanganan: konsultasikan dengan dokter',
                'monitoring' => 'Pantau tekanan darah, detak jantung, EKG, glukosa serum (pasien diabetes), tanda-tanda bronkospasme.',
                'cara_pemakaian' => 'Diminum pagi hari dan dapat dikonsumsi dengan atau tanpa makanan',
            ],            [
                'nama_obat' => 'Carvedilol',
                'klasifikasi' => 'Beta blocker generasi ketiga',
                'indikasi' => 'Hipertensi, gagal jantung, pasca infark miokard',
                'dosis_inisiasi' => ['6.25 mg', '25 mg'],
                'dosis_lazim' => '6.25 mg, 25 mg',
                'dosis_target' => '25 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari pagi dan malam hari',
                'kontraindikasi' => 'Asma bronkial, alergi terhadap obat carvedilol, Blok jantung (AV block) derajat dua atau tiga tanpa pacu jantung, sick sinus syndrome, Hipotensi berat, Gagal jantung kongestif berat yang tidak stabil atau membutuhkan inotropik intravena.',
                'efek_samping' => 'Kelelahan, pusing, bradikardia, gangguan pencernaan seperti mual atau diare, Tangan dan kaki terasa dingin

Cara Penanganan Efek Samping:
1. Bradikardia : kondisi ketika jantung berdetak lebih lambat daripada detak normal. Detak jantung normal pada orang dewasa adalah sekitar 60–100 detak per menit. Detak jantung normal pada orang yang sedang tidur atau istirahat berkisar antara 40–60 detak per menit.
   • Derajat I : tidak bergejala, sering tidak disadari, dan detak jantung sering kali masih dalam batas normal atau sedikit di bawah normal: Tidak memerlukan intervensi, pantau denyut jantung dan konsultasikan ke dokter
   • Derajat II : Dapat menimbulkan gejala seperti pusing, lemas, atau rasa tidak beraturan pada denyut jantung: Dirujuk ke rumah sakit
   • Derajat III : Merupakan kondisi paling berbahaya yang sering memicu sesak napas, nyeri dada, pusing berat, hingga pingsan (sinkop): Dirujuk ke rumah sakit

2. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

3. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit. Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

4. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

5. Diare : Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer.
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

6. Kelelahan : kondisi ketika selalu merasa lelah, lesu, atau kurang tenaga
   Penanganan: Minum air putih yang cukup dan konsumsi makanan sehat serta seimbang untuk menjaga energi tubuh

7. Kaki dan tangan terasa dingin
   Penanganan: menghangatkan tubuh secara fisik dan berkonsultasi dengan dokter untuk evaluasi dosis tanpa menghentikan obat sendiri',
                'monitoring' => 'Pantau tekanan darah dan denyut nadi sesering mungkin selama periode penyesuaian dosis dan secara berkala selama terapi. Kaji hipotensi ortosatik saat membantu pasien berdiri dari posisi terlentang.',
                'cara_pemakaian' => 'Diminum pada pagi dan malam hari. Harus dikonsumsi dengan makanan. Konsumsi bersama makanan untuk mengurangi efek ortostatik',
            ],            [
                'nama_obat' => 'Metoprolol',
                'klasifikasi' => 'Selective Beta blcoker',
                'indikasi' => 'adjuvan dalam penatalaksanaan awal infark miokard akut, Angina pektoris, hipertensi, gagal jantung, hipertiroid, migrain',
                'dosis_inisiasi' => ['50 mg', '100 mg'],
                'dosis_lazim' => '50 mg, 100 mg',
                'dosis_target' => '200 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari siang hari',
                'kontraindikasi' => 'kondisi denyut jantung sangat lambat (bradikardia berat), syok kardiogenik, gagal jantung tak terkontrol, serta gangguan konduksi jantung seperti blok jantung derajat tinggi.',
                'efek_samping' => 'Bradikardia, pusing atau sakit kepala, kelelahan, Gangguan pencernaan seperti mual, diare, atau konstipasi, tangan dan kaki terasa dingin, Pembengkakan pada kaki

Cara Penanganan Efek Samping:
1. Bradikardia : kondisi ketika jantung berdetak lebih lambat daripada detak normal. Detak jantung normal pada orang dewasa adalah sekitar 60–100 detak per menit. Detak jantung normal pada orang yang sedang tidur atau istirahat berkisar antara 40–60 detak per menit.
   • Derajat I : tidak bergejala, sering tidak disadari, dan detak jantung sering kali masih dalam batas normal atau sedikit di bawah normal: Tidak memerlukan intervensi, pantau denyut jantung dan konsultasikan ke dokter
   • Derajat II : Dapat menimbulkan gejala seperti pusing, lemas, atau rasa tidak beraturan pada denyut jantung: Dirujuk ke rumah sakit
   • Derajat III : Merupakan kondisi paling berbahaya yang sering memicu sesak napas, nyeri dada, pusing berat, hingga pingsan (sinkop): Dirujuk ke rumah sakit

2. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

3. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit. Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

3. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

4. Diare : Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer.
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

5. Sembelit atau konstipasi : kondisi ketika seseorang mengalami kesulitan buang air besar (BAB), frekuensi BAB kurang dari tiga kali dalam seminggu, atau tekstur tinja menjadi keras, kering, dan sulit dikeluarkan
   • Sembelit Akut (Ringan/Sesaat): Berlangsung kurang dari 3 bulan: Mengkonsumsi makanan berserat, minum air putih secukupnya, jika diperlukan minum pencahar seperti Dulcolax
   • Sembelit Kronis (Berat):  Berlangsung selama 3 bulan atau lebih.: Konsultasikan ke dokter

6. Kelelahan : kondisi ketika selalu merasa lelah, lesu, atau kurang tenaga
   Penanganan: Minum air putih yang cukup dan konsumsi makanan sehat serta seimbang untuk menjaga energi tubuh

7. Kaki dan tangan terasa dingin
   Penanganan: menghangatkan tubuh secara fisik dan berkonsultasi dengan dokter untuk evaluasi dosis tanpa menghentikan obat sendiri

8. pembengkakan pada kaki atau tangan
   Penanganan: konsultasikan dengan dokter untuk evaluasi dosis tanpa menghentikan obat sendiri',
                'monitoring' => 'Pantau tekanan darah, detak jantung; EKG (dengan penggunaan IV), irama jantung.',
                'cara_pemakaian' => 'Diminum siang hari dan diminum bersama makanan untuk meningkatkan penyerapan obat',
            ],            [
                'nama_obat' => 'Nebivolol',
                'klasifikasi' => 'Penyekat beta adrenergik selektif',
                'indikasi' => 'Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['5 mg'],
                'dosis_lazim' => '5 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari malam hari',
                'kontraindikasi' => 'Hipersensitivitas terhadap nebivolol, Bradikardia berat, Riwayat bronkospasme atau asma bronkial, Hipotensi berat',
                'efek_samping' => 'Bradikardia, hipotensi, bronkospasme, sakit kepala/pusing, kelelahan, kesemutan pada tangan atau kaki, Gangguan pencernaan seperti mual, diare, atau sembelit, insomnia atau gangguan tidur

Cara Penanganan Efek Samping:
1. Bradikardia : kondisi ketika jantung berdetak lebih lambat daripada detak normal. Detak jantung normal pada orang dewasa adalah sekitar 60–100 detak per menit. Detak jantung normal pada orang yang sedang tidur atau istirahat berkisar antara 40–60 detak per menit.
   • Derajat I : tidak bergejala, sering tidak disadari, dan detak jantung sering kali masih dalam batas normal atau sedikit di bawah normal: Tidak memerlukan intervensi, pantau denyut jantung dan konsultasikan ke dokter
   • Derajat II : Dapat menimbulkan gejala seperti pusing, lemas, atau rasa tidak beraturan pada denyut jantung: Dirujuk ke rumah sakit
   • Derajat III : Merupakan kondisi paling berbahaya yang sering memicu sesak napas, nyeri dada, pusing berat, hingga pingsan (sinkop): Dirujuk ke rumah sakit

2. Hipotensi : Tekanan darah berada di bawah rentang antara 90/60 mmHg dan 120/80 mmHg yang ditandai beberapa gejala seperti:  kelelahan, pusing atau sakit kepala ringan, mual, penurunan kesadaran, pandangan kabur,  kurang konsentrasi serta pingsan.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, segera duduk atau berbaring. Jika kondisi tidak membaik/mengganggu aktivitas segera dirujuk ke dokter.

3. Bronkospasme : kondisi ketika otot-otot di dinding saluran pernapasan (bronkus) mengalami penyempitan atau penegangan secara tiba-tiba ditandai dengan sesak napas, mengi (suara siulan atau "ngik-ngik" saat bernapas) dan dada terasa sesak, tertekan, atau nyeri
   Penanganan: segera dirujuk ke dokter.

4. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

3. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit. Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

3. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

4. Diare : Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer.
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

5. Sembelit atau konstipasi : kondisi ketika seseorang mengalami kesulitan buang air besar (BAB), frekuensi BAB kurang dari tiga kali dalam seminggu, atau tekstur tinja menjadi keras, kering, dan sulit dikeluarkan
   • Sembelit Akut (Ringan/Sesaat): Berlangsung kurang dari 3 bulan: Mengkonsumsi makanan berserat, minum air putih secukupnya, jika diperlukan minum pencahar seperti Dulcolax
   • Sembelit Kronis (Berat):  Berlangsung selama 3 bulan atau lebih.: Konsultasikan ke dokter

6. Kelelahan : kondisi ketika selalu merasa lelah, lesu, atau kurang tenaga
   Penanganan: Minum air putih yang cukup dan konsumsi makanan sehat serta seimbang untuk menjaga energi tubuh

7. kesemutan pada tangan atau kaki
   Penanganan: mengubah posisi tubuh, berdiri, atau berjalan perlahan agar aliran darah kembali lancer, pijat ringan pada area yang kesemutan. Berkonsultasi dengan dokter untuk evaluasi dosis tanpa menghentikan obat sendiri

8. insomnia atau gangguan tidur : kondisi yang membuat seseorang kesulitan untuk memulai tidur, sering terbangun di malam hari, atau bangun terlalu dini dan tidak bisa tidur kembali.
   Penanganan: Tidur dan bangunlah pada jam yang sama setiap hari. Konsultasi ke dokter, jangan mengubah dosis atau menghentikan obat sendiri.',
                'monitoring' => 'Pantau tekanan darah dan detak jantung (sebelum dan selama terapi dan setelah perubahan dosis); glukosa serum (pada pasien diabetes); fungsi ginjal dan hati. Dapatkan EKG.',
                'cara_pemakaian' => 'Diminum malam hari. Dapat diminum dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Spironolactone',
                'klasifikasi' => 'Antagonis aldosteron (diuretik hemat kalium)',
                'indikasi' => 'Asites, Edema, Gagal jantung',
                'dosis_inisiasi' => ['25 mg', '100 mg'],
                'dosis_lazim' => '25 mg, 100 mg',
                'dosis_target' => '50-100 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'Hiperkalemia, gangguan ginjal berat dan gagal ginjal akut, Penyakit Addison, penggunaan suplemen kalium.',
                'efek_samping' => 'Pusing/sakit kepala, kantuk, mual, muntah, diare

Cara Penanganan Efek Samping:
1. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

2. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

3. Diare :  Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

4. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, asam urat, glukosa darah, fungsi ginjal, status volume, dan BUN secara berkala; elektrolit serum, termasuk K (dalam 1 minggu setelah memulai pengobatan atau titrasi dosis, dan secara teratur setelahnya) dan Na. Pantau serum K dan fungsi ginjal secara ketat 3 hari setelah memulai terapi, 1 minggu setelah mulai terapi, setidaknya setiap bulan selama 3 bulan pertama pengobatan, dan setiap 3 bulan setelahnya untuk pasien dengan gagal jantung.',
                'cara_pemakaian' => 'Cara penggunaan :
Diminum pagi hari. Dapat diminum dengan atau tanpa makanan. Konsumsi secara konsisten dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Eplerenone',
                'klasifikasi' => 'Antagonis aldosteron',
                'indikasi' => 'Gagal jantung pasca infark miokard',
                'dosis_inisiasi' => ['25 mg', '50 mg'],
                'dosis_lazim' => '25 mg, 50 mg',
                'dosis_target' => '50 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'Hiperkalemia, gangguan ginjal berat, gangguan hati berat, Diabetes melitus, alergi terhadap eplerenon',
                'efek_samping' => 'gangguan pencernaan (mual, muntah, atau diare), pusing, sakit kepala, badan cepat lelah.

Cara Penanganan Efek Samping:
1. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

2. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

3. Diare :  Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

4. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah dan serum K sebelum memulai pengobatan, dalam minggu pertama, 1 bulan setelah penyesuaian dosis atau pengobatan, dan secara berkala setelahnya. Gagal jantung: Pantau serum K dan fungsi ginjal 3 hari setelah mulai pengobatan, 1 minggu setelah mulai pengobatan, setiap bulan selama 3 bulan pertama, dan setiap 3 bulan setelahnya.',
                'cara_pemakaian' => 'Diminum pagi hari. Dapat diminum dengan atau tanpa makanan.',
            ],            [
                'nama_obat' => 'Dapagliflozin',
                'klasifikasi' => 'Sodium-glucose co-transporter-2 (SGLT-2) inhibitors',
                'indikasi' => 'Diabetes Melitus tipe 2, gagal jantung',
                'dosis_inisiasi' => ['5 mg', '10 mg'],
                'dosis_lazim' => '5 mg, 10 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'hipersensitivitas terhadap dapagliflozin, penderita diabetes melitus tipe 1, serta kondisi ketoasidosis diabetic, gangguan ginjal berat, kehamilan dan menyusui',
                'efek_samping' => 'sering buang air kecil/poliuria, dehidrasi, sakit kepala,  hipoglikemia

Cara Penanganan Efek Samping:
1. Poliuria : kondisi ketika tubuh memproduksi dan mengeluarkan urin secara berlebihan, yaitu lebih dari 3 liter per hari pada orang dewasa, dengan frekuensi buang air kecil yang jauh lebih sering dari biasanya
   Penanganan: Minum air putih secukupnya. Minum obat dapagliflozin di pagi hari

2. Dehidrasi : kondisi ketika tubuh kehilangan lebih banyak cairan daripada yang dikonsumsi, sehingga keseimbangan cairan dan elektrolit terganggu
   • Ringan/Sedang: Rasa haus, mulut kering, warna urine lebih gelap, dan jarang buang air kecil.: Minum larutan oralit atau larutan gula garam untuk mengembalikan elektrolit tubuh (seperti natrium dan kalium) yang hilang
   • Berat: Sangat haus, pusing, lemas, mata cekung, hingga penurunan kesadaran: Dirujuk ke rumah sakit

3. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

4. Hipoglikemia :  kondisi ketika kadar gula darah berada di bawah 70 mg/dL, dengan  gejala badan lemas dan gemetar, keringat dingin, jantung berdebar-debar, pusing atau sakit kepala, mudah lapar dan marah, sulit berkonsentrasi.
   Penanganan: Konsumsi makanan atau minuman yang manis seperti larutan gula, permen. Jika pingsan segera dibawa ke rumah sakit.',
                'monitoring' => 'status volume cairan dan elektrolit',
                'cara_pemakaian' => 'Diminum pagi hari, Obat ditelan utuh, dapat diminum sebelum atau bersama makanan',
            ],            [
                'nama_obat' => 'Empagliflozin',
                'klasifikasi' => 'Sodium-glucose co-transporter 2 (SGLT2) inhibitors',
                'indikasi' => 'Diabetes melitus tipe 2, gagal jantung',
                'dosis_inisiasi' => ['10 mg', '25 mg'],
                'dosis_lazim' => '10 mg, 25 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'hipersensitivitas berat terhadap empagliflozin, diabetes melitus tipe 1, ketoasidosis diabetik, gangguan fungsi ginjal berat, kehamilan dan menyusui',
                'efek_samping' => 'Sering haus/polidipsia, sering buang air kecil/poliuria, pusing

Cara Penanganan Efek Samping:
1. Poliuria : kondisi ketika tubuh memproduksi dan mengeluarkan urin secara berlebihan, yaitu lebih dari 3 liter per hari pada orang dewasa, dengan frekuensi buang air kecil yang jauh lebih sering dari biasanya
   Penanganan: Minum air putih secukupnya. Minum obat empagliflozin di pagi hari

2. Polidipsia :  rasa haus yang berlebihan
   Penanganan: Lakukan rehidrasi dengan minum air putih secara cukup atau pemberian cairan elektrolit sesuai kebutuhan

3. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau glukosa darah, HbA 1c (setidaknya dua kali setahun pada pasien dengan kontrol glikemik stabil; setiap tiga bulan pada pasien yang tidak mencapai tujuan pengobatan atau dengan perubahan terapi), status volume (misalnya tekanan darah, hematokrit, elektrolit). Dapatkan fungsi ginjal pada awal dan secara berkala selama terapi.',
                'cara_pemakaian' => 'Diminum pagi hari, dapat diminum dengan atau tanpa makanan,',
            ],            [
                'nama_obat' => 'Furosemide',
                'klasifikasi' => 'Loop diuretik',
                'indikasi' => 'Edema, Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['40 mg'],
                'dosis_lazim' => '40 mg',
                'dosis_target' => '40 mg',
                'frekuensi_default' => null,
                'frekuensi_keterangan' => '1 - 2 x sehari, 1 x sehari pagi hari',
                'kontraindikasi' => 'kondisi anuria (tidak bisa buang air kecil sama sekali), riwayat alergi terhadap furosemide, dehidrasi berat, kekurangan elektrolit, koma hepatik',
                'efek_samping' => 'Sering buang air kecil/poliuria, dehidrasi, sakit kepala, mual dan muntah

Cara Penanganan Efek Samping:
1. Poliuria : kondisi ketika tubuh memproduksi dan mengeluarkan urin secara berlebihan, yaitu lebih dari 3 liter per hari pada orang dewasa, dengan frekuensi buang air kecil yang jauh lebih sering dari biasanya
   Penanganan: Minum air putih secukupnya. Minum obat furosemide di pagi hari

2. Dehidrasi : kondisi ketika tubuh kehilangan lebih banyak cairan daripada yang dikonsumsi, sehingga keseimbangan cairan dan elektrolit terganggu
   • Ringan/Sedang: Rasa haus, mulut kering, warna urine lebih gelap, dan jarang buang air kecil.: Minum larutan oralit atau larutan gula garam untuk mengembalikan elektrolit tubuh (seperti natrium dan kalium) yang hilang
   • Berat: Sangat haus, pusing, lemas, mata cekung, hingga penurunan kesadaran: Dirujuk ke rumah sakit

3. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

4. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi. Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

5. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit',
                'monitoring' => 'Pantau tekanan darah, elektrolit serum (misalnya serum Na, K), fungsi ginjal, dan kadar glukosa darah secara berkala; asupan dan keluaran cairan. Pantau tanda dan gejala diskrasia darah, kerusakan hati, dan reaksi istimewa.',
                'cara_pemakaian' => 'Diminum pagi hari. Dapat diminum dengan atau tanpa makanan. Dapat diberikan bersama makanan untuk mengurangi rasa tidak nyaman pada gastrointestinal.',
            ],            [
                'nama_obat' => 'Ivabradine',
                'klasifikasi' => 'penghambat kanal funny current (If)',
                'indikasi' => 'Gagal jantung. irama sinus dengan laju jantung istirahat >70 kali per menit',
                'dosis_inisiasi' => ['5 mg', '7.5 mg'],
                'dosis_lazim' => '5 mg, 7.5 mg',
                'dosis_target' => '7.5 mg',
                'frekuensi_default' => 2,
                'frekuensi_keterangan' => '2 x sehari',
                'kontraindikasi' => 'Tekanan darah dibawah 90/50 mmHg yang disebabkan laju nadi yang lambat, Irama selain irama sinus, Penyakit abnormalitas konduksi jantung seperti blok sinoatrial, blok atrioventrikular dan sick sinus syndrome, Gangguan liver berat, Nadi istirahat <60 kali per menit',
                'efek_samping' => 'Bradikardia (Denyut Jantung Terlalu Lambat), sakit kepala, risiko gangguan irama jantung, Gangguan penglihatan berupa peningkatan kecerahan sementara di area tertentu pada bidang pandang yang bersifat ringan dan dapat membaik dengan sendirinya.

Cara Penanganan Efek Samping:
1. Bradikardia : kondisi ketika jantung berdetak lebih lambat daripada detak normal. Detak jantung normal pada orang dewasa adalah sekitar 60–100 detak per menit. Detak jantung normal pada orang yang sedang tidur atau istirahat berkisar antara 40–60 detak per menit.
   • Derajat I : tidak bergejala, sering tidak disadari, dan detak jantung sering kali masih dalam batas normal atau sedikit di bawah normal: Tidak memerlukan intervensi, pantau denyut jantung dan konsultasikan ke dokter
   • Derajat II : Dapat menimbulkan gejala seperti pusing, lemas, atau rasa tidak beraturan pada denyut jantung: Dirujuk ke rumah sakit
   • Derajat III : Merupakan kondisi paling berbahaya yang sering memicu sesak napas, nyeri dada, pusing berat, hingga pingsan (sinkop): Dirujuk ke rumah sakit

2. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit

3. Gangguan irama jantung/aritmia : kondisi ketika jantung berdetak terlalu cepat, terlalu lambat, atau tidak beraturan
   Penanganan: Dikonsultasikan ke dokter',
                'monitoring' => 'Irama jantung, denyut jantung, tekanan darah',
                'cara_pemakaian' => 'Diminum pagi dan malam hari bersama makan',
            ],            [
                'nama_obat' => 'Digoksin',
                'klasifikasi' => 'glikosida digitalis',
                'indikasi' => 'gagal jantung dengan fibrilasi atrium',
                'dosis_inisiasi' => ['0.25 mg'],
                'dosis_lazim' => '0.25 mg',
                'dosis_target' => '0.75 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'fibrilasi ventrikel, blok atrioventrikular derajat dua atau tiga, sindrom Wolff-Parkinson-White (WPW) yang disertai fibrilasi atrium, riwayat hipersensitivitas terhadap digoksin, infark miokard akut, gangguan ginjal',
                'efek_samping' => 'Gejala Toksisitas Berat : Gangguan Jantung (Aritmia (irama jantung tidak teratur), bradikardia (detak jantung terlalu lambat), atau palpitasi hebat). Gangguan Penglihatan Khas (Xanthopsia) (Pandangan kabur atau melihat lingkaran halo berwarna kuning-hijau pada objek). Gangguan sistem Saraf Pusat( Kebingungan mental yang parah, halusinasi, disorientasi, atau depresi). Gangguan Saluran Cerna Akut (Feses berdarah atau berwarna hitam seperti tar)
Ringan – sedang : mual dan muntah, penurunan nafsu makan secara drastis (anoreksia), diare dan nyeri perut, sakit kepala, pusing, dan lemas tubuh

Cara Penanganan Efek Samping:
1. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.
   • Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak
   • Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.: Dirujuk ke rumah sakit Hidrasi cairan intravena
   • Derajat 3: Kalori oral atau asupan cairan tidak adekuat: Dirujuk ke rumah sakit

2. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

3. Diare :  Gangguan yang ditandai dengan peningkatan frekuensi dan / atau buang air besar atau encer
   • Derajat 1: Peningkatan frekuensi feses <4 per hari di atas normal; peningkatan ringan.: Diet rendah serat
   • Derajat 2: Peningkatan frekuensi feses 4-6 per hari di atas normal.: Segera hubungi apoteker. Jika di rumah tersedia Loperamid (contoh Imodium) dapat diminum. Pertama kali minum sebanyak 2 tablet 2 mg sekaligus, lalu 1 tablet 2 mg setiap BAB atau setiap 4-6 jam. Konsumsi loperamid tidak boleh melebihi 16 mg dalam sehari (8 tablet). Konsumsi cairan minimal 2 liter per hari. Loperamid dapat dihentikan jika dalam 24 jam diare berhenti. Jika diare tidak tertangani dalam 24 jam makan penggantian cairan dan elektrolit harus diperhatikan dan pasien dapat dirujuk ke dokter.
   • Derajat 3: Peningkatan frekuensi BAB ≥ 7 tinja per hari di atas normal; memerlukan rawat inap.: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa, dibutuhkan intervensi urgensi.: Dirujuk ke rumah sakit

4. Sakit kepala : rasa nyeri atau rasa tidak nyaman yang muncul di area kepala, kulit kepala, atau leher
   • Derajat 1: Nyeri terasa seperti ikatan ketat di kepala, masih bisa beraktivitas normal, dan tidak terlalu mengganggu konsentrasi: Istirahat di tempat tenang,  kompres dingin di dahi atau tengkuk,  cukupi cairan tubuh
   • Derajat 2: Nyeri berdenyut atau menekan yang membuat aktivitas mulai terhambat dan membutuhkan jeda istirahat.: Konsumsi obat pereda nyeri jika diperlukan, bisa meminum obat bebas seperti parasetamol.
   • Derajat 3: Nyeri sangat hebat (seperti migrain berat atau sakit kepala klaster), sulit bangun dari tempat tidur, serta sering disertai mual atau sensitivitas terhadap cahaya dan suara: Dirujuk ke rumah sakit',
                'monitoring' => 'elektrolit serum dan fungsi ginjal (konsentrasi kreatinin serum) pada awal dan berkala. Pantau detak jantung dan ritme bersama dengan EKG berkala. Amati tanda dan gejala toksisitas digoksin, termasuk tanda nonkardiak seperti kebingungan dan depresi.',
                'cara_pemakaian' => 'Diminum pagi hari. Dapat diminum dengan atau tanpa makanan. Diminum pada waktu yang sama setiap harinya.',
            ],            [
                'nama_obat' => 'Vericiguat',
                'klasifikasi' => null,
                'indikasi' => 'gagal jantung kronik fraksi ejeksi rendah (NYHA II-IV) dengan risiko tinggi, seperti penderita yang mengalami perburukan atau baru saja menjalani perawatan',
                'dosis_inisiasi' => ['2.5 mg', '5 mg', '10 mg'],
                'dosis_lazim' => '2.5 mg, 5 mg, 10 mg',
                'dosis_target' => '10 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari',
                'kontraindikasi' => 'gangguan fungsi hati, gangguan fungsi ginjal, pasien dengan pemberian inhibitor phosphodiesterase 5 (PDE-5), ISDN, isosorbide 5- mononitrate, pentaerythritol tetranitrate, nicorandil, NTG patch atau moldidomine, anemia berat',
                'efek_samping' => 'Hipotensi ortostatik (tekanan darah rendah saat mendadak berdiri dan pusing), anemia,  mual, muntah, dan ketidaknyamanan perut.

Cara Penanganan Efek Samping:
1. Mual :  Gangguan yang ditandai dengan sensasi mual dan/atau keinginan untuk muntah.

1. Derajat 1 : Kehilangan nafsu makan tanpa perubahan kebiasaan makan.
   Penanganan: Tidak memerlukan intervensi Makan porsi sedikit dengan frekuensi lebih banyak

1. Derajat 2: Asupan oral menurun tanpa penurunan berat badan yang signifikan, dehidrasi atau malnutrisi.
   Penanganan: Dirujuk ke rumah sakit Hidrasi cairan intravena

1. Derajat 3: Kalori oral atau asupan cairan tidak adekuat
   Penanganan: Dirujuk ke rumah sakit

2. Muntah :  Gangguan yang ditandai dengan tindakan refleksif mengeluarkan isi perut melalui mulut.
   • Derajat 1: 1 kali/hari: Tidak memerlukan intervensi
   • Derajat 2: 2-5 kali/hari: Hubungi apoteker. Jika di rumah tersedia antiemetik, seperti metoklopramid atau ondansetron dapat diberikan. Konsumsi cairan minimal 2 liter perhari. Penggantian cairan (hidrasi) intravena (rawat jalan) jika kurang dari 24 jam
   • Derajat 3: ≥ 6 kali/hari: Dirujuk ke rumah sakit
   • Derajat 4: Mengancam jiwa: Dirujuk ke rumah sakit

3. Hipotensi ortostatik : Penurunan tekanan darah secara tiba-tiba (sistolik turun ≥ 20 mmHg atau diastolik turun ≥ 10 mmHg) yang terjadi dalam waktu 3 menit setelah berubah posisi dari duduk/berbaring ke posisi berdiri.
   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung garam atau natrium, hindari mengubah posisi tubuh dengan tiba-tiba dan berdiri terlalu lama.

4. Anemia : kondisi ketika jumlah sel darah merah dalam tubuh rendah dan tidak berfungsi dengan baik. Kondisi ini membuat tubuh tidak mendapat cukup oksigen sehingga kulit akan terlihat lebih pucat dan tubuh terasa mudah lelah.
   Penanganan: Dirujuk ke dokter',
                'monitoring' => 'pengecekan tekanan darah, berat badan harian, status kehamilan bagi wanita usia subur, tanda anemia',
                'cara_pemakaian' => 'Dapat diminum pagi atau malam hari, dengan waktu yang sama setiap harinya. Diminum Bersama makanan untuk meningkatkan absorbsi obat.',
            ],            [
                'nama_obat' => 'Hidroklorotiazid',
                'klasifikasi' => 'Diuretik thiazide',
                'indikasi' => 'Edema, Hipertensi, gagal jantung',
                'dosis_inisiasi' => ['25 mg'],
                'dosis_lazim' => '25 mg',
                'dosis_target' => '100 mg',
                'frekuensi_default' => 1,
                'frekuensi_keterangan' => '1 x sehari pagi hari',
                'kontraindikasi' => 'Hipersensitif terhadap hidroklorotiazid, kehamilan, gangguan ginjal, gangguan hepar, hiperkalemia',
                'efek_samping' => 'Sering buang air kecil/poliuria, hipotensi ortostatik, sakit kepala.\n\nCara Penanganan Efek Samping:\n1. Poliuria : kondisi ketika tubuh memproduksi dan mengeluarkan urin secara berlebihan (> 3 liter/hari).\n   Penanganan: Minum air putih secukupnya. Minum obat hidroklorotiazid di pagi hari.\n2. Hipotensi ortostatik : Penurunan tekanan darah tiba-tiba dalam waktu 3 menit setelah berdiri.\n   Penanganan: Minum air putih lebih banyak, konsumsi makanan yang mengandung natrium, hindari mengubah posisi tubuh tiba-tiba.\n3. Sakit kepala : rasa nyeri di area kepala\n   • Derajat 1: Nyeri tegang di kepala, aktivitas normal: Istirahat di tempat tenang, kompres dingin di dahi/tengkuk, cukupi cairan tubuh.\n   • Derajat 2: Nyeri berdenyut/menekan, aktivitas terhambat: Konsumsi obat pereda nyeri jika diperlukan (seperti parasetamol).\n   • Derajat 3: Nyeri sangat hebat, migrain berat: Segera dirujuk ke rumah sakit.',
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
