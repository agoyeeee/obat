<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineIntakeLog;
use App\Models\PatientMedicineSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdherenceController extends Controller
{
    public function weekly(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'patient_id' => ['nullable', 'integer', 'exists:users,id'],
            'week_start' => ['required', 'date'],
        ]);

        $patientId = $user->role === 'PASIEN' ? $user->id : ($validated['patient_id'] ?? null);
        if (!$patientId) {
            return response()->json(['message' => 'patient_id wajib untuk role apoteker.'], 422);
        }

        $weekStart = Carbon::parse($validated['week_start'])->startOfDay();
        $weekEnd = $weekStart->copy()->addDays(6)->endOfDay();

        $schedules = PatientMedicineSchedule::query()
            ->where('patient_id', $patientId)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $weekEnd->toDateString())
            ->where(function ($query) use ($weekStart): void {
                $query
                    ->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $weekStart->toDateString());
            })
            ->get(['id', 'start_date', 'end_date']);

        $totalSchedules = 0;

        foreach ($schedules as $schedule) {
            $scheduleStart = Carbon::parse($schedule->start_date)->startOfDay();
            $scheduleEnd = $schedule->end_date
                ? Carbon::parse($schedule->end_date)->endOfDay()
                : $weekEnd->copy();

            $effectiveStart = $scheduleStart->greaterThan($weekStart) ? $scheduleStart : $weekStart->copy();
            $effectiveEnd = $scheduleEnd->lessThan($weekEnd) ? $scheduleEnd : $weekEnd->copy();

            if ($effectiveStart->lessThanOrEqualTo($effectiveEnd)) {
                $totalSchedules += $effectiveStart->diffInDays($effectiveEnd) + 1;
            }
        }

        $takenCount = MedicineIntakeLog::query()
            ->where('patient_id', $patientId)
            ->where('status', 'SUDAH_MINUM')
            ->whereBetween('intake_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->count();

        $adherencePercent = $totalSchedules > 0
            ? round(($takenCount / $totalSchedules) * 100, 2)
            : 0;

        return response()->json([
            'patient_id' => $patientId,
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
            'total_schedules' => $totalSchedules,
            'taken_count' => $takenCount,
            'adherence_percent' => $adherencePercent,
        ]);
    }
}
