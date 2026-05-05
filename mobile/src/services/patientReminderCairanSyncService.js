import { publicSyncReminderCairan } from './patientService';
import {
  getPendingPatientReminderCairan,
  markPatientReminderCairanSyncFailed,
  markPatientReminderCairanSyncSuccess,
  updatePatientReminderCairanAlarmIds,
} from '../storage/patientReminderCairanStorage';
import { scheduleReminderCairanAlarm } from './reminderCairanAlarmService';

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
    const syncedItems = pendingItems.filter((item) => syncedIds.includes(item.local_id));

    for (const item of syncedItems) {
      const serverId = serverMap[item.local_id];
      if (!serverId) continue;
      try {
        const notificationIds = await scheduleReminderCairanAlarm({
          id: serverId,
          minuman: item.minuman,
          jumlah_ml: item.jumlah_ml,
          waktu: item.waktu,
          alarm_notification_ids: item.alarm_notification_ids,
        });
        await updatePatientReminderCairanAlarmIds(item.local_id, notificationIds);
      } catch (error) {
        console.error('Failed to schedule cairan alarm:', error?.message || error);
      }
    }

    return { syncedCount: syncedIds.length, pendingCount: latestQueue.length, skipped: false };
  } catch (error) {
    const pendingIds = pendingItems.map((item) => item.local_id);
    const message = error?.response?.data?.message || error?.message || 'Gagal sinkronisasi cairan';
    await markPatientReminderCairanSyncFailed(pendingIds, message);
    return { syncedCount: 0, pendingCount: pendingItems.length, skipped: false, error: message };
  }
};
