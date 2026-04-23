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

        // 2. OBAT Logs
        $logsObat = LogKonsumsiObat::with('reminderObat.obat', 'reminderObat.merk')
            ->where('pasien_id', $pasienId)
            ->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        // 3. CAIRAN Logs
        $logsCairan = \App\Models\LogKonsumsiCairan::with('reminderCairan')
            ->where('pasien_id', $pasienId)
            ->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        return response()->json([
            'minggu_mulai' => $startDate->toDateString(),
            'minggu_akhir' => $endDate->toDateString(),
            'obat' => [
                'logs' => $logsObat->groupBy(fn($log) => Carbon::parse($log->tanggal)->format('Y-m-d')),
                'summary' => [
                    'total_skor' => $logsObat->sum('skor'),
                    'persentase' => DB::table('reminder_obat')->where('pasien_id', $pasienId)->count() * 7 > 0 ? ($logsObat->sum('skor') / (DB::table('reminder_obat')->where('pasien_id', $pasienId)->count() * 7)) * 100 : 0
                ]
            ],
            'cairan' => [
                'logs' => $logsCairan->groupBy(fn($log) => Carbon::parse($log->tanggal)->format('Y-m-d')),
                'summary' => [
                    'total_skor' => $logsCairan->sum('skor'),
                    'persentase' => (DB::table('reminder_cairan')->where('pasien_id', $pasienId)->count() * 7) > 0 ? ($logsCairan->sum('skor') / (DB::table('reminder_cairan')->where('pasien_id', $pasienId)->count() * 7)) * 100 : 0
                ]
            ]
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
    /**
     * Get monthly adherence monitoring (summary per week)
     */
    public function monthlyMonitoring(Request $request): JsonResponse
    {
        $request->validate([
            'pasien_id' => 'required|exists:pasien,id',
            'month' => 'required|integer|between:0,11',
            'year' => 'required|integer',
        ]);

        $pasienId = $request->query('pasien_id');
        $month = (int) $request->query('month') + 1; // Carbon is 1-based, JS is 0-based
        $year = (int) $request->query('year');

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        // Find all weeks in this month
        $weeks = [];
        $currentDate = $startOfMonth->copy();
        
        while ($currentDate->lte($endOfMonth)) {
            $weekStart = $currentDate->copy();
            $weekEnd = $currentDate->copy()->addDays(6);
            
            // OBAT Stats
            $remindersObatCount = DB::table('reminder_obat')->where('pasien_id', $pasienId)->count();
            $scheduledObat = $remindersObatCount * 7;
            $logsObat = LogKonsumsiObat::where('pasien_id', $pasienId)
                ->whereBetween('tanggal', [$weekStart->toDateString(), $weekEnd->toDateString()])
                ->get();
            $scoreObat = $logsObat->sum('skor');
            $percentageObat = $scheduledObat > 0 ? round(($scoreObat / $scheduledObat) * 100, 2) : 0;

            // CAIRAN Stats
            $remindersCairanCount = DB::table('reminder_cairan')->where('pasien_id', $pasienId)->count();
            $scheduledCairan = $remindersCairanCount * 7;
            $logsCairan = \App\Models\LogKonsumsiCairan::where('pasien_id', $pasienId)
                ->whereBetween('tanggal', [$weekStart->toDateString(), $weekEnd->toDateString()])
                ->get();
            $scoreCairan = $logsCairan->sum('skor');
            $percentageCairan = $scheduledCairan > 0 ? round(($scoreCairan / $scheduledCairan) * 100, 2) : 0;

            $weeks[] = [
                'minggu_mulai' => $weekStart->toDateString(),
                'minggu_akhir' => $weekEnd->toDateString(),
                'obat' => [
                    'status_kepatuhan' => $percentageObat >= 80 ? 'PATUH' : 'TIDAK_PATUH',
                    'persentase' => $percentageObat,
                ],
                'cairan' => [
                    'status_kepatuhan' => $percentageCairan >= 80 ? 'PATUH' : 'TIDAK_PATUH',
                    'persentase' => $percentageCairan,
                ]
            ];

            $currentDate->addDays(7);
        }

        return response()->json([
            'pasien_id' => $pasienId,
            'weeks' => $weeks
        ]);
    }
}
