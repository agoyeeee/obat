import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

import EntryScreen from '../screens/EntryScreen';
import LoginScreen from '../screens/LoginScreen';
import PatientHomeScreen from '../screens/pasien/PatientHomeScreen';
import PatientDashboardScreen from '../screens/pasien/PatientDashboardScreen';
import PatientReminderObatScreen from '../screens/pasien/PatientReminderObatScreen';
import PatientDetailScreen from '../screens/apoteker/PatientDetailScreen';

import { View, ActivityIndicator, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import MainTabNavigator from './MainTabNavigator';

import {
  clearPatientProfile,
  getPatientProfile,
  storePatientProfile,
} from '../storage/patientStorage';

import { syncPendingReminderObat } from '../services/patientSyncService';
import { publicLogKonsumsiObat } from '../services/patientService';

import {
  addReminderAlarmResponseListener,
  initializeReminderAlarmNotifications,
} from '../services/reminderAlarmService';

import { enqueuePatientAlarmLog } from '../storage/patientAlarmLogStorage';
import { syncPendingAlarmLogs } from '../services/patientAlarmLogSyncService';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);

  const isAutoSyncingRef = useRef(false);

  // ================= AUTO SYNC =================
  const tryAutoSync = async () => {
    if (isAutoSyncingRef.current) return;

    isAutoSyncingRef.current = true;
    try {
      if (patientProfile) {
        await syncPendingReminderObat(patientProfile);
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
      if (saved) setPatientProfile(saved);
    };

    loadPatientProfile();
  }, []);

  // ================= INIT NOTIFICATION + SYNC =================
  useEffect(() => {
    // KOMENTAR: Dimatikan sementara untuk mencegah error push notification di Expo Go
    // initializeReminderAlarmNotifications();

    // const responseSubscription =
    //   addReminderAlarmResponseListener(async (data) => {
    //     try {
    //       await publicLogKonsumsiObat({
    //         reminder_obat_id: data.reminderObatId,
    //         status: 'diminum',
    //         logged_at: data.loggedAt,
    //         tanggal: data.tanggal,
    //         waktu: data.waktu,
    //         alarm_waktu: data.alarmWaktu,
    //       });
    //     } catch (error) {
    //       await enqueuePatientAlarmLog({
    //         reminder_obat_id: data.reminderObatId,
    //         status: 'diminum',
    //         logged_at: data.loggedAt,
    //         tanggal: data.tanggal,
    //         waktu: data.waktu,
    //         alarm_waktu: data.alarmWaktu,
    //       });

    //       console.error('Offline queue:', error?.message || error);
    //     }
    //   });

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
      // if (responseSubscription) responseSubscription.remove();
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
  const handlePatientExit = () => setSelectedRole(null);

  const handlePatientMenu = (menuKey) => {
    if (menuKey === 'obat') {
      setSelectedRole('pasien-reminder-obat');
    } else {
      setSelectedRole('pasien-dashboard');
    }
  };

  const handleBackToDashboard = () =>
    setSelectedRole('pasien-dashboard');

  const handleClearPatientProfile = async () => {
    await clearPatientProfile();
    setPatientProfile(null);
    setSelectedRole('pasien');
  };

  // ================= LOADING =================
  const renderLoading = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
      }}
    >
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
          ) : selectedRole === 'pasien-reminder-obat' &&
            patientProfile ? (
            <Stack.Screen name="PatientReminderObat">
              {(props) => (
                <PatientReminderObatScreen
                  {...props}
                  profile={patientProfile}
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
                  onSelectApoteker={() =>
                    setSelectedRole('apoteker')
                  }
                  onSelectPasien={() =>
                    setSelectedRole('pasien')
                  }
                />
              )}
            </Stack.Screen>
          )
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={MainTabNavigator}
              initialParams={{
                user,
                onLogout: handleLogout,
              }}
            />
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