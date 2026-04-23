<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WaktuKonsumsi;
use Illuminate\Http\JsonResponse;

class WaktuKonsumsiController extends Controller
{
    public function index(): JsonResponse
    {
        $waktus = WaktuKonsumsi::query()->orderBy('jam')->get();

        return response()->json($waktus);
    }
}
