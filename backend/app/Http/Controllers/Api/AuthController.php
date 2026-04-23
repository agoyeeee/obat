<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apoteker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'     => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $apoteker = Apoteker::query()->where('nama', $validated['nama'])->first();

        if (!$apoteker || !Hash::check($validated['password'], $apoteker->password)) {
            return response()->json(['message' => 'Nama atau password tidak valid.'], 401);
        }

        $token = $apoteker->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $apoteker->id,
                'nama'  => $apoteker->nama,
                'no_hp' => $apoteker->no_hp,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
