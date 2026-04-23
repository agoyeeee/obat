<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReminderObat extends Model
{
    protected $table = 'reminder_obat';

    protected $fillable = [
        'pasien_id',
        'obat_id',
        'merk_id',
        'dosis',
        'sediaan',
        'jumlah_obat',
        'waktu_konsumsi_id',
        'cara_pemakaian',
        'skor_kepatuhan',
    ];

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class);
    }

    public function merk(): BelongsTo
    {
        return $this->belongsTo(Merk::class);
    }

    public function waktuKonsumsi(): BelongsTo
    {
        return $this->belongsTo(WaktuKonsumsi::class);
    }
}
