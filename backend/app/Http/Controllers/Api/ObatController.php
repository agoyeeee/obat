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
            ->select(['id', 'nama_obat', 'dosis_target', 'dosis_inisiasi', 'frekuensi_default'])
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
            'indikasi' => ['required', 'string'],
            'dosis_inisiasi' => ['required'], // accept string or array; normalize below
            'dosis_target' => ['required', 'string', 'max:100'],
            'frekuensi_default' => ['required', 'integer', 'min:1', 'max:24'],
            'kontraindikasi' => ['nullable', 'string'],
            'efek_samping' => ['nullable', 'string'],
            'monitoring' => ['nullable', 'string'],
        ]);

        // Normalize dosis_inisiasi: if array provided, join into newline-separated string
        $dosisInisiasiInput = $request->input('dosis_inisiasi');
        if (is_array($dosisInisiasiInput)) {
            $validated['dosis_inisiasi'] = collect($dosisInisiasiInput)->map(fn($v) => (string) $v)->filter()->implode("\n");
        } else {
            $validated['dosis_inisiasi'] = (string) $dosisInisiasiInput;
        }

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
            'indikasi' => ['required', 'string'],
            'dosis_inisiasi' => ['required'], // accept string or array; normalize below
            'dosis_target' => ['required', 'string', 'max:100'],
            'frekuensi_default' => ['required', 'integer', 'min:1', 'max:24'],
            'kontraindikasi' => ['nullable', 'string'],
            'efek_samping' => ['nullable', 'string'],
            'monitoring' => ['nullable', 'string'],
        ]);

        $dosisInisiasiInput = $request->input('dosis_inisiasi');
        if (is_array($dosisInisiasiInput)) {
            $validated['dosis_inisiasi'] = collect($dosisInisiasiInput)->map(fn($v) => (string) $v)->filter()->implode("\n");
        } else {
            $validated['dosis_inisiasi'] = (string) $dosisInisiasiInput;
        }

        $obat->update($validated);

        return response()->json($obat->load('merks'));
    }

    public function destroy(int $id): JsonResponse
    {
        $obat = Obat::query()->findOrFail($id);
        $obat->delete();

        return response()->json(['message' => 'Data obat berhasil dihapus.']);
    }
}
