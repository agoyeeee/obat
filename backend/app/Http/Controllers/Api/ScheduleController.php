<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PatientMedicineSchedule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'APOTEKER') {
            return response()->json(['message' => 'Hanya apoteker yang dapat membuat jadwal.'], 403);
        }

        $validated = $request->validate([
            'patient_id' => ['required', 'integer', 'exists:users,id'],
            'medicine_id' => ['required', 'integer', 'exists:medicines,id'],
            'dosage' => ['required', 'string', 'max:100'],
            'medicine_type' => ['required', 'string', 'max:50'],
            'intake_time' => ['required', 'date_format:H:i'],
            'quantity_given' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $patient = User::query()->findOrFail($validated['patient_id']);
        if ($patient->role !== 'PASIEN') {
            return response()->json(['message' => 'Jadwal hanya dapat dibuat untuk role pasien.'], 422);
        }

        $schedule = PatientMedicineSchedule::query()->create([
            ...$validated,
            'pharmacist_id' => $user->id,
            'is_active' => true,
        ]);

        return response()->json($schedule->load('medicine'), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $date = $request->query('date');

        $query = PatientMedicineSchedule::query()->with('medicine');

        if ($user->role === 'PASIEN') {
            $query->where('patient_id', $user->id);
        }

        if ($user->role === 'APOTEKER') {
            $patientId = $request->query('patient_id');
            if ($patientId) {
                $query->where('patient_id', (int) $patientId);
            } else {
                $query->where('pharmacist_id', $user->id);
            }
        }

        if ($date) {
            $query
                ->whereDate('start_date', '<=', $date)
                ->where(function ($subQuery) use ($date): void {
                    $subQuery
                        ->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $date);
                });
        }

        $schedules = $query->orderBy('intake_time')->get();

        return response()->json($schedules);
    }
}
