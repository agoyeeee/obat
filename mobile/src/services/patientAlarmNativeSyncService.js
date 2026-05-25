import { NativeModules } from 'react-native';
import { enqueuePatientAlarmLog } from '../storage/patientAlarmLogStorage';

const { AlarmScheduler } = NativeModules;

export const importNativePendingEvents = async () => {
  if (!AlarmScheduler || !AlarmScheduler.getPendingEvents) return { imported: 0 };

  try {
    const raw = await AlarmScheduler.getPendingEvents();
    if (!raw) return { imported: 0 };

    const events = typeof raw === 'string' ? JSON.parse(raw) : raw;
    let imported = 0;

    for (const ev of events) {
      const requestId = ev.requestId || null;
      let reminderLocalId = null;
      if (requestId && typeof requestId === 'string') {
        reminderLocalId = requestId.split(':')[0] || null;
      }

      await enqueuePatientAlarmLog({
        entity_type: 'obat',
        reminder_obat_id: null,
        reminder_local_id: reminderLocalId,
        status: ev.status || 'diminum',
        logged_at: ev.logged_at || new Date().toISOString(),
        tanggal: ev.tanggal || null,
        waktu: ev.waktu || null,
        alarm_waktu: ev.alarm_waktu || null,
      });

      if (requestId && AlarmScheduler.clearEvent) {
        try {
          await AlarmScheduler.clearEvent(requestId);
        } catch (e) {
          // ignore
        }
      }

      imported += 1;
    }

    return { imported };
  } catch (error) {
    return { imported: 0, error };
  }
};
