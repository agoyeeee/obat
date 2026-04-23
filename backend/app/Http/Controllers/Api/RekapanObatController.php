<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RekapanObat;
use App\Models\ReminderObat;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekapanObatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RekapanObat::query()->with('pasien');

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', (int) $request->query('pasien_id'));
        }

        $rekapans = $query->orderByDesc('minggu_mulai')->get();

        return response()->json($rekapans);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'        => ['required', 'integer', 'exists:pasien,id'],
            'minggu_mulai'     => ['required', 'date'],
            'status_kepatuhan' => ['required', 'in:PATUH,TIDAK_PATUH'],
        ]);

        $rekapan = RekapanObat::query()->updateOrCreate(
            [
                'pasien_id'    => $validated['pasien_id'],
                'minggu_mulai' => $validated['minggu_mulai'],
            ],
            [
                'status_kepatuhan' => $validated['status_kepatuhan'],
            ]
        );

        return response()->json($rekapan, 201);
    }

    /**
     * Tampilkan detail rekapan mingguan beserta kepatuhan harian dari reminder_obat.
     */
    public function show(int $id): JsonResponse
    {
        $rekapan = RekapanObat::query()
            ->with('pasien')
            ->findOrFail($id);

        $mingguMulai = Carbon::parse($rekapan->minggu_mulai);
        $mingguAkhir = $mingguMulai->copy()->addDays(6);

        // Ambil detail kepatuhan harian dari reminder_obat
        $detailHarian = ReminderObat::query()
            ->where('pasien_id', $rekapan->pasien_id)
            ->with(['obat', 'merk', 'waktuKonsumsi'])
            ->get()
            ->map(fn ($reminder) => [
                'id'              => $reminder->id,
                'obat'            => $reminder->obat->nama_obat ?? null,
                'merk'            => $reminder->merk->nama_merk ?? null,
                'dosis'           => $reminder->dosis,
                'waktu'           => $reminder->waktuKonsumsi->label_waktu ?? null,
                'skor_kepatuhan'  => $reminder->skor_kepatuhan,
            ]);

        return response()->json([
            'rekapan'       => $rekapan,
            'minggu_mulai'  => $mingguMulai->toDateString(),
            'minggu_akhir'  => $mingguAkhir->toDateString(),
            'detail_harian' => $detailHarian,
        ]);
    }
}
