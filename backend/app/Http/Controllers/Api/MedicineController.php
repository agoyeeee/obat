<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\JsonResponse;

class MedicineController extends Controller
{
    public function index(): JsonResponse
    {
        $medicines = Medicine::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($medicines);
    }

    public function show(int $id): JsonResponse
    {
        $medicine = Medicine::query()->findOrFail($id);

        return response()->json($medicine);
    }
}
