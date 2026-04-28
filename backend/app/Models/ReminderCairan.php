<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReminderCairan extends Model
{
    protected $table = 'reminder_cairan';

    protected $fillable = [
        'pasien_id',
        'jumlah_ml',
        'waktu',
        'minuman',
        'catatan_asupan',
        'skor_kepatuhan',
    ];

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }
}
