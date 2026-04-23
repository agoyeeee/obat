<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReminderCairan;
use App\Models\LogKonsumsiCairan;

class LogKonsumsiCairanSeeder extends Seeder
{
    public function run(): void
    {
        $reminders = ReminderCairan::all();
        $startOfMonth = now()->startOfMonth();
        $today = now();

        foreach ($reminders as $reminder) {
            $currentDate = $startOfMonth->copy();
            
            while ($currentDate->lte($today)) {
                $isPatuh = rand(0, 10) > 2; // 80% chance
                
                LogKonsumsiCairan::create([
                    'reminder_cairan_id' => $reminder->id,
                    'pasien_id' => $reminder->pasien_id,
                    'tanggal' => $currentDate->toDateString(),
                    'waktu' => $reminder->waktu,
                    'status' => $isPatuh ? 'diminum' : 'terlewat',
                    'skor' => $isPatuh ? 1 : 0,
                ]);

                $currentDate->addDay();
            }
        }
    }
}
