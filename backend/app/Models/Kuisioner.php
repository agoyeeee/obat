<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kuisioner extends Model
{
    protected $table = 'kuisioner';

    protected $fillable = [
        'pertanyaan',
        'tipe',
        'opsi',
    ];

    protected function casts(): array
    {
        return [
            'opsi' => 'array',
        ];
    }

    public function jawabanKuisioner(): HasMany
    {
        return $this->hasMany(JawabanKuisioner::class);
    }
}
