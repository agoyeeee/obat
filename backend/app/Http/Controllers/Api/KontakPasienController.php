<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KontakPasien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KontakPasienController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $apoteker = $request->user();

        $kontaks = KontakPasien::query()
            ->where('apoteker_id', $apoteker->id)
            ->with('pasien')
            ->get();

        return response()->json($kontaks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id' => ['required', 'integer', 'exists:pasien,id'],
        ]);

        $apoteker = $request->user();

        // Cek apakah sudah terhubung
        $exists = KontakPasien::query()
            ->where('apoteker_id', $apoteker->id)
            ->where('pasien_id', $validated['pasien_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Pasien sudah terhubung dengan apoteker ini.'], 422);
        }

        $kontak = KontakPasien::query()->create([
            'pasien_id'   => $validated['pasien_id'],
            'apoteker_id' => $apoteker->id,
        ]);

        return response()->json($kontak->load('pasien'), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $kontak = KontakPasien::query()->findOrFail($id);
        $kontak->delete();

        return response()->json(['message' => 'Kontak pasien berhasil dihapus.']);
    }
}
