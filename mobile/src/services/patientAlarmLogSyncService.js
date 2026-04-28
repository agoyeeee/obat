import { publicLogKonsumsiCairanAlarm, publicLogKonsumsiObat } from './patientService';
import {
  getPatientAlarmLogQueue,
  markPatientAlarmLogQueueError,
  removePatientAlarmLogQueueItems,
} from '../storage/patientAlarmLogStorage';

export const syncPendingAlarmLogs = async () => {
  const queue = await getPatientAlarmLogQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, skipped: true };
  }

  const syncedIds = [];
  const failedIds = [];
  let lastError = null;

  for (const item of queue) {
    try {
      if (item.entity_type === 'cairan') {
        await publicLogKonsumsiCairanAlarm({
          reminder_cairan_id: item.reminder_cairan_id,
          status: item.status,
          logged_at: item.logged_at,
          tanggal: item.tanggal,
          waktu: item.waktu,
        });
      } else {
        await publicLogKonsumsiObat({
          reminder_obat_id: item.reminder_obat_id,
          status: item.status,
          logged_at: item.logged_at,
          tanggal: item.tanggal,
          waktu: item.waktu,
          alarm_waktu: item.alarm_waktu,
        });
      }
      syncedIds.push(item.local_id);
    } catch (error) {
      failedIds.push(item.local_id);
      lastError = error?.response?.data?.message || error?.message || 'Gagal kirim log alarm';
    }
  }

  if (syncedIds.length > 0) {
    await removePatientAlarmLogQueueItems(syncedIds);
  }

  if (failedIds.length > 0) {
    await markPatientAlarmLogQueueError(failedIds, lastError);
  }

  return {
    syncedCount: syncedIds.length,
    failedCount: failedIds.length,
    skipped: false,
  };
};
