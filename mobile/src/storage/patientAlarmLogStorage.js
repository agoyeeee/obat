import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENT_ALARM_LOG_QUEUE_KEY = '@patient_alarm_log_queue';

export const getPatientAlarmLogQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(PATIENT_ALARM_LOG_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading alarm log queue', error);
    return [];
  }
};

export const storePatientAlarmLogQueue = async (items) => {
  try {
    await AsyncStorage.setItem(PATIENT_ALARM_LOG_QUEUE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing alarm log queue', error);
  }
};

export const enqueuePatientAlarmLog = async (payload) => {
  const queue = await getPatientAlarmLogQueue();
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const fallbackTanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const fallbackWaktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const item = {
    local_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entity_type: payload.entity_type || 'obat',
    reminder_obat_id: payload.reminder_obat_id ? Number(payload.reminder_obat_id) : null,
    reminder_local_id: payload.reminder_local_id || null,
    reminder_cairan_id: payload.reminder_cairan_id ? Number(payload.reminder_cairan_id) : null,
    status: payload.status || 'diminum',
    logged_at: payload.logged_at || new Date().toISOString(),
    tanggal: payload.tanggal || fallbackTanggal,
    waktu: payload.waktu || fallbackWaktu,
    alarm_waktu: payload.alarm_waktu || null,
    created_at: new Date().toISOString(),
    last_error: null,
  };

  queue.unshift(item);
  await storePatientAlarmLogQueue(queue);
  return item;
};

export const removePatientAlarmLogQueueItems = async (localIds) => {
  const queue = await getPatientAlarmLogQueue();
  const idSet = new Set(localIds);
  const updated = queue.filter((item) => !idSet.has(item.local_id));
  await storePatientAlarmLogQueue(updated);
  return updated;
};

export const markPatientAlarmLogQueueError = async (localIds, message) => {
  const queue = await getPatientAlarmLogQueue();
  const idSet = new Set(localIds);
  const updated = queue.map((item) => {
    if (!idSet.has(item.local_id)) return item;
    return {
      ...item,
      last_error: message || 'Gagal kirim log alarm',
    };
  });

  await storePatientAlarmLogQueue(updated);
  return updated;
};
