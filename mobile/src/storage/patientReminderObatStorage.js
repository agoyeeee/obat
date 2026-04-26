import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENT_REMINDER_OBAT_KEY = '@patient_reminder_obat_queue';

export const getPatientReminderObatQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(PATIENT_REMINDER_OBAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading reminder obat queue', error);
    return [];
  }
};

export const storePatientReminderObatQueue = async (items) => {
  try {
    await AsyncStorage.setItem(PATIENT_REMINDER_OBAT_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing reminder obat queue', error);
  }
};

export const addPatientReminderObat = async (payload) => {
  const queue = await getPatientReminderObatQueue();
  const item = {
    ...payload,
    local_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sync_status: 'pending',
    alarm_notification_ids: [],
    created_at: new Date().toISOString(),
    synced_at: null,
    server_id: null,
    last_error: null,
  };

  queue.unshift(item);
  await storePatientReminderObatQueue(queue);
  return item;
};

export const getPendingPatientReminderObat = async () => {
  const queue = await getPatientReminderObatQueue();
  return queue.filter((item) => item.sync_status !== 'synced');
};

export const markPatientReminderObatSyncSuccess = async (localIds, serverMap = {}) => {
  const queue = await getPatientReminderObatQueue();
  const idSet = new Set(localIds);
  const updated = queue.map((item) => {
    if (!idSet.has(item.local_id)) return item;
    return {
      ...item,
      sync_status: 'synced',
      synced_at: new Date().toISOString(),
      server_id: serverMap[item.local_id] || item.server_id || null,
      last_error: null,
    };
  });
  await storePatientReminderObatQueue(updated);
  return updated;
};

export const markPatientReminderObatSyncFailed = async (localIds, errorMessage) => {
  const queue = await getPatientReminderObatQueue();
  const idSet = new Set(localIds);
  const updated = queue.map((item) => {
    if (!idSet.has(item.local_id)) return item;
    return {
      ...item,
      sync_status: 'pending',
      last_error: errorMessage || 'Sinkronisasi gagal',
    };
  });
  await storePatientReminderObatQueue(updated);
  return updated;
};

export const updatePatientReminderObatAlarmIds = async (localId, notificationIds = []) => {
  const queue = await getPatientReminderObatQueue();
  const updated = queue.map((item) => {
    if (item.local_id !== localId) return item;
    return {
      ...item,
      alarm_notification_ids: notificationIds,
    };
  });

  await storePatientReminderObatQueue(updated);
  return updated;
};
