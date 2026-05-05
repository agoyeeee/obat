<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\RekapKuisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RekapKuisionerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RekapKuisioner::query()->with(['pasien']);

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
            'pasien_id' => ['required', 'integer', 'exists:pasien,id'],
            'tanggal' => ['required', 'date'],
            'jawaban' => ['required', 'array'],
            'jawaban.tahap_1_identitas' => ['required', 'array'],
            'jawaban.tahap_2_riwayat' => ['required', 'array'],
            'jawaban.tahap_3_efek_samping' => ['required', 'array'],
        ]);

        $rekap = DB::transaction(function () use ($validated) {
            $tahap1 = $validated['jawaban']['tahap_1_identitas'];
            $tahap2 = $validated['jawaban']['tahap_2_riwayat'];
            $tahap3 = $validated['jawaban']['tahap_3_efek_samping'];

            $pasien = Pasien::query()->findOrFail((int) $validated['pasien_id']);
            $pasien->update([
                'nama' => $tahap1['nama'] ?? $pasien->nama,
                'usia' => isset($tahap1['usia']) ? (int) $tahap1['usia'] : $pasien->usia,
                'jenis_kelamin' => $tahap1['jenis_kelamin'] ?? $pasien->jenis_kelamin,
                'berat_badan' => $pasien->berat_badan,
                'tgl_diagnosa' => $pasien->tgl_diagnosa,
                'tgl_lahir' => $tahap1['tanggal_lahir'] ?? $pasien->tgl_lahir,
                'status_pernikahan' => $tahap1['status'] ?? $pasien->status_pernikahan,
                'suku' => $tahap1['suku'] ?? $pasien->suku,
                'pendidikan' => $tahap1['pendidikan'] ?? $pasien->pendidikan,
                'pekerjaan' => $tahap1['pekerjaan'] ?? $pasien->pekerjaan,
                'nomor_hp' => $tahap1['nomor_hp'] ?? $pasien->nomor_hp,
                'pendapatan' => $tahap1['pendapatan'] ?? $pasien->pendapatan,
            ]);

            return RekapKuisioner::query()->create([
                'pasien_id' => $pasien->id,
                'tanggal' => $validated['tanggal'],
                'total_skor' => 0,
                'tahap_1_identitas' => $tahap1,
                'tahap_2_riwayat' => $tahap2,
                'tahap_3_efek_samping' => $tahap3,
            ]);
        });

        return response()->json($rekap->load('pasien'), 201);
    }

    /**
     * Tampilkan detail rekap kuisioner beserta semua jawaban.
     */
    public function show(int $id): JsonResponse
    {
        $rekap = RekapKuisioner::query()
            ->with(['pasien'])
            ->findOrFail($id);

        return response()->json($rekap);
    }

    /**
     * Public endpoint untuk get past responses by pasien_id (tanpa auth)
     */
    public function publicByPasien($pasienId): JsonResponse
    {
        $rekaps = RekapKuisioner::query()
            ->with(['pasien'])
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
            'pasien_id' => ['required', 'integer', 'exists:pasien,id'],
            'tanggal' => ['required', 'date'],
            'jawaban' => ['required', 'array'],
            'jawaban.tahap_1_identitas' => ['required', 'array'],
            'jawaban.tahap_2_riwayat' => ['required', 'array'],
            'jawaban.tahap_3_efek_samping' => ['required', 'array'],
        ]);

        $rekap = DB::transaction(function () use ($validated) {
            $tahap1 = $validated['jawaban']['tahap_1_identitas'];
            $tahap2 = $validated['jawaban']['tahap_2_riwayat'];
            $tahap3 = $validated['jawaban']['tahap_3_efek_samping'];

            $pasien = Pasien::query()->findOrFail((int) $validated['pasien_id']);
            $pasien->update([
                'nama' => $tahap1['nama'] ?? $pasien->nama,
                'usia' => isset($tahap1['usia']) ? (int) $tahap1['usia'] : $pasien->usia,
                'jenis_kelamin' => $tahap1['jenis_kelamin'] ?? $pasien->jenis_kelamin,
                'berat_badan' => $pasien->berat_badan,
                'tgl_diagnosa' => $pasien->tgl_diagnosa,
                'tgl_lahir' => $tahap1['tanggal_lahir'] ?? $pasien->tgl_lahir,
                'status_pernikahan' => $tahap1['status'] ?? $pasien->status_pernikahan,
                'suku' => $tahap1['suku'] ?? $pasien->suku,
                'pendidikan' => $tahap1['pendidikan'] ?? $pasien->pendidikan,
                'pekerjaan' => $tahap1['pekerjaan'] ?? $pasien->pekerjaan,
                'nomor_hp' => $tahap1['nomor_hp'] ?? $pasien->nomor_hp,
                'pendapatan' => $tahap1['pendapatan'] ?? $pasien->pendapatan,
            ]);

            return RekapKuisioner::query()->create([
                'pasien_id' => $pasien->id,
                'tanggal' => $validated['tanggal'],
                'total_skor' => 0,
                'tahap_1_identitas' => $tahap1,
                'tahap_2_riwayat' => $tahap2,
                'tahap_3_efek_samping' => $tahap3,
            ]);
        });

        return response()->json($rekap->load('pasien'), 201);
    }

    /**
     * Public endpoint untuk show detail kuisioner response (tanpa auth)
     */
    public function publicShow($id): JsonResponse
    {
        $rekap = RekapKuisioner::query()
            ->with(['pasien'])
            ->findOrFail((int) $id);

        return response()->json($rekap);
    }
}
