<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
