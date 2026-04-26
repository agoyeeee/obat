<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use Illuminate\Http\JsonResponse;

class ObatController extends Controller
{
    public function publicList(): JsonResponse
    {
        $obats = Obat::query()
            ->select(['id', 'nama_obat', 'dosis_target', 'dosis_inisiasi', 'frekuensi_default'])
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

    public function show(int $id): JsonResponse
    {
        $obat = Obat::query()
            ->with('merks')
            ->findOrFail($id);

        return response()->json($obat);
    }
}
