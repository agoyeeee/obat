<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RekapanCairan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekapanCairanController extends Controller
{
    private function resolveEntryDate(RekapanCairan $item): Carbon
    {
        return Carbon::parse($item->tanggal ?? $item->created_at);
    }

    public function index(Request $request): JsonResponse
    {
        $query = RekapanCairan::query()
            ->with('pasien');

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', (int) $request->query('pasien_id'));
        }

        $records = $query->orderByDesc('tanggal')->orderByDesc('waktu')->get();

        $rekapans = $records
            ->groupBy(fn (RekapanCairan $item) => $this->resolveEntryDate($item)->startOfWeek()->toDateString())
            ->map(function ($items, string $mingguMulai) {
                $totalMl = $items->sum('jumlah_ml');
                $statusKepatuhan = $totalMl >= 900 ? 'PATUH' : 'TIDAK_PATUH';
                $first = $items->first();

                return [
                    'id' => $first->id,
                    'pasien_id' => $first->pasien_id,
                    'minggu_mulai' => $mingguMulai,
                    'minggu_akhir' => Carbon::parse($mingguMulai)->addDays(6)->toDateString(),
                    'status_kepatuhan' => $statusKepatuhan,
                    'total_ml' => $totalMl,
                    'target_ml' => 900,
                ];
            })
            ->values();

        return response()->json($rekapans);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'        => ['required', 'integer', 'exists:pasien,id'],
            'tanggal'          => ['required', 'date_format:Y-m-d'],
            'waktu'            => ['required', 'date_format:H:i:s'],
            'minuman'          => ['required', 'string', 'max:100'],
            'jumlah_ml'        => ['required', 'integer', 'min:1'],
            'catatan_asupan'   => ['nullable', 'string', 'max:255'],
        ]);

        $rekapan = RekapanCairan::query()->updateOrCreate(
            [
                'pasien_id' => $validated['pasien_id'],
                'tanggal'   => $validated['tanggal'],
                'waktu'     => $validated['waktu'],
            ],
            [
                'minggu_mulai' => Carbon::parse($validated['tanggal'])->startOfWeek()->toDateString(),
                'minuman' => $validated['minuman'],
                'jumlah_ml' => (int) $validated['jumlah_ml'],
                'catatan_asupan' => $validated['catatan_asupan'] ?? null,
                'status_kepatuhan' => null,
            ]
        );

        return response()->json($rekapan, 201);
    }

    /**
     * Tampilkan detail rekapan mingguan beserta kepatuhan harian dari rekapan_cairan.
     * Kepatuhan dihitung dari total jumlah_ml dalam minggu: >= 900 = PATUH, < 900 = TIDAK_PATUH
     */
    public function show(int $id): JsonResponse
    {
        $rekapan = RekapanCairan::query()
            ->with('pasien')
            ->findOrFail($id);

        $mingguMulai = $this->resolveEntryDate($rekapan);
        $mingguAkhir = $mingguMulai->copy()->addDays(6);

        // Ambil detail asupan harian dari rekapan_cairan
        $logsForWeek = RekapanCairan::query()
            ->where('pasien_id', $rekapan->pasien_id)
            ->get();

        $logsForWeek = $logsForWeek->filter(function (RekapanCairan $item) use ($mingguMulai, $mingguAkhir) {
            $entryDate = $this->resolveEntryDate($item);

            return $entryDate->betweenIncluded($mingguMulai->copy()->startOfDay(), $mingguAkhir->copy()->endOfDay());
        })->values();

        $totalMlWeek = $logsForWeek->sum('jumlah_ml');
        $statusKepatuhan = $totalMlWeek >= 900 ? 'PATUH' : 'TIDAK_PATUH';

        $detailHarian = $logsForWeek->map(fn (RekapanCairan $log) => [
            'id' => $log->id,
            'pasien_id' => $log->pasien_id,
            'minggu_mulai' => $log->minggu_mulai,
            'jumlah_ml' => $log->jumlah_ml,
            'minuman' => $log->minuman,
            'waktu' => $log->waktu,
            'tanggal' => $this->resolveEntryDate($log)->toDateString(),
            'catatan_asupan' => $log->catatan_asupan,
            'status_kepatuhan' => $statusKepatuhan,
        ]);

        return response()->json([
            'rekapan' => $rekapan,
            'minggu_mulai' => $mingguMulai->startOfWeek()->toDateString(),
            'minggu_akhir' => $mingguAkhir->toDateString(),
            'total_ml' => $totalMlWeek,
            'status_kepatuhan' => $statusKepatuhan,
            'detail_harian' => $detailHarian,
        ]);
    }
}
