<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'usage_text',
        'how_to_use',
        'warning_text',
        'side_effects_text',
        'is_active',
    ];
}
