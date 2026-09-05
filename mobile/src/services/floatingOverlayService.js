import { NativeModules, Platform } from 'react-native';

const { FloatingAlarmModule } = NativeModules;

/**
 * Memeriksa apakah izin "Tampilkan di atas aplikasi lain" sudah aktif di Android
 * @returns {Promise<boolean>}
 */
export const checkOverlayPermission = async () => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.checkOverlayPermission) {
    return false;
  }
  try {
    return await FloatingAlarmModule.checkOverlayPermission();
  } catch (error) {
    console.log('[FloatingAlarm] Error checkOverlayPermission:', error);
    return false;
  }
};

/**
 * Membuka langsung halaman Pengaturan Android untuk mengaktifkan izin overlay
 * @returns {Promise<boolean>}
 */
export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.requestOverlayPermission) {
    return false;
  }
  try {
    return await FloatingAlarmModule.requestOverlayPermission();
  } catch (error) {
    console.log('[FloatingAlarm] Error requestOverlayPermission:', error);
    return false;
  }
};

/**
 * Membuka langsung halaman Pengaturan Channel Notifikasi (Spanduk/Pop-up/Heads-up)
 * @returns {Promise<boolean>}
 */
export const openNotificationChannelSettings = async () => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.openNotificationChannelSettings) {
    return false;
  }
  try {
    return await FloatingAlarmModule.openNotificationChannelSettings();
  } catch (error) {
    console.log('[FloatingAlarm] Error openNotificationChannelSettings:', error);
    return false;
  }
};

/**
 * Menampilkan Floating Pop-up mengambang di atas layar
 */
export const showFloatingAlarm = async ({
  title = 'Waktunya Minum Obat',
  medicineName = 'Obat Anda',
  dose = '1 dosis',
  time = '',
  reminderId = null,
  isTest = false,
} = {}) => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.showFloatingAlarm) {
    return false;
  }
  try {
    return await FloatingAlarmModule.showFloatingAlarm({
      title,
      medicineName,
      dose,
      time,
      reminderId: reminderId ? String(reminderId) : null,
      isTest: Boolean(isTest),
    });
  } catch (error) {
    console.log('[FloatingAlarm] Error showFloatingAlarm:', error);
    return false;
  }
};

/**
 * Menutup Floating Pop-up mengambang
 */
export const dismissFloatingAlarm = async () => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.dismissFloatingAlarm) {
    return false;
  }
  try {
    return await FloatingAlarmModule.dismissFloatingAlarm();
  } catch (error) {
    console.log('[FloatingAlarm] Error dismissFloatingAlarm:', error);
    return false;
  }
};

/**
 * Menjadwalkan alarm native presisi tinggi dengan AlarmManager Android
 */
export const scheduleNativeAlarm = async ({
  id,
  hour,
  minute,
  title = 'Waktunya Minum Obat',
  medicineName = 'Obat Anda',
  dose = '1 dosis',
  reminderId = null,
  isTest = false,
}) => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.scheduleNativeAlarm) {
    return null;
  }
  try {
    return await FloatingAlarmModule.scheduleNativeAlarm({
      id: Number(id) || Math.floor(Math.random() * 100000),
      hour: Number(hour),
      minute: Number(minute),
      title,
      medicineName,
      dose,
      reminderId: reminderId ? String(reminderId) : null,
      isTest: Boolean(isTest),
    });
  } catch (error) {
    console.log('[FloatingAlarm] Error scheduleNativeAlarm:', error);
    return null;
  }
};

/**
 * Membatalkan alarm native
 */
export const cancelNativeAlarm = async (id) => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.cancelNativeAlarm) {
    return false;
  }
  try {
    return await FloatingAlarmModule.cancelNativeAlarm(Number(id));
  } catch (error) {
    console.log('[FloatingAlarm] Error cancelNativeAlarm:', error);
    return false;
  }
};

/**
 * Memicu Uji Coba Floating Alarm dengan jeda beberapa detik
 */
export const triggerTestFloating = async (
  delaySeconds = 5,
  {
    title = '[Uji Coba] Waktunya Minum Obat',
    medicineName = 'Amlodipine (Uji Coba)',
    dose = '1 tablet (5 mg)',
    reminderId = 'test_debug_id',
  } = {}
) => {
  if (Platform.OS !== 'android' || !FloatingAlarmModule?.triggerTestFloating) {
    return null;
  }
  try {
    return await FloatingAlarmModule.triggerTestFloating(delaySeconds, {
      title,
      medicineName,
      dose,
      reminderId,
    });
  } catch (error) {
    console.log('[FloatingAlarm] Error triggerTestFloating:', error);
    return null;
  }
};
