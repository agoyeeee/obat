<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RekapanObat extends Model
{
    protected $table = 'rekapan_obat';

    protected $fillable = [
        'pasien_id',
        'minggu_mulai',
        'status_kepatuhan',
    ];

    protected function casts(): array
    {
        return [
            'minggu_mulai' => 'date',
        ];
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }
}
