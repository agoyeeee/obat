<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obat extends Model
{
    protected $table = 'obat';

    protected $fillable = [
        'nama_obat',
        'klasifikasi',
        'indikasi',
        'dosis_inisiasi',
        'dosis_lazim',
        'dosis_target',
        'frekuensi_default',
        'frekuensi_keterangan',
        'kontraindikasi',
        'efek_samping',
        'monitoring',
        'cara_pemakaian',
    ];

    /** @var array<string,string> */
    protected $casts = [
        'dosis_inisiasi' => 'array',
    ];

    public function merks(): HasMany
    {
        return $this->hasMany(Merk::class);
    }

    public function reminderObat(): HasMany
    {
        return $this->hasMany(ReminderObat::class);
    }
}
