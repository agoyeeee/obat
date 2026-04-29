<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MerkController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_merk' => ['required', 'string', 'max:255'],
            'obat_id' => ['required', 'integer', 'exists:obat,id'],
        ]);

        $merk = Merk::query()->create($validated);

        return response()->json($merk, 201);
    }
}
