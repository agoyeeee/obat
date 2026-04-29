<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JawabanKuisioner;
use App\Models\RekapKuisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekapKuisionerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RekapKuisioner::query()->with(['pasien', 'jawabanKuisioner.kuisioner']);

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', (int) $request->query('pasien_id'));
        }

        $rekaps = $query->orderByDesc('tanggal')->get();

        return response()->json($rekaps);
    }

    /**
     * Submit rekap kuisioner beserta semua jawaban sekaligus.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'              => ['required', 'integer', 'exists:pasien,id'],
            'tanggal'                => ['required', 'date'],
            'jawaban'                => ['required', 'array', 'min:1'],
            'jawaban.*.kuisioner_id' => ['required', 'integer', 'exists:kuisioner,id'],
            'jawaban.*.jawaban'      => ['required', 'string'],
            'jawaban.*.skor'         => ['required', 'integer', 'min:0'],
        ]);

        $totalSkor = collect($validated['jawaban'])->sum('skor');

        $rekap = RekapKuisioner::query()->create([
            'pasien_id'  => $validated['pasien_id'],
            'tanggal'    => $validated['tanggal'],
            'total_skor' => $totalSkor,
        ]);

        foreach ($validated['jawaban'] as $jawaban) {
            JawabanKuisioner::query()->create([
                'rekap_kuisioner_id' => $rekap->id,
                'kuisioner_id'       => $jawaban['kuisioner_id'],
                'jawaban'            => $jawaban['jawaban'],
                'skor'               => $jawaban['skor'],
            ]);
        }

        return response()->json($rekap->load('jawabanKuisioner.kuisioner'), 201);
    }

    /**
     * Tampilkan detail rekap kuisioner beserta semua jawaban.
     */
    public function show(int $id): JsonResponse
    {
        $rekap = RekapKuisioner::query()
            ->with(['pasien', 'jawabanKuisioner.kuisioner'])
            ->findOrFail($id);

        return response()->json($rekap);
    }

    /**
     * Public endpoint untuk get past responses by pasien_id (tanpa auth)
     */
    public function publicByPasien($pasienId): JsonResponse
    {
        $rekaps = RekapKuisioner::query()
            ->with(['jawabanKuisioner.kuisioner'])
            ->where('pasien_id', (int) $pasienId)
            ->orderByDesc('tanggal')
            ->get();

        return response()->json($rekaps);
    }

    /**
     * Public endpoint untuk submit kuisioner answers (tanpa auth)
     */
    public function publicStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'              => ['required', 'integer', 'exists:pasien,id'],
            'tanggal'                => ['required', 'date'],
            'jawaban'                => ['required', 'array', 'min:1'],
            'jawaban.*.kuisioner_id' => ['required', 'integer', 'exists:kuisioner,id'],
            'jawaban.*.jawaban'      => ['required', 'string'],
            'jawaban.*.skor'         => ['required', 'integer', 'min:0'],
        ]);

        $totalSkor = collect($validated['jawaban'])->sum('skor');

        $rekap = RekapKuisioner::query()->create([
            'pasien_id'  => $validated['pasien_id'],
            'tanggal'    => $validated['tanggal'],
            'total_skor' => $totalSkor,
        ]);

        foreach ($validated['jawaban'] as $jawaban) {
            JawabanKuisioner::query()->create([
                'rekap_kuisioner_id' => $rekap->id,
                'kuisioner_id'       => $jawaban['kuisioner_id'],
                'jawaban'            => $jawaban['jawaban'],
                'skor'               => $jawaban['skor'],
            ]);
        }

        return response()->json($rekap->load('jawabanKuisioner.kuisioner'), 201);
    }

    /**
     * Public endpoint untuk show detail kuisioner response (tanpa auth)
     */
    public function publicShow($id): JsonResponse
    {
        $rekap = RekapKuisioner::query()
            ->with(['jawabanKuisioner.kuisioner'])
            ->findOrFail((int) $id);

        return response()->json($rekap);
    }
}
