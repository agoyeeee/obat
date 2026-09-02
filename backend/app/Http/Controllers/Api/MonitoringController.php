<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\LogKonsumsiObat;
use App\Models\RekapanCairan;
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
        $logsObat = LogKonsumsiObat::with('reminderObat.obat', 'reminderObat.merk', 'reminderObat.waktuKonsumsi')
            ->where('pasien_id', $pasienId)
            ->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        // 3. CAIRAN Logs
        $logsCairan = RekapanCairan::query()
            ->where('pasien_id', $pasienId)
            ->get();

        $logsCairan = $logsCairan->filter(function (RekapanCairan $item) use ($startDate, $endDate) {
            $entryDate = Carbon::parse($item->tanggal ?? $item->created_at);

            return $entryDate->betweenIncluded($startDate->copy()->startOfDay(), $endDate->copy()->endOfDay());
        })->values();

        return response()->json([
            'minggu_mulai' => $startDate->toDateString(),
            'minggu_akhir' => $endDate->toDateString(),
            'obat' => [
                'logs' => $logsObat->groupBy(fn($log) => Carbon::parse($log->tanggal)->format('Y-m-d')),
                'summary' => [
                    'total_skor' => $logsObat->sum('skor'),
                    'total_logs' => $logsObat->count(),
                    'persentase' => $logsObat->count() > 0 ? ($logsObat->sum('skor') / $logsObat->count()) * 100 : 0
                ]
            ],
            'cairan' => [
                'logs' => $logsCairan->groupBy(fn($log) => Carbon::parse($log->tanggal)->format('Y-m-d')),
                'summary' => [
                    'total_ml' => $logsCairan->sum('jumlah_ml'),
                    'total_logs' => $logsCairan->count(),
                    'target_ml' => 900,
                    'persentase' => $logsCairan->count() > 0 ? min(100, ($logsCairan->sum('jumlah_ml') / 900) * 100) : 0
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

        $existingLog = LogKonsumsiObat::query()->where([
            'reminder_obat_id' => $validated['reminder_obat_id'],
            'tanggal' => $validated['tanggal'],
            'waktu' => $validated['waktu'],
        ])->first();

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

        if ($validated['status'] === 'diminum' && (!$existingLog || $existingLog->status !== 'diminum')) {
            $reminder = \App\Models\ReminderObat::query()->findOrFail($validated['reminder_obat_id']);
            $perDose = max(0.25, (float) ($reminder->jumlah_per_minum ?? 1));
            $reminder->jumlah_obat = max(0, (float) $reminder->jumlah_obat - $perDose);
            $reminder->save();
        }

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
            $logsObat = LogKonsumsiObat::where('pasien_id', $pasienId)
                ->whereBetween('tanggal', [$weekStart->toDateString(), $weekEnd->toDateString()])
                ->get();
            $scoreObat = $logsObat->sum('skor');
            $countObat = $logsObat->count();
            $percentageObat = $countObat > 0 ? round(($scoreObat / $countObat) * 100, 2) : 0;

            // CAIRAN Stats - based on total ml (>= 900 is PATUH)
            $logsCairan = RekapanCairan::where('pasien_id', $pasienId)
                ->get();
            $logsCairan = $logsCairan->filter(function (RekapanCairan $item) use ($weekStart, $weekEnd) {
                $entryDate = Carbon::parse($item->tanggal ?? $item->created_at);

                return $entryDate->betweenIncluded($weekStart->copy()->startOfDay(), $weekEnd->copy()->endOfDay());
            });
            $totalMlCairan = $logsCairan->sum('jumlah_ml');
            $countCairan = $logsCairan->count();
            $statusCairan = $countCairan > 0 && $totalMlCairan >= 900 ? 'PATUH' : ($countCairan > 0 ? 'TIDAK_PATUH' : 'BELUM_ADA_DATA');

            $weeks[] = [
                'minggu_mulai' => $weekStart->toDateString(),
                'minggu_akhir' => $weekEnd->toDateString(),
                'obat' => [
                    'status_kepatuhan' => ($countObat > 0 && $percentageObat >= 80) ? 'PATUH' : ($countObat > 0 ? 'TIDAK_PATUH' : 'BELUM_ADA_DATA'),
                    'persentase' => $percentageObat,
                ],
                'cairan' => [
                    'status_kepatuhan' => $statusCairan,
                    'total_ml' => $totalMlCairan,
                    'target_ml' => 900,
                ]
            ];

            $currentDate->addDays(7);
        }

        return response()->json([
            'pasien_id' => $pasienId,
            'weeks' => $weeks
        ]);
    }
    /**
     * Get summary for the "Today" dashboard
     */
    public function todaySummary(Request $request): JsonResponse
    {
        $today = now()->toDateString();

        // 1. Reminder Stats Today (Medicine)
        $totalReminders = DB::table('reminder_obat')->count();
        $logsToday = LogKonsumsiObat::where('tanggal', $today)->get();

        $takenCount = $logsToday->where('status', 'diminum')->count();
        $missedCount = $logsToday->where('status', 'terlewat')->count();
        $notYetCount = max(0, $totalReminders - $logsToday->count());

        // 2. Alert Count (Patients who missed medication today)
        $problematicPatientIds = LogKonsumsiObat::where('tanggal', $today)
            ->where('status', 'terlewat')
            ->distinct()
            ->pluck('pasien_id');

        // Patients with 2+ consecutive missed days
        $criticalPatientIds = LogKonsumsiObat::where('status', 'terlewat')
            ->whereBetween('tanggal', [now()->subDays(2)->toDateString(), $today])
            ->groupBy('pasien_id')
            ->having(DB::raw('count(*)'), '>=', 2)
            ->pluck('pasien_id');

        $allAlertPatientIds = $problematicPatientIds->merge($criticalPatientIds)->unique();

        $problematicPatients = Pasien::whereIn('id', $allAlertPatientIds)
            ->with(['logsObat' => function($q) use ($today) {
                $q->where('tanggal', $today)->latest();
            }])
            ->get()
            ->map(function($p) {
                $p->last_status = $p->logsObat->first()?->status ?? 'Belum ada data';
                return $p;
            });

        // 3. Recent Activity (Patients added in last 7 days)
        $recentActivity = Pasien::latest()->limit(5)->get()->map(function($p) {
            return [
                'id' => $p->id,
                'title' => 'Pasien Baru: ' . $p->nama,
                'time' => $p->created_at->diffForHumans(),
                'type' => 'new_patient'
            ];
        });

        return response()->json([
            'today' => [
                'total' => $totalReminders,
                'taken' => $takenCount,
                'missed' => $missedCount,
                'pending' => $notYetCount,
            ],
            'alerts' => [
                'count' => $allAlertPatientIds->count(),
                'patients' => $problematicPatients
            ],
            'recent_activity' => $recentActivity
        ]);
    }
}
