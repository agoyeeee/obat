<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obat extends Model
{
    protected $table = 'obat';

    protected $fillable = [
        'nama_obat',
        'indikasi',
        'dosis_inisiasi',
        'dosis_target',
        'frekuensi_default',
        'kontraindikasi',
        'efek_samping',
        'monitoring',
    ];

    protected function casts(): array
    {
        return [
            'dosis_inisiasi' => 'array',
        ];
    }

    public function merks(): HasMany
    {
        return $this->hasMany(Merk::class);
    }

    public function reminderObat(): HasMany
    {
        return $this->hasMany(ReminderObat::class);
    }
}
