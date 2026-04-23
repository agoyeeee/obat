<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RekapKuisioner extends Model
{
    protected $table = 'rekap_kuisioner';

    protected $fillable = [
        'pasien_id',
        'tanggal',
        'total_skor',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function jawabanKuisioner(): HasMany
    {
        return $this->hasMany(JawabanKuisioner::class);
    }
}
