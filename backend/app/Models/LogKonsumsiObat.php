<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogKonsumsiObat extends Model
{
    protected $table = 'log_konsumsi_obat';

    protected $fillable = [
        'reminder_obat_id',
        'pasien_id',
        'tanggal',
        'waktu',
        'status',
        'skor',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'skor'    => 'integer',
    ];

    public function reminderObat(): BelongsTo
    {
        return $this->belongsTo(ReminderObat::class);
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }
}
