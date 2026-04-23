<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pasien extends Model
{
    protected $table = 'pasien';

    protected $fillable = [
        'nama',
        'usia',
        'jenis_kelamin',
        'berat_badan',
        'tgl_diagnosa',
    ];

    protected function casts(): array
    {
        return [
            'berat_badan'  => 'float',
            'tgl_diagnosa' => 'date',
        ];
    }

    public function kontakPasien(): HasMany
    {
        return $this->hasMany(KontakPasien::class);
    }

    public function apotekers(): BelongsToMany
    {
        return $this->belongsToMany(Apoteker::class, 'kontak_pasien');
    }

    public function reminderObat(): HasMany
    {
        return $this->hasMany(ReminderObat::class);
    }

    public function reminderCairan(): HasMany
    {
        return $this->hasMany(ReminderCairan::class);
    }

    public function rekapanObat(): HasMany
    {
        return $this->hasMany(RekapanObat::class);
    }

    public function rekapanCairan(): HasMany
    {
        return $this->hasMany(RekapanCairan::class);
    }

    public function rekapKuisioner(): HasMany
    {
        return $this->hasMany(RekapKuisioner::class);
    }
}
