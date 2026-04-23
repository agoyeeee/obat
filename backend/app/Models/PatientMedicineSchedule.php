<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientMedicineSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'medicine_id',
        'pharmacist_id',
        'dosage',
        'medicine_type',
        'intake_time',
        'quantity_given',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function pharmacist()
    {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }
}
