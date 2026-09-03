<?php

namespace Database\Seeders;

use App\Models\WaktuKonsumsi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WaktuKonsumsiSeeder extends Seeder
{
    public function run(): void
    {
        $waktus = [
            [
                'label_waktu' => 'Pagi',
                'jam'         => '07:00:00',
                'frekuensi'   => 1,
            ],
            [
                'label_waktu' => 'Siang',
                'jam'         => '12:00:00',
                'frekuensi'   => 1,
            ],
            [
                'label_waktu' => 'Sore',
                'jam'         => '17:00:00',
                'frekuensi'   => 1,
            ],
            [
                'label_waktu' => 'Malam',
                'jam'         => '20:00:00',
                'frekuensi'   => 1,
            ],
            [
                'label_waktu' => 'Sebelum Tidur',
                'jam'         => '22:00:00',
                'frekuensi'   => 1,
            ],
        ];

        DB::transaction(function () use ($waktus): void {
            foreach ($waktus as $data) {
                WaktuKonsumsi::query()->updateOrCreate(
                    ['label_waktu' => $data['label_waktu']],
                    $data,
                );
            }
        });
    }
}
