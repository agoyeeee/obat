<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LogKonsumsiObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reminders = \App\Models\ReminderObat::all();
        $now = now();

        foreach ($reminders as $reminder) {
            // Generate logs for the last 7 days
            for ($i = 0; $i < 7; $i++) {
                $date = $now->copy()->subDays($i);
                $isPatuh = rand(0, 10) > 2; // 80% chance of being Patuh

                $labelWaktu = $reminder->waktuKonsumsi->label_waktu ?? 'Pagi';
                $timeMap = [
                    'Pagi' => '08:00:00',
                    'Siang' => '13:00:00',
                    'Sore' => '17:00:00',
                    'Malam' => '21:00:00',
                ];
                $time = $timeMap[$labelWaktu] ?? '08:00:00';

                \App\Models\LogKonsumsiObat::create([
                    'reminder_obat_id' => $reminder->id,
                    'pasien_id' => $reminder->pasien_id,
                    'tanggal' => $date->toDateString(),
                    'waktu' => $time,
                    'status' => $isPatuh ? 'diminum' : 'terlewat',
                    'skor' => $isPatuh ? 1 : 0,
                ]);
            }
        }
    }
}
