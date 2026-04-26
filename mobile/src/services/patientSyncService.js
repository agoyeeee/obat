import { publicSyncReminderObat } from './patientService';
import {
  getPendingPatientReminderObat,
  markPatientReminderObatSyncFailed,
  markPatientReminderObatSyncSuccess,
} from '../storage/patientReminderObatStorage';

export const syncPendingReminderObat = async (profile) => {
  if (!profile) {
    return { syncedCount: 0, pendingCount: 0, skipped: true };
  }

  const pendingItems = await getPendingPatientReminderObat();
  if (pendingItems.length === 0) {
    return { syncedCount: 0, pendingCount: 0, skipped: true };
  }

  try {
    const response = await publicSyncReminderObat({
      patient: {
        nama: profile.nama,
        usia: Number(profile.usia),
        jenis_kelamin: profile.jenis_kelamin,
        berat_badan: Number(profile.berat_badan),
        tgl_diagnosa: profile.tgl_diagnosa,
      },
      reminders: pendingItems.map((item) => ({
        local_id: item.local_id,
        obat_id: item.obat_id,
        dosis: item.dosis,
        sediaan: item.sediaan,
        jumlah_obat: item.jumlah_obat,
        frekuensi: item.frekuensi,
        waktu_konsumsi: item.waktu_konsumsi,
        aturan_minum: item.aturan_minum,
      })),
    });

    const syncedIds = response?.data?.synced_local_ids || [];
    const serverMap = response?.data?.server_map || {};

    if (syncedIds.length > 0) {
      await markPatientReminderObatSyncSuccess(syncedIds, serverMap);
    }

    return { syncedCount: syncedIds.length, pendingCount: 0, skipped: false };
  } catch (error) {
    const pendingIds = pendingItems.map((item) => item.local_id);
    const message = error?.response?.data?.message || error?.message || 'Gagal sinkronisasi ke server.';

    await markPatientReminderObatSyncFailed(pendingIds, message);

    return {
      syncedCount: 0,
      pendingCount: pendingItems.length,
      skipped: false,
      error: message,
    };
  }
};
