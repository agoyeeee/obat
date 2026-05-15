<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RekapanCairan extends Model
{
    protected $table = 'rekapan_cairan';

    protected $fillable = [
        'pasien_id',
        'minggu_mulai',
        'tanggal',
        'waktu',
        'minuman',
        'jumlah_ml',
        'catatan_asupan',
        'status_kepatuhan',
    ];

    protected function casts(): array
    {
        return [
            'minggu_mulai' => 'date',
            'tanggal' => 'date',
            'jumlah_ml' => 'integer',
        ];
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }
}
