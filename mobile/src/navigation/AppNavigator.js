import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

import EntryScreen from '../screens/EntryScreen';
import LoginScreen from '../screens/LoginScreen';

import PatientHomeScreen from '../screens/pasien/PatientHomeScreen';
import PatientDashboardScreen from '../screens/pasien/PatientDashboardScreen';
import PatientReminderObatScreen from '../screens/pasien/PatientReminderObatScreen';
import PatientReminderCairanScreen from '../screens/pasien/PatientReminderCairanScreen';
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
  publicLogKonsumsiCairanAlarm,
  publicRegisterPatient,
} from '../services/patientService';

import {
  addReminderAlarmResponseListener,
  initializeReminderAlarmNotifications,
} from '../services/reminderAlarmService';

import {
  addReminderCairanAlarmResponseListener,
  initializeReminderCairanNotifications,
} from '../services/reminderCairanAlarmService';

import { enqueuePatientAlarmLog } from '../storage/patientAlarmLogStorage';
import { syncPendingAlarmLogs } from '../services/patientAlarmLogSyncService';
import { openRandomApotekerWhatsApp } from '../utils/helpers';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [selectedObatInfo, setSelectedObatInfo] = useState(null);

  const isAutoSyncingRef = useRef(false);

  // ================= AUTO SYNC =================
  const tryAutoSync = async () => {
    if (isAutoSyncingRef.current) return;

    isAutoSyncingRef.current = true;
    try {
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

  // ================= NOTIFICATION + SYNC =================
  useEffect(() => {
    // AKTIFKAN kalau device support (jangan Expo Go kalau error)
    initializeReminderAlarmNotifications();
    initializeReminderCairanNotifications();

    const responseSubscription =
      addReminderAlarmResponseListener(async (data) => {
        try {
          await publicLogKonsumsiObat({
            reminder_obat_id: data.reminderObatId,
            status: 'diminum',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
            alarm_waktu: data.alarmWaktu,
          });
        } catch (error) {
          await enqueuePatientAlarmLog({
            reminder_obat_id: data.reminderObatId,
            status: 'diminum',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
            alarm_waktu: data.alarmWaktu,
          });
        }
      });

    const cairanSubscription =
      addReminderCairanAlarmResponseListener(async (data) => {
        try {
          await publicLogKonsumsiCairanAlarm({
            reminder_cairan_id: data.reminderCairanId,
            status: 'diminum',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
            alarm_waktu: data.alarmWaktu,
          });
        } catch (error) {
          await enqueuePatientAlarmLog({
            entity_type: 'cairan',
            reminder_cairan_id: data.reminderCairanId,
            status: 'diminum',
            logged_at: data.loggedAt,
            tanggal: data.tanggal,
            waktu: data.waktu,
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
      cairanSubscription.remove();
    };
  }, [patientProfile]);

  // ================= HANDLERS =================
  const handleLogout = async () => {
    await logout();
    setSelectedRole(null);
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
    if (menuKey === 'tanya-apoteker') {
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
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}