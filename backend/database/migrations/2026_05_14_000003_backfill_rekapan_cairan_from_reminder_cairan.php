<?php

use App\Models\RekapanCairan;
use App\Models\ReminderCairan;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ReminderCairan::query()->chunkById(100, function ($reminders): void {
            foreach ($reminders as $reminder) {
                $tanggal = optional($reminder->created_at)->toDateString() ?? now()->toDateString();

                RekapanCairan::query()->updateOrCreate(
                    [
                        'pasien_id' => $reminder->pasien_id,
                        'tanggal' => $tanggal,
                        'waktu' => $reminder->waktu,
                    ],
                    [
                        'minggu_mulai' => Carbon::parse($tanggal)->startOfWeek()->toDateString(),
                        'minuman' => $reminder->minuman,
                        'jumlah_ml' => (int) $reminder->jumlah_ml,
                        'catatan_asupan' => $reminder->catatan_asupan,
                        'status_kepatuhan' => null,
                    ]
                );
            }
        });
    }

    public function down(): void
    {
        // No-op: data backfill should not be blindly removed.
    }
};
