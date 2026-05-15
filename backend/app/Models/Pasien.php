<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pasien extends Model
{
    protected $table = 'pasien';

    protected $fillable = [
        'nama',
        'usia',
        'jenis_kelamin',
        'berat_badan',
        'tgl_diagnosa',
        'tgl_lahir',
        'status_pernikahan',
        'suku',
        'pendidikan',
        'pekerjaan',
        'nomor_hp',
        'pendapatan',
    ];

    protected function casts(): array
    {
        return [
            'berat_badan'  => 'float',
            'tgl_diagnosa' => 'date',
            'tgl_lahir'    => 'date',
        ];
    }

    public function reminderObat(): HasMany
    {
        return $this->hasMany(ReminderObat::class);
    }

    public function reminderCairan(): HasMany
    {
        return $this->hasMany(ReminderCairan::class);
    }

    public function logsObat(): HasMany
    {
        return $this->hasMany(LogKonsumsiObat::class);
    }

    public function rekapKuisioner(): HasMany
    {
        return $this->hasMany(RekapKuisioner::class);
    }
}
