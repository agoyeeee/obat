import * as Notifications from 'expo-notifications';

const CATEGORY_ID = 'REMINDER_CAIRAN_ACTIONS';
const STOP_ACTION_ID = 'STOP_REMINDER_CAIRAN';

const parseTime = (waktu) => {
  if (!waktu) return null;
  const match = String(waktu).match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
};

export const initializeReminderCairanNotifications = async () => {
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

  return true;
};

export const scheduleReminderCairanAlarm = async (reminderItem) => {
  const hasPermission = await initializeReminderCairanNotifications();
  if (!hasPermission) {
    throw new Error('Izin notifikasi belum diberikan.');
  }

  if (!reminderItem?.id) {
    throw new Error('Reminder cairan belum valid.');
  }

  const time = parseTime(reminderItem.waktu);
  if (!time) {
    throw new Error('Format waktu reminder cairan tidak valid.');
  }

  if (Array.isArray(reminderItem.alarm_notification_ids) && reminderItem.alarm_notification_ids.length > 0) {
    await Promise.all(
      reminderItem.alarm_notification_ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );
  }

  const alarmWaktu = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Waktunya minum cairan`,
      body: `Minuman ${reminderItem.minuman || 'Air mineral'} | ${reminderItem.jumlah_ml} ml`,
      sound: true,
      categoryIdentifier: CATEGORY_ID,
      data: {
        reminder_cairan_id: reminderItem.id,
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

export const addReminderCairanAlarmResponseListener = (onStopAlarm) => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.actionIdentifier !== STOP_ACTION_ID) {
      return;
    }

    const reminderCairanId = response.notification.request.content.data?.reminder_cairan_id;
    const alarmWaktu = response.notification.request.content.data?.alarm_waktu;
    if (!reminderCairanId) {
      return;
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    onStopAlarm({
      reminderCairanId: Number(reminderCairanId),
      loggedAt: now.toISOString(),
      tanggal,
      waktu,
      alarmWaktu: alarmWaktu || null,
    });
  });
};
