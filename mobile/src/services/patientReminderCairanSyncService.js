import { publicSyncReminderCairan } from './patientService';
import {
  getPendingPatientReminderCairan,
  markPatientReminderCairanSyncFailed,
  markPatientReminderCairanSyncSuccess,
} from '../storage/patientReminderCairanStorage';

export const syncPendingReminderCairan = async (profile) => {
  if (!profile) {
    return { syncedCount: 0, pendingCount: 0, skipped: true };
  }

  const pendingItems = await getPendingPatientReminderCairan();
  if (pendingItems.length === 0) {
    return { syncedCount: 0, pendingCount: 0, skipped: true };
  }

  try {
    const response = await publicSyncReminderCairan({
      patient: {
        nama: profile.nama,
        usia: Number(profile.usia),
        jenis_kelamin: profile.jenis_kelamin,
        berat_badan: Number(profile.berat_badan),
        tgl_diagnosa: profile.tgl_diagnosa,
      },
      reminders: pendingItems.map((item) => ({
        local_id: item.local_id,
        server_id: item.server_id || null,
        tanggal: item.tanggal,
        waktu: item.waktu,
        catatan_asupan: item.catatan_asupan,
        minuman: item.minuman,
        jumlah_ml: item.jumlah_ml,
      })),
    });

    const syncedIds = response?.data?.synced_local_ids || [];
    const serverMap = response?.data?.server_map || {};

    if (syncedIds.length > 0) {
      await markPatientReminderCairanSyncSuccess(syncedIds, serverMap);
    }

    const latestQueue = await getPendingPatientReminderCairan();
    return { syncedCount: syncedIds.length, pendingCount: latestQueue.length, skipped: false };
  } catch (error) {
    const pendingIds = pendingItems.map((item) => item.local_id);
    const message = error?.response?.data?.message || error?.message || 'Gagal sinkronisasi cairan';
    await markPatientReminderCairanSyncFailed(pendingIds, message);
    return { syncedCount: 0, pendingCount: pendingItems.length, skipped: false, error: message };
  }
};
