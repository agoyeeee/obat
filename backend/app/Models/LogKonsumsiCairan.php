<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogKonsumsiCairan extends Model
{
    protected $table = 'log_konsumsi_cairan';

    protected $fillable = [
        'reminder_cairan_id',
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

    public function reminderCairan(): BelongsTo
    {
        return $this->belongsTo(ReminderCairan::class);
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }
}
