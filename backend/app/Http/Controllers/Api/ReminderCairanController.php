<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReminderCairan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReminderCairanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ReminderCairan::query()->with('pasien');

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', (int) $request->query('pasien_id'));
        }

        $reminders = $query->orderBy('waktu')->get();

        return response()->json($reminders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'      => ['required', 'integer', 'exists:pasien,id'],
            'jumlah_ml'      => ['required', 'integer', 'min:1'],
            'waktu'          => ['required', 'date_format:H:i'],
            'skor_kepatuhan' => ['sometimes', 'in:PATUH,TIDAK_PATUH'],
        ]);

        $reminder = ReminderCairan::query()->create($validated);

        return response()->json($reminder, 201);
    }

    public function show(int $id): JsonResponse
    {
        $reminder = ReminderCairan::query()
            ->with('pasien')
            ->findOrFail($id);

        return response()->json($reminder);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reminder = ReminderCairan::query()->findOrFail($id);

        $validated = $request->validate([
            'jumlah_ml'      => ['sometimes', 'integer', 'min:1'],
            'waktu'          => ['sometimes', 'date_format:H:i'],
            'skor_kepatuhan' => ['sometimes', 'in:PATUH,TIDAK_PATUH'],
        ]);

        $reminder->update($validated);

        return response()->json($reminder);
    }

    public function destroy(int $id): JsonResponse
    {
        $reminder = ReminderCairan::query()->findOrFail($id);
        $reminder->delete();

        return response()->json(['message' => 'Reminder cairan berhasil dihapus.']);
    }
}
