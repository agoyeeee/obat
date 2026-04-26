<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogKonsumsiObat;
use App\Models\Pasien;
use App\Models\ReminderObat;
use App\Models\WaktuKonsumsi;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PasienController extends Controller
{
    public function publicStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'          => ['required', 'string', 'max:100'],
            'usia'          => ['required', 'integer', 'min:0'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'berat_badan'   => ['required', 'numeric', 'min:0'],
            'tgl_diagnosa'  => ['required', 'date'],
        ]);

        $pasien = Pasien::query()->create($validated);

        return response()->json([
            'message' => 'Biodata pasien berhasil disimpan.',
            'data' => $pasien,
        ], 201);
    }

    public function publicSyncReminderObat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient' => ['required', 'array'],
            'patient.nama' => ['required', 'string', 'max:100'],
            'patient.usia' => ['required', 'integer', 'min:0'],
            'patient.jenis_kelamin' => ['required', 'in:L,P'],
            'patient.berat_badan' => ['required', 'numeric', 'min:0'],
            'patient.tgl_diagnosa' => ['required', 'date'],
            'reminders' => ['required', 'array', 'min:1'],
            'reminders.*.local_id' => ['required', 'string'],
            'reminders.*.obat_id' => ['required', 'integer', 'exists:obat,id'],
            'reminders.*.dosis' => ['required', 'string', 'max:100'],
            'reminders.*.sediaan' => ['required', 'string', 'max:100'],
            'reminders.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'reminders.*.frekuensi' => ['required', 'integer', 'min:1', 'max:24'],
            'reminders.*.waktu_konsumsi' => ['required', 'string', 'max:255'],
            'reminders.*.aturan_minum' => ['required', 'string', 'max:255'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $patientData = $validated['patient'];

            $pasien = Pasien::query()->firstOrCreate(
                [
                    'nama' => $patientData['nama'],
                    'tgl_diagnosa' => $patientData['tgl_diagnosa'],
                ],
                [
                    'usia' => $patientData['usia'],
                    'jenis_kelamin' => $patientData['jenis_kelamin'],
                    'berat_badan' => $patientData['berat_badan'],
                ]
            );

            $pasien->update([
                'usia' => $patientData['usia'],
                'jenis_kelamin' => $patientData['jenis_kelamin'],
                'berat_badan' => $patientData['berat_badan'],
            ]);

            $synced = [];
            $serverMap = [];

            foreach ($validated['reminders'] as $item) {
                $sqlTime = $this->normalizeTimeFromText($item['waktu_konsumsi']);

                $waktu = WaktuKonsumsi::query()->firstOrCreate(
                    [
                        'jam' => $sqlTime,
                        'frekuensi' => (int) $item['frekuensi'],
                    ],
                    [
                        'label_waktu' => 'Sinkron Pasien',
                    ]
                );

                $reminder = ReminderObat::query()->create([
                    'pasien_id' => $pasien->id,
                    'obat_id' => (int) $item['obat_id'],
                    'merk_id' => null,
                    'dosis' => $item['dosis'],
                    'sediaan' => $item['sediaan'],
                    'jumlah_obat' => (int) $item['jumlah_obat'],
                    'waktu_konsumsi_id' => $waktu->id,
                    'cara_pemakaian' => $item['aturan_minum'],
                ]);

                $synced[] = $item['local_id'];
                $serverMap[$item['local_id']] = $reminder->id;
            }

            return [
                'pasien_id' => $pasien->id,
                'synced_local_ids' => $synced,
                'server_map' => $serverMap,
            ];
        });

        return response()->json([
            'message' => 'Sinkronisasi reminder obat berhasil.',
            'data' => $result,
        ]);
    }

    public function publicLogKonsumsiObat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reminder_obat_id' => ['required', 'integer', 'exists:reminder_obat,id'],
            'status' => ['nullable', 'in:diminum,terlewat'],
            'logged_at' => ['nullable', 'date'],
            'tanggal' => ['nullable', 'date_format:Y-m-d'],
            'waktu' => ['nullable', 'date_format:H:i:s'],
            'alarm_waktu' => ['nullable', 'date_format:H:i:s'],
        ]);

        $reminder = ReminderObat::query()->findOrFail((int) $validated['reminder_obat_id']);
        $status = $validated['status'] ?? 'diminum';
        $loggedAt = isset($validated['logged_at'])
            ? Carbon::parse($validated['logged_at'])
            : now();
        $tanggal = $validated['tanggal'] ?? $loggedAt->toDateString();
        $waktu = $validated['waktu'] ?? $loggedAt->format('H:i:s');
        $alarmWaktu = $validated['alarm_waktu'] ?? null;
        $skor = $this->calculateSkorFromAlarmTime($tanggal, $waktu, $alarmWaktu);

        $log = LogKonsumsiObat::query()->updateOrCreate(
            [
                'reminder_obat_id' => $reminder->id,
                'tanggal' => $tanggal,
                'waktu' => $waktu,
            ],
            [
                'pasien_id' => $reminder->pasien_id,
                'status' => $status,
                'skor' => $skor,
            ]
        );

        return response()->json([
            'message' => 'Log konsumsi obat berhasil disimpan.',
            'data' => $log,
        ]);
    }

    private function normalizeTimeFromText(string $waktuKonsumsi): string
    {
        if (preg_match('/(\d{1,2})[\.:](\d{2})/', $waktuKonsumsi, $matches) === 1) {
            $hour = max(0, min(23, (int) $matches[1]));
            $minute = max(0, min(59, (int) $matches[2]));

            return sprintf('%02d:%02d:00', $hour, $minute);
        }

        return '07:00:00';
    }

    private function calculateSkorFromAlarmTime(string $tanggal, string $waktuStop, ?string $alarmWaktu): int
    {
        if (!$alarmWaktu) {
            return 0;
        }

        $alarmAt = Carbon::createFromFormat('Y-m-d H:i:s', $tanggal . ' ' . $alarmWaktu);
        $stoppedAt = Carbon::createFromFormat('Y-m-d H:i:s', $tanggal . ' ' . $waktuStop);

        $diffMinutes = $alarmAt->diffInMinutes($stoppedAt, false);

        if ($diffMinutes < 0) {
            return 0;
        }

        return $diffMinutes <= 15 ? 1 : 0;
    }

    public function index(Request $request): JsonResponse
    {
        $apoteker = $request->user();
        $startDate = now()->startOfWeek();
        $endDate = now()->endOfWeek();

        // Tampilkan pasien yang terhubung dengan apoteker ini
        $pasiens = $apoteker->pasiens()
            ->with(['logsObat' => function($q) use ($startDate, $endDate) {
                $q->whereBetween('tanggal', [$startDate->toDateString(), $endDate->toDateString()]);
            }])
            ->withCount('reminderObat')
            ->orderBy('nama')
            ->get()
            ->map(function($pasien) {
                // Kalkulasi kepatuhan mingguan secara dinamis untuk dashboard
                $totalScore = $pasien->logsObat->sum('skor');
                $totalLogs = $pasien->logsObat->count();

                $percentage = $totalLogs > 0 ? ($totalScore / $totalLogs) * 100 : 0;
                $status = ($totalLogs > 0 && $percentage >= 80) ? 'PATUH' : ($totalLogs > 0 ? 'TIDAK_PATUH' : 'BELUM_ADA_DATA');

                // Format agar kompatibel dengan frontend yang lama (rekapan_obat[0])
                $pasien->rekapan_obat = [
                    ['status_kepatuhan' => $status]
                ];
                return $pasien;
            });

        return response()->json($pasiens);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'          => ['required', 'string', 'max:100'],
            'usia'          => ['required', 'integer', 'min:0'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'berat_badan'   => ['required', 'numeric', 'min:0'],
            'tgl_diagnosa'  => ['required', 'date'],
        ]);

        $pasien = Pasien::query()->create($validated);

        // Otomatis hubungkan pasien dengan apoteker yang membuat
        $request->user()->pasiens()->attach($pasien->id);

        return response()->json($pasien, 201);
    }

    public function show(int $id): JsonResponse
    {
        $pasien = Pasien::query()
            ->with(['reminderObat.obat', 'reminderObat.merk', 'reminderObat.waktuKonsumsi', 'reminderCairan'])
            ->findOrFail($id);

        return response()->json($pasien);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $pasien = Pasien::query()->findOrFail($id);

        $validated = $request->validate([
            'nama'          => ['sometimes', 'string', 'max:100'],
            'usia'          => ['sometimes', 'integer', 'min:0'],
            'jenis_kelamin' => ['sometimes', 'in:L,P'],
            'berat_badan'   => ['sometimes', 'numeric', 'min:0'],
            'tgl_diagnosa'  => ['sometimes', 'date'],
        ]);

        $pasien->update($validated);

        return response()->json($pasien);
    }

    public function destroy(int $id): JsonResponse
    {
        $pasien = Pasien::query()->findOrFail($id);
        $pasien->delete();

        return response()->json(['message' => 'Pasien berhasil dihapus.']);
    }
}
