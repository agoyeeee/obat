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
            'Enalapril' => ['Tenace', 'Renitec'],
            'Ramipril' => ['Hyperil', 'Tenapril', 'Triatec'],
            'Perindopril' => [],
            'Sacubitril-Valsartan' => ['Uperio'],
            'Candesartan' => ['Blopress', 'Canderin', 'Candetens'],
            'Valsartan' => ['Valesco', 'Co-diovan'],
            'Bisoprolol' => ['Biscor', 'Concor'],
            'Carvedilol' => ['Blorec', 'V Block'],
            'Metoprolol' => ['Betaloc Zok', 'Lopresor', 'Loprolol'],
            'Nebivolol' => ['Nebivas', 'Nebilet'],
            'Spironolactone' => ['Spirola', 'Carpiaton'],
            'Eplerenone' => ['Epleron', 'Inspra'],
            'Dapagliflozin' => ['Forxiga'],
            'Empagliflozin' => ['Jardiance'],
            'Furosemide' => ['Farsiretic', 'Lasix', 'Farsix'],
            'Ivabradine' => ['Coralan'],
            'Digoksin' => ['Fargoxin', 'Lanoxin'],
            'Vericiguat' => ['Verquvo'],
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
