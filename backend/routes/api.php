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

    // Rekapan Mingguan
    Route::get('/rekapan-obat', [RekapanObatController::class, 'index']);
    Route::post('/rekapan-obat', [RekapanObatController::class, 'store']);
    Route::get('/rekapan-obat/{id}', [RekapanObatController::class, 'show']);

    Route::get('/rekapan-cairan', [RekapanCairanController::class, 'index']);
    Route::post('/rekapan-cairan', [RekapanCairanController::class, 'store']);
    Route::get('/rekapan-cairan/{id}', [RekapanCairanController::class, 'show']);

    // Kuisioner Rekap
    Route::get('/rekap-kuisioner', [RekapKuisionerController::class, 'index']);
    Route::post('/rekap-kuisioner', [RekapKuisionerController::class, 'store']);
    Route::get('/rekap-kuisioner/{id}', [RekapKuisionerController::class, 'show']);
});
