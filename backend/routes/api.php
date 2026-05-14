<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KuisionerController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\RekapanCairanController;
use App\Http\Controllers\Api\RekapanObatController;
use App\Http\Controllers\Api\RekapKuisionerController;
use App\Http\Controllers\Api\ReminderCairanController;
use App\Http\Controllers\Api\ReminderObatController;
use App\Http\Controllers\Api\WaktuKonsumsiController;
use App\Http\Controllers\Api\MerkController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/apoteker/public-contacts', [AuthController::class, 'publicApotekerContacts']);
Route::post('/pasien/public-register', [PasienController::class, 'publicStore']);
Route::post('/pasien/public-sync-reminder-obat', [PasienController::class, 'publicSyncReminderObat']);
Route::post('/pasien/public-log-konsumsi-obat', [PasienController::class, 'publicLogKonsumsiObat']);
Route::post('/pasien/public-log-konsumsi-cairan', [PasienController::class, 'publicLogKonsumsiCairan']);
Route::post('/pasien/public-sync-reminder-cairan', [PasienController::class, 'publicSyncReminderCairan']);
Route::post('/pasien/public-log-konsumsi-cairan-alarm', [PasienController::class, 'publicLogKonsumsiCairanAlarm']);
Route::post('/pasien/public-log-konsumsi-cairan/list', [PasienController::class, 'publicListLogKonsumsiCairan']);
Route::get('/obat/public-list', [ObatController::class, 'publicList']);
Route::get('/kuisioner/public-list', [KuisionerController::class, 'publicIndex']);
Route::post('/rekap-kuisioner/public-store', [RekapKuisionerController::class, 'publicStore']);
Route::get('/rekap-kuisioner/public-show/{id}', [RekapKuisionerController::class, 'publicShow'])->where('id', '[0-9]+');
Route::get('/rekap-kuisioner/public-by-pasien/{pasienId}', [RekapKuisionerController::class, 'publicByPasien'])->where('pasienId', '[0-9]+');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Master data
    Route::get('/obat', [ObatController::class, 'index']);
    Route::post('/obat', [ObatController::class, 'store']);
    Route::put('/obat/{id}', [ObatController::class, 'update']);
    Route::delete('/obat/{id}', [ObatController::class, 'destroy']);
    Route::get('/obat/{id}', [ObatController::class, 'show']);
    Route::post('/merk', [MerkController::class, 'store']);
    Route::get('/waktu-konsumsi', [WaktuKonsumsiController::class, 'index']);
    Route::get('/kuisioner', [KuisionerController::class, 'index']);
    Route::post('/kuisioner', [KuisionerController::class, 'store']);
    Route::put('/kuisioner/{id}', [KuisionerController::class, 'update']);
    Route::delete('/kuisioner/{id}', [KuisionerController::class, 'destroy']);

    // Monitoring (Dynamic Adherence)
    Route::get('/monitoring/today-summary', [\App\Http\Controllers\Api\MonitoringController::class, 'todaySummary']);
    Route::get('/monitoring/mingguan', [\App\Http\Controllers\Api\MonitoringController::class, 'weeklyMonitoring']);
    Route::get('/monitoring/bulanan', [\App\Http\Controllers\Api\MonitoringController::class, 'monthlyMonitoring']);
    Route::post('/monitoring/log', [\App\Http\Controllers\Api\MonitoringController::class, 'logConsumption']);

    // Pasien
    Route::apiResource('pasien', PasienController::class);

    // Reminder Obat
    Route::apiResource('reminder-obat', ReminderObatController::class);

    // Reminder Cairan
    Route::apiResource('reminder-cairan', ReminderCairanController::class);

    // Kuisioner Rekap
    Route::get('/rekap-kuisioner', [RekapKuisionerController::class, 'index']);
    Route::post('/rekap-kuisioner', [RekapKuisionerController::class, 'store']);
    Route::get('/rekap-kuisioner/{id}', [RekapKuisionerController::class, 'show']);

    // Rekapan Cairan
    Route::get('/rekapan-cairan', [RekapanCairanController::class, 'index']);
    Route::get('/rekapan-cairan/{id}', [RekapanCairanController::class, 'show'])->where('id', '[0-9]+');
});
