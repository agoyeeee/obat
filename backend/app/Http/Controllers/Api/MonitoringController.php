<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\LogKonsumsiObat;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonitoringController extends Controller
{
    /**
     * Get weekly adherence monitoring for a patient.
     * Calculated dynamically from daily consumption logs.
     */
    public function weeklyMonitoring(Request $request): JsonResponse
    {
        $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'start_date' => 'required|date',
        ]);

        $pasienId = $request->query('pasien_id');
        $startDate = Carbon::parse($request->query('start_date'))->startOfDay();
        $endDate = $startDate->copy()->addDays(6)->endOfDay();

        // 1. Get total scheduled doses (count of reminders * 7 days)
        // Note: In a real system, we might check if a reminder was active during those dates
        $remindersCount = DB::table('reminder_obat')->where('pasien_id', $pasienId)->count();
        $totalScheduled = $remindersCount * 7;

        // 2. Aggregate logs for the specific week
        $logs = LogKonsumsiObat::where('pasien_id', $pasienId)
            ->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $totalTaken = $logs->where('status', 'diminum')->count();
        $totalMissed = $logs->where('status', 'terlewat')->count();
        $totalScore = $logs->sum('skor');

        // 3. Calculate dynamic adherence percentage
        $adherencePercentage = $totalScheduled > 0 
            ? round(($totalScore / $totalScheduled) * 100, 2) 
            : 0;

        return response()->json([
            'pasien_id' => $pasienId,
            'periode' => [
                'mulai' => $startDate->toDateString(),
                'akhir' => $endDate->toDateString(),
            ],
            'statistik' => [
                'total_jadwal' => $totalScheduled,
                'total_diminum' => $totalTaken,
                'total_terlewat' => $totalMissed,
                'skor_akumulasi' => $totalScore,
                'persentase_kepatuhan' => $adherencePercentage,
                'status_kepatuhan' => $adherencePercentage >= 80 ? 'PATUH' : 'TIDAK_PATUH'
            ],
            'detail_harian' => $logs->groupBy(function($log) {
                return Carbon::parse($log->tanggal)->format('Y-m-d');
            })
        ]);
    }

    /**
     * Store consumption log (called by mobile app when patient takes medication)
     */
    public function logConsumption(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reminder_obat_id' => 'required|exists:reminder_obat,id',
            'pasien_id' => 'required|exists:pasien,id',
            'tanggal' => 'required|date',
            'waktu' => 'required',
            'status' => 'required|in:diminum,terlewat'
        ]);

        $log = LogKonsumsiObat::updateOrCreate(
            [
                'reminder_obat_id' => $validated['reminder_obat_id'],
                'tanggal' => $validated['tanggal'],
                'waktu' => $validated['waktu'],
            ],
            [
                'pasien_id' => $validated['pasien_id'],
                'status' => $validated['status'],
                'skor' => $validated['status'] === 'diminum' ? 1 : 0,
            ]
        );

        return response()->json([
            'message' => 'Log berhasil disimpan',
            'log' => $log
        ]);
    }
}
