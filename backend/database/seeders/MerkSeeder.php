<?php

namespace Database\Seeders;

use App\Models\Merk;
use App\Models\Obat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MerkSeeder extends Seeder
{
    public function run(): void
    {
        $merksByObat = [
            'Captopril' => ['Tensicap', 'Vapril', 'Captensin'],
            'Lisinopril' => ['Lipril', 'Nopril'],
            'Ramipril' => ['Hyperil', 'Tenapril', 'Triatec'],
            'Sacubitril-Valsartan' => [],
            'Candesartan' => ['Blopress', 'Canderin', 'Candetens'],
            'Valsartan' => ['Valesco', 'Co-diovan'],
            'Hidroklorotiazid' => ['Dexacap Plus', 'Blopress Plus 16', 'Coaprovel', 'Irtan Pluss'],
        ];

        DB::transaction(function () use ($merksByObat): void {
            foreach ($merksByObat as $namaObat => $namaMerks) {
                $obat = Obat::query()->where('nama_obat', $namaObat)->first();

                if (!$obat) {
                    continue;
                }

                foreach ($namaMerks as $namaMerk) {
                    Merk::query()->updateOrCreate(
                        [
                            'obat_id' => $obat->id,
                            'nama_merk' => $namaMerk,
                        ],
                        [],
                    );
                }
            }
        });
    }
}
