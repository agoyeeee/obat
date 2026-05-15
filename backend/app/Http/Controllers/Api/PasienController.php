<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogKonsumsiCairan;
use App\Models\LogKonsumsiObat;
use App\Models\Pasien;
use App\Models\ReminderCairan;
use App\Models\ReminderObat;
use App\Models\Obat;
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

    public function publicUpdate(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nama'          => ['required', 'string', 'max:100'],
            'usia'          => ['required', 'integer', 'min:0'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'berat_badan'   => ['required', 'numeric', 'min:0'],
            'tgl_diagnosa'  => ['required', 'date'],
        ]);

        $pasien = Pasien::query()->findOrFail($id);
        $pasien->update($validated);

        return response()->json([
            'message' => 'Biodata pasien berhasil diperbarui.',
            'data' => $pasien,
        ]);
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
            'reminders.*.server_id' => ['nullable', 'integer', 'exists:reminder_obat,id'],
            'reminders.*.obat_id' => ['required', 'integer', 'exists:obat,id'],
            'reminders.*.merk_id' => ['nullable', 'integer', 'exists:merk,id'],
            'reminders.*.dosis' => ['required', 'string', 'max:100'],
            'reminders.*.sediaan' => ['required', 'string', 'max:100'],
            'reminders.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'reminders.*.jumlah_per_minum' => ['nullable', 'integer', 'min:1'],
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

                $reminderData = [
                    'pasien_id' => $pasien->id,
                    'obat_id' => (int) $item['obat_id'],
                    'merk_id' => isset($item['merk_id']) ? (int) $item['merk_id'] : null,
                    'dosis' => $item['dosis'],
                    'sediaan' => $item['sediaan'],
                    'jumlah_obat' => (int) $item['jumlah_obat'],
                    'jumlah_per_minum' => (int) ($item['jumlah_per_minum'] ?? 1),
                    'waktu_konsumsi_id' => $waktu->id,
                ];

                // If client sent aturan_minum (previously mapped to cara_pemakaian on reminder),
                // store it on the obat record so obat contains default usage instructions.
                if (!empty($item['aturan_minum'])) {
                    $obat = Obat::query()->find((int) $item['obat_id']);
                    if ($obat) {
                        $obat->update(['cara_pemakaian' => $item['aturan_minum']]);
                    }
                }

                if (!empty($item['server_id'])) {
                    $reminder = ReminderObat::query()->findOrFail((int) $item['server_id']);
                    $reminder->update($reminderData);
                } else {
                    $reminder = ReminderObat::query()->create($reminderData);
                }

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
        $existingLog = LogKonsumsiObat::query()->where([
            'reminder_obat_id' => $reminder->id,
            'tanggal' => $tanggal,
            'waktu' => $waktu,
        ])->first();

        if ($alarmWaktu && $status === 'diminum' && $skor === 0) {
            $status = 'terlewat';
        }

        if ($status === 'diminum' && (!$existingLog || $existingLog->status !== 'diminum')) {
            $perDose = max(1, (int) ($reminder->jumlah_per_minum ?? 1));
            $reminder->jumlah_obat = max(0, (int) $reminder->jumlah_obat - $perDose);
            $reminder->save();
        }

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

    public function publicLogKonsumsiCairan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient' => ['required', 'array'],
            'patient.nama' => ['required', 'string', 'max:100'],
            'patient.usia' => ['required', 'integer', 'min:0'],
            'patient.jenis_kelamin' => ['required', 'in:L,P'],
            'patient.berat_badan' => ['required', 'numeric', 'min:0'],
            'patient.tgl_diagnosa' => ['required', 'date'],
            'tanggal' => ['required', 'date_format:Y-m-d'],
            'waktu' => ['required', 'date_format:H:i:s'],
            'catatan_asupan' => ['nullable', 'string', 'max:255'],
            'minuman' => ['required', 'string', 'max:100'],
            'jumlah_ml' => ['required', 'integer', 'min:1'],
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

            $reminder = ReminderCairan::query()->create([
                'pasien_id' => $pasien->id,
                'jumlah_ml' => (int) $validated['jumlah_ml'],
                'waktu' => $validated['waktu'],
                'minuman' => $validated['minuman'],
                'catatan_asupan' => $validated['catatan_asupan'] ?? null,
            ]);

            $log = LogKonsumsiCairan::query()->create([
                'reminder_cairan_id' => $reminder->id,
                'pasien_id' => $pasien->id,
                'tanggal' => $validated['tanggal'],
                'waktu' => $validated['waktu'],
                'status' => 'diminum',
                'skor' => 1,
                'minuman' => $validated['minuman'],
                'catatan_asupan' => $validated['catatan_asupan'] ?? null,
                'jumlah_ml' => (int) $validated['jumlah_ml'],
            ]);

            return [
                'pasien_id' => $pasien->id,
                'reminder' => $reminder,
                'log' => $log,
            ];
        });

        return response()->json([
            'message' => 'Log konsumsi cairan berhasil disimpan.',
            'data' => $result,
        ], 201);
    }

    public function publicSyncReminderCairan(Request $request): JsonResponse
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
            'reminders.*.server_id' => ['nullable', 'integer', 'exists:reminder_cairan,id'],
            'reminders.*.tanggal' => ['required', 'date_format:Y-m-d'],
            'reminders.*.waktu' => ['required', 'date_format:H:i:s'],
            'reminders.*.catatan_asupan' => ['nullable', 'string', 'max:255'],
            'reminders.*.minuman' => ['required', 'string', 'max:100'],
            'reminders.*.jumlah_ml' => ['required', 'integer', 'min:1'],
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
                $reminderData = [
                    'pasien_id' => $pasien->id,
                    'jumlah_ml' => (int) $item['jumlah_ml'],
                    'waktu' => $item['waktu'],
                    'minuman' => $item['minuman'],
                    'catatan_asupan' => $item['catatan_asupan'] ?? null,
                ];

                if (!empty($item['server_id'])) {
                    $reminder = ReminderCairan::query()->findOrFail((int) $item['server_id']);
                    $reminder->update($reminderData);
                } else {
                    $reminder = ReminderCairan::query()->create($reminderData);
                }

                $synced[] = $item['local_id'];
                $serverMap[$item['local_id']] = $reminder->id;
            }

            return [
                'pasien_id' => $pasien->id,
                'synced_local_ids' => $synced,
                'server_map' => $serverMap,
                'reminders' => ReminderCairan::query()->where('pasien_id', $pasien->id)->latest()->limit(count($synced))->get(),
            ];
        });

        return response()->json([
            'message' => 'Sinkronisasi reminder cairan berhasil.',
            'data' => $result,
        ]);
    }

    public function publicListLogKonsumsiCairan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient' => ['required', 'array'],
            'patient.nama' => ['required', 'string', 'max:100'],
            'patient.tgl_diagnosa' => ['required', 'date'],
        ]);

        $patientData = $validated['patient'];

        $pasien = Pasien::query()
            ->where('nama', $patientData['nama'])
            ->whereDate('tgl_diagnosa', $patientData['tgl_diagnosa'])
            ->first();

        if (!$pasien) {
            return response()->json([]);
        }

        $logs = LogKonsumsiCairan::query()
            ->with('reminderCairan')
            ->where('pasien_id', $pasien->id)
            ->orderByDesc('tanggal')
            ->orderByDesc('waktu')
            ->limit(100)
            ->get();

        return response()->json($logs);
    }

    public function publicLogKonsumsiCairanAlarm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reminder_cairan_id' => ['required', 'integer', 'exists:reminder_cairan,id'],
            'status' => ['nullable', 'in:diminum,terlewat'],
            'logged_at' => ['nullable', 'date'],
            'tanggal' => ['nullable', 'date_format:Y-m-d'],
            'waktu' => ['nullable', 'date_format:H:i:s'],
        ]);

        $reminder = ReminderCairan::query()->findOrFail((int) $validated['reminder_cairan_id']);
        $status = $validated['status'] ?? 'diminum';
        $loggedAt = isset($validated['logged_at'])
            ? Carbon::parse($validated['logged_at'])
            : now();

        $tanggal = $validated['tanggal'] ?? $loggedAt->toDateString();
        $waktu = $validated['waktu'] ?? $loggedAt->format('H:i:s');

        $log = LogKonsumsiCairan::query()->updateOrCreate(
            [
                'reminder_cairan_id' => $reminder->id,
                'tanggal' => $tanggal,
                'waktu' => $waktu,
            ],
            [
                'pasien_id' => $reminder->pasien_id,
                'status' => $status,
                'skor' => $status === 'diminum' ? 1 : 0,
                'minuman' => $reminder->minuman,
                'jumlah_ml' => $reminder->jumlah_ml,
                'catatan_asupan' => $reminder->catatan_asupan,
            ]
        );

        return response()->json([
            'message' => 'Log konsumsi cairan dari alarm berhasil disimpan.',
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

        return $diffMinutes <= 5 ? 1 : 0;
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
