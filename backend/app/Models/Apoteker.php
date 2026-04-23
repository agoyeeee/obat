<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Apoteker extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'apoteker';

    protected $fillable = [
        'nama',
        'no_hp',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function kontakPasien(): HasMany
    {
        return $this->hasMany(KontakPasien::class);
    }

    public function pasiens(): BelongsToMany
    {
        return $this->belongsToMany(Pasien::class, 'kontak_pasien');
    }
}
