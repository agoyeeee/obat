<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReminderCairanSeeder extends Seeder
{
    public function run(): void
    {
        $reminders = [
            ['pasien_id' => 1, 'jumlah_ml' => 250, 'waktu' => '08:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 1, 'jumlah_ml' => 250, 'waktu' => '12:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 1, 'jumlah_ml' => 250, 'waktu' => '18:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'jumlah_ml' => 300, 'waktu' => '07:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 2, 'jumlah_ml' => 300, 'waktu' => '14:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'jumlah_ml' => 200, 'waktu' => '09:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 3, 'jumlah_ml' => 200, 'waktu' => '15:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 4, 'jumlah_ml' => 250, 'waktu' => '08:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'jumlah_ml' => 200, 'waktu' => '10:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['pasien_id' => 5, 'jumlah_ml' => 200, 'waktu' => '16:00:00', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('reminder_cairan')->insert($reminders);
    }
}
