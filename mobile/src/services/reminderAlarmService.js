import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    try {
      await playAlarmSound();
    } catch (error) {
      console.log('Error playing alarm sound:', error);
    }
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

const CATEGORY_ID = 'REMINDER_OBAT_ACTIONS';
const STOP_ACTION_ID = 'STOP_REMINDER_OBAT';

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

  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: STOP_ACTION_ID,
      buttonTitle: 'Matikan Alarm',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  // Create Android notification channel with custom sound name (requires resource in android/app/src/main/res/raw)
  try {
    await Notifications.setNotificationChannelAsync('reminder_obat_channel', {
      name: 'Reminder Obat',
      importance: Notifications.AndroidImportance.MAX || 5,
      sound: 'alarm_sound', // resource name without extension (alarm_sound.wav)
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch (err) {
    // ignore if platform doesn't support or fails
    console.log('Could not create notification channel:', err?.message || err);
  }

  return true;
};

export const scheduleReminderObatAlarms = async (reminderItem) => {
  const hasPermission = await initializeReminderAlarmNotifications();
  if (!hasPermission) {
    throw new Error('Izin notifikasi belum diberikan.');
  }

  if (!reminderItem?.server_id) {
    throw new Error('Reminder belum tersinkron ke server.');
  }

  const times = parseTimes(reminderItem.waktu_konsumsi);
  if (times.length === 0) {
    throw new Error('Format waktu konsumsi tidak valid untuk alarm.');
  }

  if (Array.isArray(reminderItem.alarm_notification_ids) && reminderItem.alarm_notification_ids.length > 0) {
    await Promise.all(
      reminderItem.alarm_notification_ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );
  }

  const scheduledIds = [];
  for (const time of times) {
    const alarmWaktu = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Waktunya minum ${reminderItem.nama_obat}`,
        body: `Dosis ${reminderItem.dosis} | Tap Matikan Alarm setelah diminum`,
        sound: true,
        channelId: 'reminder_obat_channel',
        categoryIdentifier: CATEGORY_ID,
        data: {
          reminder_obat_id: reminderItem.server_id,
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

    scheduledIds.push(notificationId);
  }

  return scheduledIds;
};

export const addReminderAlarmResponseListener = (onStopAlarm) => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const actionId = response.actionIdentifier;
    if (actionId !== STOP_ACTION_ID) {
      return;
    }

    const reminderId = response.notification.request.content.data?.reminder_obat_id;
    const alarmWaktu = response.notification.request.content.data?.alarm_waktu;
    if (!reminderId) {
      return;
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    onStopAlarm({
      reminderObatId: Number(reminderId),
      loggedAt: now.toISOString(),
      tanggal,
      waktu,
      alarmWaktu: alarmWaktu || null,
    });
  });
};
