<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaktuKonsumsi extends Model
{
    protected $table = 'waktu_konsumsi';

    protected $fillable = [
        'label_waktu',
        'jam',
        'frekuensi',
    ];

    public function reminderObat(): HasMany
    {
        return $this->hasMany(ReminderObat::class);
    }
}
