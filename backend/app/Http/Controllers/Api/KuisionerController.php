<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kuisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KuisionerController extends Controller
{
    public function index(): JsonResponse
    {
        $kuisioners = Kuisioner::query()->orderBy('id')->get();

        return response()->json($kuisioners);
    }

    /**
     * Public endpoint untuk fetch all kuisioner (tanpa auth)
     */
    public function publicIndex(): JsonResponse
    {
        $kuisioners = Kuisioner::query()->orderBy('id')->get();

        return response()->json($kuisioners);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pertanyaan' => ['required', 'string', 'max:1000'],
            'tipe' => ['required', 'string'],
            'opsi' => ['nullable', 'array'],
        ]);

        $kuisioner = Kuisioner::create([
            'pertanyaan' => $data['pertanyaan'],
            'tipe' => $data['tipe'],
            'opsi' => $data['opsi'] ?? null,
        ]);

        return response()->json($kuisioner, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $kuisioner = Kuisioner::findOrFail($id);

        $data = $request->validate([
            'pertanyaan' => ['required', 'string', 'max:1000'],
            'tipe' => ['required', 'string'],
            'opsi' => ['nullable', 'array'],
        ]);

        $kuisioner->update([
            'pertanyaan' => $data['pertanyaan'],
            'tipe' => $data['tipe'],
            'opsi' => $data['opsi'] ?? null,
        ]);

        return response()->json($kuisioner);
    }

    public function destroy(int $id): JsonResponse
    {
        $kuisioner = Kuisioner::findOrFail($id);
        $kuisioner->delete();

        return response()->json(['message' => 'Soal kuisioner berhasil dihapus']);
    }
}
