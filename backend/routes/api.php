<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KontakPasienController;
use App\Http\Controllers\Api\KuisionerController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\RekapanCairanController;
use App\Http\Controllers\Api\RekapanObatController;
use App\Http\Controllers\Api\RekapKuisionerController;
use App\Http\Controllers\Api\ReminderCairanController;
use App\Http\Controllers\Api\ReminderObatController;
use App\Http\Controllers\Api\WaktuKonsumsiController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Master data
    Route::get('/obat', [ObatController::class, 'index']);
    Route::get('/obat/{id}', [ObatController::class, 'show']);
    Route::get('/waktu-konsumsi', [WaktuKonsumsiController::class, 'index']);
    Route::get('/kuisioner', [KuisionerController::class, 'index']);

    // Monitoring (Dynamic Adherence)
    Route::get('/monitoring/mingguan', [\App\Http\Controllers\Api\MonitoringController::class, 'weeklyMonitoring']);
    Route::get('/monitoring/bulanan', [\App\Http\Controllers\Api\MonitoringController::class, 'monthlyMonitoring']);
    Route::post('/monitoring/log', [\App\Http\Controllers\Api\MonitoringController::class, 'logConsumption']);

    // Pasien
    Route::apiResource('pasien', PasienController::class);

    // Kontak Pasien
    Route::get('/kontak-pasien', [KontakPasienController::class, 'index']);
    Route::post('/kontak-pasien', [KontakPasienController::class, 'store']);
    Route::delete('/kontak-pasien/{id}', [KontakPasienController::class, 'destroy']);

    // Reminder Obat
    Route::apiResource('reminder-obat', ReminderObatController::class);

    // Reminder Cairan
    Route::apiResource('reminder-cairan', ReminderCairanController::class);

    // Kuisioner Rekap
    Route::get('/rekap-kuisioner', [RekapKuisionerController::class, 'index']);
    Route::post('/rekap-kuisioner', [RekapKuisionerController::class, 'store']);
    Route::get('/rekap-kuisioner/{id}', [RekapKuisionerController::class, 'show']);
});
