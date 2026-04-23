<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KontakPasien extends Model
{
    protected $table = 'kontak_pasien';

    protected $fillable = [
        'pasien_id',
        'apoteker_id',
    ];

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function apoteker(): BelongsTo
    {
        return $this->belongsTo(Apoteker::class);
    }
}
