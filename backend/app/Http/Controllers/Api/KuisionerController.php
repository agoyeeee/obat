<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kuisioner;
use Illuminate\Http\JsonResponse;

class KuisionerController extends Controller
{
    public function index(): JsonResponse
    {
        $kuisioners = Kuisioner::query()->orderBy('id')->get();

        return response()->json($kuisioners);
    }
}
