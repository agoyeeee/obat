<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineIntakeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'patient_id',
        'intake_date',
        'intake_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'intake_date' => 'date',
        ];
    }

    public function schedule()
    {
        return $this->belongsTo(PatientMedicineSchedule::class, 'schedule_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
