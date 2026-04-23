<?php

use App\Http\Controllers\Api\AdherenceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\IntakeLogController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::get('/medicines/{id}', [MedicineController::class, 'show']);

    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::get('/schedules', [ScheduleController::class, 'index']);

    Route::post('/intake-logs', [IntakeLogController::class, 'store']);
    Route::get('/intake-logs', [IntakeLogController::class, 'index']);

    Route::get('/adherence/weekly', [AdherenceController::class, 'weekly']);
});
