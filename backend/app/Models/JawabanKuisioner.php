<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JawabanKuisioner extends Model
{
    protected $table = 'jawaban_kuisioner';

    protected $fillable = [
        'rekap_kuisioner_id',
        'kuisioner_id',
        'jawaban',
        'skor',
    ];

    public function rekapKuisioner(): BelongsTo
    {
        return $this->belongsTo(RekapKuisioner::class);
    }

    public function kuisioner(): BelongsTo
    {
        return $this->belongsTo(Kuisioner::class);
    }
}
