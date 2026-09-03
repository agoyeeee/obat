<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ObatController extends Controller
{
    public function publicList(): JsonResponse
    {
        $obats = Obat::query()
            ->select([
                'id',
                'nama_obat',
                'klasifikasi',
                'indikasi',
                'dosis_inisiasi',
                'dosis_lazim',
                'dosis_target',
                'frekuensi_default',
                'frekuensi_keterangan',
                'kontraindikasi',
                'efek_samping',
                'monitoring',
                'cara_pemakaian',
            ])
            ->with('merks:id,obat_id,nama_merk')
            ->orderBy('nama_obat')
            ->get();

        return response()->json($obats);
    }

    public function index(): JsonResponse
    {
        $obats = Obat::query()
            ->with('merks')
            ->orderBy('nama_obat')
            ->get();

        return response()->json($obats);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_obat' => ['required', 'string', 'max:255', 'unique:obat,nama_obat'],
            'klasifikasi' => ['nullable', 'string'],
            'indikasi' => ['required', 'string'],
            'dosis_inisiasi' => ['nullable'], // accept string or array; normalize below
            'dosis_lazim' => ['nullable', 'string'],
            'dosis_target' => ['nullable', 'string', 'max:100'],
            'frekuensi_default' => ['nullable', 'integer', 'min:1', 'max:24'],
            'frekuensi_keterangan' => ['nullable', 'string', 'max:100'],
            'kontraindikasi' => ['nullable', 'string'],
            'efek_samping' => ['nullable', 'string'],
            'monitoring' => ['nullable', 'string'],
            'cara_pemakaian' => ['nullable', 'string'],
        ]);

        $validated['dosis_inisiasi'] = $this->normalizeDosisInisiasi($request->input('dosis_inisiasi'));

        $obat = Obat::query()->create($validated);

        return response()->json($obat->load('merks'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $obat = Obat::query()
            ->with('merks')
            ->findOrFail($id);

        return response()->json($obat);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $obat = Obat::query()->findOrFail($id);

        $validated = $request->validate([
            'nama_obat' => ['required', 'string', 'max:255', Rule::unique('obat', 'nama_obat')->ignore($obat->id)],
            'klasifikasi' => ['nullable', 'string'],
            'indikasi' => ['required', 'string'],
            'dosis_inisiasi' => ['nullable'], // accept string or array; normalize below
            'dosis_lazim' => ['nullable', 'string'],
            'dosis_target' => ['nullable', 'string', 'max:100'],
            'frekuensi_default' => ['nullable', 'integer', 'min:1', 'max:24'],
            'frekuensi_keterangan' => ['nullable', 'string', 'max:100'],
            'kontraindikasi' => ['nullable', 'string'],
            'efek_samping' => ['nullable', 'string'],
            'monitoring' => ['nullable', 'string'],
            'cara_pemakaian' => ['nullable', 'string'],
        ]);

        $validated['dosis_inisiasi'] = $this->normalizeDosisInisiasi($request->input('dosis_inisiasi'));

        $obat->update($validated);

        return response()->json($obat->load('merks'));
    }

    public function destroy(int $id): JsonResponse
    {
        $obat = Obat::query()->findOrFail($id);
        $obat->delete();

        return response()->json(['message' => 'Data obat berhasil dihapus.']);
    }

    /** @return array<int, string>|null */
    private function normalizeDosisInisiasi(mixed $value): ?array
    {
        if ($value === null) {
            return null;
        }

        $values = is_array($value)
            ? $value
            : preg_split('/[\r\n,;]+/', (string) $value);

        $normalized = collect($values ?: [])
            ->map(fn ($item): string => trim((string) $item))
            ->filter()
            ->values()
            ->all();

        return $normalized === [] ? null : $normalized;
    }
}
