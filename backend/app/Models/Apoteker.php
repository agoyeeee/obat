<?php

namespace App\Models;

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
}
