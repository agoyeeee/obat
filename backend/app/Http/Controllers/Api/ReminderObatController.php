<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReminderObat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReminderObatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ReminderObat::query()->with(['obat', 'merk', 'waktuKonsumsi', 'pasien']);

        if ($request->filled('pasien_id')) {
            $query->where('pasien_id', (int) $request->query('pasien_id'));
        }

        $reminders = $query->orderBy('created_at', 'desc')->get();

        return response()->json($reminders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pasien_id'        => ['required', 'integer', 'exists:pasien,id'],
            'obat_id'          => ['required', 'integer', 'exists:obat,id'],
            'merk_id'          => ['nullable', 'integer', 'exists:merk,id'],
            'dosis'            => ['required', 'string', 'max:100'],
            'sediaan'          => ['required', 'string', 'max:100'],
            'jumlah_obat'      => ['required', 'numeric', 'min:0.25'],
            'jumlah_per_minum' => ['nullable', 'numeric', 'min:0.25'],
            'waktu_konsumsi_id' => ['required', 'integer', 'exists:waktu_konsumsi,id'],
        ]);

        if (!array_key_exists('jumlah_per_minum', $validated) || $validated['jumlah_per_minum'] === null) {
            $validated['jumlah_per_minum'] = 1;
        } else {
            $validated['jumlah_per_minum'] = (float) $validated['jumlah_per_minum'];
        }
        $validated['jumlah_obat'] = (float) $validated['jumlah_obat'];

        $reminder = ReminderObat::query()->create($validated);

        return response()->json($reminder->load(['obat', 'merk', 'waktuKonsumsi']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $reminder = ReminderObat::query()
            ->with(['obat', 'merk', 'waktuKonsumsi', 'pasien'])
            ->findOrFail($id);

        return response()->json($reminder);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reminder = ReminderObat::query()->findOrFail($id);

        $validated = $request->validate([
            'obat_id'          => ['sometimes', 'integer', 'exists:obat,id'],
            'merk_id'          => ['nullable', 'integer', 'exists:merk,id'],
            'dosis'            => ['sometimes', 'string', 'max:100'],
            'sediaan'          => ['sometimes', 'string', 'max:100'],
            'jumlah_obat'      => ['sometimes', 'numeric', 'min:0.25'],
            'jumlah_per_minum' => ['sometimes', 'nullable', 'numeric', 'min:0.25'],
            'waktu_konsumsi_id' => ['sometimes', 'integer', 'exists:waktu_konsumsi,id'],
        ]);

        if (array_key_exists('jumlah_per_minum', $validated) && $validated['jumlah_per_minum'] === null) {
            $validated['jumlah_per_minum'] = 1;
        } elseif (array_key_exists('jumlah_per_minum', $validated)) {
            $validated['jumlah_per_minum'] = (float) $validated['jumlah_per_minum'];
        }

        if (!array_key_exists('jumlah_per_minum', $validated)) {
            $validated['jumlah_per_minum'] = $reminder->jumlah_per_minum ?? 1;
        }

        if (array_key_exists('jumlah_obat', $validated)) {
            $validated['jumlah_obat'] = (float) $validated['jumlah_obat'];
        }

        $reminder->update($validated);

        return response()->json($reminder->load(['obat', 'merk', 'waktuKonsumsi']));
    }

    public function destroy(int $id): JsonResponse
    {
        $reminder = ReminderObat::query()->findOrFail($id);
        $reminder->delete();

        return response()->json(['message' => 'Reminder obat berhasil dihapus.']);
    }
}
