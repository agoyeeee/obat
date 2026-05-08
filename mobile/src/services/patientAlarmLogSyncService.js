import { publicLogKonsumsiCairanAlarm, publicLogKonsumsiObat } from './patientService';
import {
  getPatientAlarmLogQueue,
  markPatientAlarmLogQueueError,
  removePatientAlarmLogQueueItems,
} from '../storage/patientAlarmLogStorage';
import { getPatientReminderObatQueue } from '../storage/patientReminderObatStorage';

export const syncPendingAlarmLogs = async () => {
  const queue = await getPatientAlarmLogQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, skipped: true };
  }

  const reminderQueue = await getPatientReminderObatQueue();
  const reminderServerIdMap = new Map(
    reminderQueue
      .filter((item) => item.local_id && item.server_id)
      .map((item) => [item.local_id, item.server_id])
  );

  const syncedIds = [];
  const failedIds = [];
  const deferredIds = [];
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
        const resolvedReminderId = item.reminder_obat_id || reminderServerIdMap.get(item.reminder_local_id);
        if (!resolvedReminderId) {
          deferredIds.push(item.local_id);
          continue;
        }

        await publicLogKonsumsiObat({
          reminder_obat_id: resolvedReminderId,
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
    deferredCount: deferredIds.length,
    skipped: false,
  };
};
