import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

const CATEGORY_ID = 'REMINDER_OBAT_ACTIONS';
const STOP_ACTION_ID = 'STOP_REMINDER_OBAT';
const REMINDER_OBAT_CHANNEL_ID = 'reminder_obat_alarm_silent_v8';
const OLD_REMINDER_OBAT_CHANNEL_IDS = [
  'reminder_obat_channel',
  'reminder_obat_channel_v2',
  'reminder_obat_channel_v3',
  'reminder_obat_channel_v4',
  'reminder_obat_alarm_v5',
  'reminder_obat_alarm_v6',
  'reminder_obat_alarm_native',
];
const ALARM_MISS_TIMEOUT_MS = 5 * 60 * 1000;
const PATIENT_ALARM_OCCURRENCES_KEY = '@patient_alarm_occurrences';

const activeAlarmTimers = new Map();

const buildAlarmOccurrenceKey = ({ reminderObatId, reminderLocalId, tanggal, alarmWaktu }) => {
  const identifier = reminderObatId || reminderLocalId || 'unknown';
  return `${identifier}:${tanggal}:${alarmWaktu || 'unknown'}`;
};

const readAlarmOccurrences = async () => {
  try {
    const raw = await AsyncStorage.getItem(PATIENT_ALARM_OCCURRENCES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.log('Error reading alarm occurrences:', error);
    return {};
  }
};

const storeAlarmOccurrences = async (items) => {
  try {
    await AsyncStorage.setItem(PATIENT_ALARM_OCCURRENCES_KEY, JSON.stringify(items));
  } catch (error) {
    console.log('Error storing alarm occurrences:', error);
  }
};

const pruneOldAlarmOccurrences = async () => {
  const occurrences = await readAlarmOccurrences();
  const today = new Date();
  const currentDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const filtered = Object.fromEntries(
    Object.entries(occurrences).filter(([, value]) => value?.tanggal === currentDateKey)
  );

  if (Object.keys(filtered).length !== Object.keys(occurrences).length) {
    await storeAlarmOccurrences(filtered);
  }

  return filtered;
};

const markAlarmOccurrenceProcessed = async (key, payload) => {
  const occurrences = await pruneOldAlarmOccurrences();
  occurrences[key] = {
    ...payload,
    processed_at: new Date().toISOString(),
  };
  await storeAlarmOccurrences(occurrences);
};

const isAlarmOccurrenceProcessed = async (key) => {
  const occurrences = await pruneOldAlarmOccurrences();
  return Boolean(occurrences[key]);
};

const clearAlarmOccurrenceTimer = (key) => {
  const timer = activeAlarmTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    activeAlarmTimers.delete(key);
  }
};

const startAlarmOccurrenceTimer = async (payload, onMissedAlarm) => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const tanggal = payload.tanggal || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const key = buildAlarmOccurrenceKey({
    reminderObatId: payload.reminderObatId,
    reminderLocalId: payload.reminderLocalId,
    tanggal,
    alarmWaktu: payload.alarmWaktu || null,
  });

  clearAlarmOccurrenceTimer(key);

  if (await isAlarmOccurrenceProcessed(key)) {
    return key;
  }

  const timer = setTimeout(async () => {
    activeAlarmTimers.delete(key);
    if (await isAlarmOccurrenceProcessed(key)) {
      return;
    }

    const missNow = new Date();
    const missTanggal = `${missNow.getFullYear()}-${pad(missNow.getMonth() + 1)}-${pad(missNow.getDate())}`;
    const missWaktu = `${pad(missNow.getHours())}:${pad(missNow.getMinutes())}:${pad(missNow.getSeconds())}`;

    await markAlarmOccurrenceProcessed(key, {
      ...payload,
      tanggal: tanggal || missTanggal,
      waktu: missWaktu,
      status: 'terlewat',
      logged_at: missNow.toISOString(),
    });

    if (typeof onMissedAlarm === 'function') {
      await onMissedAlarm({
        ...payload,
        tanggal: tanggal || missTanggal,
        waktu: missWaktu,
        status: 'terlewat',
        loggedAt: missNow.toISOString(),
      });
    }
  }, ALARM_MISS_TIMEOUT_MS);

  activeAlarmTimers.set(key, timer);
  return key;
};

// Play alarm sound saat notif diterima
export const playAlarmSound = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Try to play from assets file
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/alarm-sound.wav'));
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync().catch(console.log);
      }, 5000);
    } catch (fileError) {
      // Fallback: generate simple beep alarm tone
      await playSystemBeep();
    }
  } catch (error) {
    console.log('Alarm sound setup error:', error);
    await playSystemBeep().catch(console.log);
  }
};

// Fallback: simple beep tone using frequency oscillation
const playSystemBeep = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync({
      uri: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAAA=',
    });
    await sound.playAsync();
  } catch (error) {
    console.log('System beep fallback error:', error);
  }
};

const parseTimes = (waktuKonsumsi) => {
  if (!waktuKonsumsi) return [];

  const matches = [...String(waktuKonsumsi).matchAll(/(\d{1,2})[\.:](\d{2})/g)];
  return matches
    .map((match) => {
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
      return { hour, minute };
    })
    .filter(Boolean);
};

export const initializeReminderAlarmNotifications = async () => {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    const askPermission = await Notifications.requestPermissionsAsync();
    if (askPermission.status !== 'granted') {
      return false;
    }
  }

  // Create Android notification channel with custom sound name (requires resource in android/app/src/main/res/raw)
  try {
    await Promise.all(
      OLD_REMINDER_OBAT_CHANNEL_IDS.map((channelId) =>
        Notifications.deleteNotificationChannelAsync(channelId).catch(() => {})
      )
    );

    await Notifications.setNotificationChannelAsync(REMINDER_OBAT_CHANNEL_ID, {
      name: 'Alarm Obat',
      importance: Notifications.AndroidImportance.MAX,
      sound: null,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 500, 500, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: STOP_ACTION_ID,
        buttonTitle: 'Matikan Alarm',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  } catch (err) {
    console.log('Could not setup notification category:', err?.message || err);
  }

  return true;
};

export const scheduleReminderObatAlarms = async (reminderItem) => {
  const hasPermission = await initializeReminderAlarmNotifications();
  if (!hasPermission) {
    throw new Error('Izin notifikasi belum diberikan.');
  }

  if (!reminderItem?.local_id) {
    throw new Error('Reminder belum valid.');
  }

  const times = parseTimes(reminderItem.waktu_konsumsi);
  if (times.length === 0) {
    throw new Error('Format waktu konsumsi tidak valid untuk alarm.');
  }

  const [time] = times;

  if (Array.isArray(reminderItem.alarm_notification_ids) && reminderItem.alarm_notification_ids.length > 0) {
    await Promise.all(
      reminderItem.alarm_notification_ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );
  }

  const alarmWaktu = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Waktunya minum ${reminderItem.nama_obat}`,
      body: `Dosis ${reminderItem.dosis} | Tap notifikasi untuk matikan alarm`,
      sound: null,
      channelId: REMINDER_OBAT_CHANNEL_ID,
      categoryIdentifier: CATEGORY_ID,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        reminder_obat_id: reminderItem.server_id || null,
        reminder_local_id: reminderItem.local_id,
        local_id: reminderItem.local_id,
        alarm_waktu: alarmWaktu,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
    },
  });

  return [notificationId];
};

export const cancelReminderObatAlarms = async (notificationIds = []) => {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return;
  }

  await Promise.all(
    notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
};

export { STOP_ACTION_ID };

export const addReminderAlarmDeliveryListener = (onAlarmDelivered) => {
  return Notifications.addNotificationReceivedListener((notification) => {
    const reminderObatId = notification.request.content.data?.reminder_obat_id;
    const reminderLocalId = notification.request.content.data?.reminder_local_id;
    const alarmWaktu = notification.request.content.data?.alarm_waktu;
    if (!reminderObatId && !reminderLocalId) {
      return;
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    startAlarmOccurrenceTimer(
      {
        reminderObatId: reminderObatId ? Number(reminderObatId) : null,
        reminderLocalId: reminderLocalId || null,
        alarmWaktu: alarmWaktu || null,
        tanggal,
        waktu,
      },
      onAlarmDelivered
    ).catch((error) => {
      console.log('Failed to start alarm timeout:', error);
    });
  });
};

export const addReminderAlarmResponseListener = (onStopAlarm) => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.actionIdentifier !== STOP_ACTION_ID) {
      return;
    }

    const reminderId = response.notification.request.content.data?.reminder_obat_id;
    const reminderLocalId = response.notification.request.content.data?.reminder_local_id;
    const alarmWaktu = response.notification.request.content.data?.alarm_waktu;
    if (!reminderId && !reminderLocalId) {
      return;
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const key = buildAlarmOccurrenceKey({
      reminderObatId: reminderId ? Number(reminderId) : null,
      reminderLocalId: reminderLocalId || null,
      tanggal,
      alarmWaktu: alarmWaktu || null,
    });

    clearAlarmOccurrenceTimer(key);

    isAlarmOccurrenceProcessed(key)
      .then(async (processed) => {
        if (processed) {
          return;
        }

        await markAlarmOccurrenceProcessed(key, {
          reminder_obat_id: reminderId ? Number(reminderId) : null,
          reminder_local_id: reminderLocalId || null,
          alarm_waktu: alarmWaktu || null,
          tanggal,
          waktu,
          status: 'diminum',
          logged_at: now.toISOString(),
        });

        onStopAlarm({
          reminderObatId: reminderId ? Number(reminderId) : null,
          reminderLocalId: reminderLocalId || null,
          loggedAt: now.toISOString(),
          tanggal,
          waktu,
          alarmWaktu: alarmWaktu || null,
        });
      })
      .catch((error) => {
        console.log('Failed to process alarm response:', error);
      });
  });
};
