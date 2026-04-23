<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineIntakeLog;
use App\Models\PatientMedicineSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntakeLogController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'PASIEN') {
            return response()->json(['message' => 'Hanya pasien yang dapat mengisi status konsumsi.'], 403);
        }

        $validated = $request->validate([
            'schedule_id' => ['required', 'integer', 'exists:patient_medicine_schedules,id'],
            'intake_date' => ['required', 'date'],
            'intake_time' => ['required', 'date_format:H:i'],
            'status' => ['required', 'in:SUDAH_MINUM,TIDAK_MINUM'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $schedule = PatientMedicineSchedule::query()->findOrFail($validated['schedule_id']);
        if ($schedule->patient_id !== $user->id) {
            return response()->json(['message' => 'Jadwal tidak dimiliki pasien ini.'], 403);
        }

        $log = MedicineIntakeLog::query()->updateOrCreate(
            [
                'schedule_id' => $schedule->id,
                'patient_id' => $user->id,
                'intake_date' => $validated['intake_date'],
            ],
            [
                'intake_time' => $validated['intake_time'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json($log->load('schedule.medicine'), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = MedicineIntakeLog::query()->with('schedule.medicine');

        if ($user->role === 'PASIEN') {
            $query->where('patient_id', $user->id);
        }

        if ($user->role === 'APOTEKER') {
            if ($request->filled('patient_id')) {
                $query->where('patient_id', (int) $request->query('patient_id'));
            }
        }

        if ($request->filled('start_date')) {
            $query->whereDate('intake_date', '>=', $request->query('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('intake_date', '<=', $request->query('end_date'));
        }

        $logs = $query
            ->orderByDesc('intake_date')
            ->orderByDesc('intake_time')
            ->get();

        return response()->json($logs);
    }
}
