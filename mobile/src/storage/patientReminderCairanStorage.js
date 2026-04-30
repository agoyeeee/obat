import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENT_REMINDER_CAIRAN_KEY = '@patient_reminder_cairan_queue';

export const getPatientReminderCairanQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(PATIENT_REMINDER_CAIRAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading cairan queue', error);
    return [];
  }
};

export const storePatientReminderCairanQueue = async (items) => {
  try {
    await AsyncStorage.setItem(PATIENT_REMINDER_CAIRAN_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing cairan queue', error);
  }
};

export const addPatientReminderCairan = async (payload) => {
  const queue = await getPatientReminderCairanQueue();
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
  await storePatientReminderCairanQueue(queue);
  return item;
};

export const getPendingPatientReminderCairan = async () => {
  const queue = await getPatientReminderCairanQueue();
  return queue.filter((item) => item.sync_status !== 'synced');
};

export const markPatientReminderCairanSyncSuccess = async (localIds, serverMap = {}) => {
  const queue = await getPatientReminderCairanQueue();
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
  await storePatientReminderCairanQueue(updated);
  return updated;
};

export const markPatientReminderCairanSyncFailed = async (localIds, message) => {
  const queue = await getPatientReminderCairanQueue();
  const idSet = new Set(localIds);
  const updated = queue.map((item) => {
    if (!idSet.has(item.local_id)) return item;
    return {
      ...item,
      sync_status: 'pending',
      last_error: message || 'Sinkronisasi gagal',
    };
  });
  await storePatientReminderCairanQueue(updated);
  return updated;
};

export const updatePatientReminderCairanAlarmIds = async (localId, notificationIds = []) => {
  const queue = await getPatientReminderCairanQueue();
  const updated = queue.map((item) => {
    if (item.local_id !== localId) return item;
    return {
      ...item,
      alarm_notification_ids: notificationIds,
    };
  });
  await storePatientReminderCairanQueue(updated);
  return updated;
};

export const updatePatientReminderCairanItem = async (localId, patch = {}) => {
  const queue = await getPatientReminderCairanQueue();
  const updated = queue.map((item) => {
    if (item.local_id !== localId) return item;
    return {
      ...item,
      ...patch,
    };
  });

  await storePatientReminderCairanQueue(updated);
  return updated;
};

export const deletePatientReminderCairanItem = async (localId) => {
  const queue = await getPatientReminderCairanQueue();
  const updated = queue.filter((item) => item.local_id !== localId);
  await storePatientReminderCairanQueue(updated);
  return updated;
};
