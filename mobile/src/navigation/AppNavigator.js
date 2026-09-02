import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';

import EntryScreen from '../screens/EntryScreen';
import LoginScreen from '../screens/LoginScreen';

import PatientHomeScreen from '../screens/pasien/PatientHomeScreen';
import PatientDashboardScreen from '../screens/pasien/PatientDashboardScreen';
import PatientReminderObatScreen from '../screens/pasien/PatientReminderObatScreen';
import PatientReminderCairanScreen from '../screens/pasien/PatientReminderCairanScreen';
import PatientAlarmScreen from '../screens/pasien/PatientAlarmScreen';
import PatientInformasiObatListScreen from '../screens/pasien/PatientInformasiObatListScreen';
import PatientInformasiObatDetailScreen from '../screens/pasien/PatientInformasiObatDetailScreen';

import PatientDetailScreen from '../screens/apoteker/PatientDetailScreen';
import SelectBrandScreen from '../screens/apoteker/SelectBrandScreen';

import { View, ActivityIndicator, AppState, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import MainTabNavigator from './MainTabNavigator';
import KuisionerNavigator from './KuisionerNavigator';

import {
  clearPatientProfile,
  getPatientProfile,
  storePatientProfile,
} from '../storage/patientStorage';

import {
  syncPendingReminderObat,
} from '../services/patientSyncService';

import {
  syncPendingReminderCairan,
} from '../services/patientReminderCairanSyncService';

import {
  publicLogKonsumsiObat,
  publicRegisterPatient,
} from '../services/patientService';

import {
  getPatientReminderObatQueue,
  updatePatientReminderObatItem,
  updatePatientReminderObatAlarmIds,
} from '../storage/patientReminderObatStorage';

import {
  addReminderAlarmResponseListener,
  addReminderAlarmDeliveryListener,
  initializeReminderAlarmNotifications,
  cancelReminderObatAlarms,
  STOP_ACTION_ID,
} from '../services/reminderAlarmService';

import { enqueuePatientAlarmLog } from '../storage/patientAlarmLogStorage';
import { syncPendingAlarmLogs } from '../services/patientAlarmLogSyncService';
import { importNativePendingEvents } from '../services/patientAlarmNativeSyncService';
import { openRandomApotekerWhatsApp } from '../utils/helpers';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();
  const navigationRef = useNavigationContainerRef();

  const [selectedRole, setSelectedRole] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [selectedObatInfo, setSelectedObatInfo] = useState(null);

  const isAutoSyncingRef = useRef(false);
  const pendingAlarmNavigationRef = useRef(null);
  const handledNotificationKeyRef = useRef(null);

  const handleReminderTaken = async (data) => {
    try {
      if (!data?.reminderObatId) {
        throw new Error('Reminder obat belum tersinkron.');
      }

      await publicLogKonsumsiObat({
        reminder_obat_id: data.reminderObatId,
        status: 'diminum',
        logged_at: data.loggedAt,
        tanggal: data.tanggal,
        waktu: data.waktu,
        alarm_waktu: data.alarmWaktu,
      });
      await consumePatientReminderStock({
        reminderObatId: data.reminderObatId || null,
        reminderLocalId: data.reminderLocalId || null,
      });
    } catch (error) {
      await consumePatientReminderStock({
        reminderObatId: data.reminderObatId || null,
        reminderLocalId: data.reminderLocalId || null,
      });

      await enqueuePatientAlarmLog({
        reminder_obat_id: data.reminderObatId || null,
        reminder_local_id: data.reminderLocalId || null,
        status: 'diminum',
        logged_at: data.loggedAt,
        tanggal: data.tanggal,
        waktu: data.waktu,
        alarm_waktu: data.alarmWaktu,
      });
    }
  };

  const openAlarmScreen = (data) => {
    const payload = {
      launchSource: 'notificationTap',
      title: data?.title || 'Waktunya minum obat',
      body: data?.body || 'Alarm aktif. Geser ke kanan untuk mematikan.',
      alarmTime: data?.alarmWaktu || null,
      reminderObatId: data?.reminderObatId || null,
      reminderLocalId: data?.reminderLocalId || null,
      loggedAt: data?.loggedAt || new Date().toISOString(),
      tanggal: data?.tanggal || null,
      waktu: data?.waktu || null,
      alarmWaktu: data?.alarmWaktu || null,
    };

    if (navigationRef.isReady()) {
      navigationRef.navigate('PatientAlarm', payload);
      return;
    }

    pendingAlarmNavigationRef.current = payload;
  };

  // ================= AUTO SYNC =================
  const tryAutoSync = async () => {
    if (isAutoSyncingRef.current) return;

    isAutoSyncingRef.current = true;
    try {
      // Import any events created by the native alarm wiring
      try {
        await importNativePendingEvents();
      } catch (e) {
        // ignore
      }
      if (patientProfile) {
        await syncPendingReminderObat(patientProfile);
        await syncPendingReminderCairan(patientProfile);
      }
      await syncPendingAlarmLogs();
    } finally {
      isAutoSyncingRef.current = false;
    }
  };

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const loadPatientProfile = async () => {
      const saved = await getPatientProfile();
      if (!saved) return;

      if (saved.id) {
        setPatientProfile(saved);
        return;
      }

      try {
        const registrationResponse = await publicRegisterPatient(saved);
        const migratedProfile = {
          ...saved,
          ...(registrationResponse?.data || registrationResponse),
        };

        await storePatientProfile(migratedProfile);
        setPatientProfile(migratedProfile);
      } catch (error) {
        console.error('[AppNavigator] Failed to migrate patient profile:', error);
        setPatientProfile(saved);
      }
    };

    loadPatientProfile();
  }, []);

  // ================= HELPER: process notification response =================
  const processNotificationResponse = (response) => {
    const requestId = response?.notification?.request?.identifier || null;
    const deliveryStamp = response?.notification?.date || null;
    const responseKey = `${requestId || 'unknown'}:${deliveryStamp || 'unknown'}:${response?.actionIdentifier || 'default'}`;

    if (handledNotificationKeyRef.current === responseKey) {
      return;
    }

    const reminderObatId = response.notification.request.content.data?.reminder_obat_id;
    const reminderLocalId = response.notification.request.content.data?.reminder_local_id;
    const alarmWaktu = response.notification.request.content.data?.alarm_waktu;

    if (!reminderObatId && !reminderLocalId) {
      return;
    }

    if (response.actionIdentifier === STOP_ACTION_ID) {
      handledNotificationKeyRef.current = responseKey;
      return;
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const tanggal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const waktu = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    openAlarmScreen({
      reminderObatId: reminderObatId ? Number(reminderObatId) : null,
      reminderLocalId: reminderLocalId || null,
      alarmWaktu: alarmWaktu || null,
      loggedAt: now.toISOString(),
      tanggal,
      waktu,
      title: response.notification.request.content.title,
      body: response.notification.request.content.body,
    });

    handledNotificationKeyRef.current = responseKey;

    Notifications.clearLastNotificationResponseAsync().catch((err) => {
      console.log('clearLastNotificationResponseAsync error:', err);
    });
  };

  // ================= NOTIFICATION + SYNC =================
  useEffect(() => {
    // AKTIFKAN kalau device support (jangan Expo Go kalau error)
    initializeReminderAlarmNotifications();

    // --- COLD START: handle notification tap that launched the app ---
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        processNotificationResponse(response);
      }
      Notifications.clearLastNotificationResponseAsync().catch((err) => {
        console.log('clearLastNotificationResponseAsync error:', err);
      });
    }).catch((err) => {
      console.log('getLastNotificationResponseAsync error:', err);
    });

    const responseSubscription =
      addReminderAlarmResponseListener(async (data) => {
        await handleReminderTaken(data);
      });

    // --- NOTIFICATION TAP: open alarm screen when user taps notification ---
    const openSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      processNotificationResponse(response);
    });

    const deliverySubscription =
      addReminderAlarmDeliveryListener(async (data) => {
        try {
          if (data.reminderObatId) {
            await publicLogKonsumsiObat({
              reminder_obat_id: data.reminderObatId,
              status: 'terlewat',
              logged_at: data.loggedAt,
              tanggal: data.tanggal,
              waktu: data.waktu,
              alarm_waktu: data.alarmWaktu,
            });
            return;
          }

          await enqueuePatientAlarmLog({
            reminder_obat_id: null,
            reminder_local_id: data.reminderLocalId || null,
            status: 'terlewat',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
            alarm_waktu: data.alarmWaktu,
          });
        } catch (error) {
          await enqueuePatientAlarmLog({
            reminder_obat_id: data.reminderObatId || null,
            reminder_local_id: data.reminderLocalId || null,
            status: 'terlewat',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
            alarm_waktu: data.alarmWaktu,
          });
        }
      });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        tryAutoSync();
      }
    });

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        NetInfo.fetch().then((net) => {
          if (net.isConnected && net.isInternetReachable !== false) {
            tryAutoSync();
          }
        });
      }
    });

    return () => {
      unsubscribeNetInfo();
      appStateSub.remove();
      responseSubscription.remove();
      openSubscription.remove();
      deliverySubscription.remove();
    };
  }, [patientProfile]);

  // ================= HANDLERS =================
  const handleLogout = async () => {
    await logout();
    setSelectedRole(null);
  };

  const consumePatientReminderStock = async ({ reminderObatId, reminderLocalId }) => {
    const queue = await getPatientReminderObatQueue();
    const target = queue.find((item) => {
      if (reminderLocalId && item.local_id === reminderLocalId) return true;
      if (reminderObatId && item.server_id && Number(item.server_id) === Number(reminderObatId)) return true;
      return false;
    });

    if (!target) return;

    const perDose = Math.max(0.25, parseFloat(target.jumlah_per_minum || 1));
    const currentStock = Math.max(0, parseFloat(target.jumlah_obat || 0));
    const nextStock = Math.max(0, currentStock - perDose);
    const alarmIds = Array.isArray(target.alarm_notification_ids) ? target.alarm_notification_ids : [];

    if (nextStock <= 0 && alarmIds.length > 0) {
      await cancelReminderObatAlarms(alarmIds);
      await updatePatientReminderObatAlarmIds(target.local_id, []);
    }

    await updatePatientReminderObatItem(target.local_id, {
      jumlah_obat: nextStock,
    });
  };

  const handlePatientSubmit = async (profile) => {
    await storePatientProfile(profile);
    setPatientProfile(profile);
    setSelectedRole('pasien-dashboard');
  };

  const handlePatientEdit = () => setSelectedRole('pasien');
  const handlePatientExit = async () => {
    await clearPatientProfile();
    setPatientProfile(null);
    setSelectedRole(null);
  };

  const handlePatientMenu = async (menuKey) => {
    if (menuKey === 'obat') return setSelectedRole('pasien-reminder-obat');
    if (menuKey === 'cairan') return setSelectedRole('pasien-reminder-cairan');
    if (menuKey === 'informasi-obat') {
      setSelectedObatInfo(null);
      return setSelectedRole('pasien-informasi-obat');
    }
    if (menuKey === 'tanya' || menuKey === 'tanya-apoteker') {
      await openRandomApotekerWhatsApp(patientProfile);
      return;
    }
    if (menuKey === 'kuisioner') {
      return setSelectedRole('pasien-kuisioner');
    }

    setSelectedRole('pasien-dashboard');
  };

  const handleBackToDashboard = () =>
    setSelectedRole('pasien-dashboard');

  const handleOpenObatInfoDetail = (obat) => {
    setSelectedObatInfo(obat);
    setSelectedRole('pasien-informasi-obat-detail');
  };

  const handleBackToObatInfoList = () => {
    setSelectedObatInfo(null);
    setSelectedRole('pasien-informasi-obat');
  };

  const handleClearPatientProfile = async () => {
    await clearPatientProfile();
    setPatientProfile(null);
    setSelectedRole('pasien');
  };

  // ================= LOADING =================
  const renderLoading = () => (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );

  // ================= NAVIGATION =================
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingAlarmNavigationRef.current) {
          const pending = pendingAlarmNavigationRef.current;
          pendingAlarmNavigationRef.current = null;
          navigationRef.navigate('PatientAlarm', pending);
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash">
            {() => renderLoading()}
          </Stack.Screen>
        ) : !user ? (
          selectedRole === 'apoteker' ? (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={login}
                  onBack={() => setSelectedRole(null)}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-dashboard' && patientProfile ? (
            <Stack.Screen name="PatientDashboard">
              {(props) => (
                <PatientDashboardScreen
                  {...props}
                  profile={patientProfile}
                  onEditProfile={handlePatientEdit}
                  onBack={handlePatientExit}
                  onOpenMenu={handlePatientMenu}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-reminder-obat' && patientProfile ? (
            <Stack.Screen name="PatientReminderObat">
              {(props) => (
                <PatientReminderObatScreen
                  {...props}
                  profile={patientProfile}
                  onBack={handleBackToDashboard}
                  onOpenDetail={handleOpenObatInfoDetail}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-reminder-cairan' && patientProfile ? (
            <Stack.Screen name="PatientReminderCairan">
              {(props) => (
                <PatientReminderCairanScreen
                  {...props}
                  profile={patientProfile}
                  onBack={handleBackToDashboard}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-informasi-obat-detail' && patientProfile && selectedObatInfo ? (
            <Stack.Screen name="PatientInformasiObatDetail">
              {(props) => (
                <PatientInformasiObatDetailScreen
                  {...props}
                  obat={selectedObatInfo}
                  onBack={handleBackToObatInfoList}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-informasi-obat' && patientProfile ? (
            <Stack.Screen name="PatientInformasiObatList">
              {(props) => (
                <PatientInformasiObatListScreen
                  {...props}
                  onBack={handleBackToDashboard}
                  onOpenDetail={handleOpenObatInfoDetail}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien-kuisioner' && patientProfile ? (
            <Stack.Screen name="KuisionerStack">
              {() => (
                <KuisionerNavigator
                  patientProfile={patientProfile}
                  onBack={handleBackToDashboard}
                />
              )}
            </Stack.Screen>
          ) : selectedRole === 'pasien' ? (
            <Stack.Screen name="PatientHome">
              {(props) => (
                <PatientHomeScreen
                  {...props}
                  onBack={() => setSelectedRole(null)}
                  onSubmitSuccess={handlePatientSubmit}
                  existingProfile={patientProfile}
                />
              )}
            </Stack.Screen>
          ) : patientProfile ? (
            <Stack.Screen name="PatientDashboardDefault">
              {(props) => (
                <PatientDashboardScreen
                  {...props}
                  profile={patientProfile}
                  onEditProfile={handlePatientEdit}
                  onBack={handlePatientExit}
                  onOpenMenu={handlePatientMenu}
                />
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Entry">
              {() => (
                <EntryScreen
                  onSelectApoteker={() => setSelectedRole('apoteker')}
                  onSelectPasien={() => setSelectedRole('pasien')}
                />
              )}
            </Stack.Screen>
          )
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={MainTabNavigator}
              initialParams={{ user, onLogout: handleLogout }}
            />
            <Stack.Screen name="SelectBrand" component={SelectBrandScreen} />
            <Stack.Screen
              name="PatientDetail"
              component={PatientDetailScreen}
            />
          </>
        )}
        <Stack.Screen name="PatientAlarm" options={{ presentation: 'fullScreenModal' }}>
          {(props) => <PatientAlarmScreen {...props} onTaken={handleReminderTaken} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
