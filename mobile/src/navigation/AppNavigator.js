import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import EntryScreen from '../screens/EntryScreen';
import LoginScreen from '../screens/LoginScreen';
import PatientHomeScreen from '../screens/pasien/PatientHomeScreen';
import PatientDashboardScreen from '../screens/pasien/PatientDashboardScreen';
import PatientReminderObatScreen from '../screens/pasien/PatientReminderObatScreen';
import { View, ActivityIndicator, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator();

import MainTabNavigator from './MainTabNavigator';
import { clearPatientProfile, getPatientProfile, storePatientProfile } from '../storage/patientStorage';
import { syncPendingReminderObat } from '../services/patientSyncService';
import { publicLogKonsumsiObat } from '../services/patientService';
import { addReminderAlarmResponseListener, initializeReminderAlarmNotifications } from '../services/reminderAlarmService';
import { enqueuePatientAlarmLog } from '../storage/patientAlarmLogStorage';
import { syncPendingAlarmLogs } from '../services/patientAlarmLogSyncService';

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const isAutoSyncingRef = useRef(false);

  const tryAutoSync = async () => {
    if (isAutoSyncingRef.current) {
      return;
    }

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

  useEffect(() => {
    const loadPatientProfile = async () => {
      const savedProfile = await getPatientProfile();
      if (savedProfile) {
        setPatientProfile(savedProfile);
      }
    };

    loadPatientProfile();
  }, []);

  useEffect(() => {
    initializeReminderAlarmNotifications();

    const responseSubscription = addReminderAlarmResponseListener(async ({ reminderObatId, loggedAt, tanggal, waktu, alarmWaktu }) => {
      try {
        await publicLogKonsumsiObat({
          reminder_obat_id: reminderObatId,
          status: 'diminum',
          logged_at: loggedAt,
          tanggal,
          waktu,
          alarm_waktu: alarmWaktu,
        });
      } catch (error) {
        await enqueuePatientAlarmLog({
          reminder_obat_id: reminderObatId,
          status: 'diminum',
          logged_at: loggedAt,
          tanggal,
          waktu,
          alarm_waktu: alarmWaktu,
        });
        console.error('Gagal kirim log konsumsi obat dari alarm, masuk queue offline:', error?.message || error);
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        tryAutoSync();
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        NetInfo.fetch().then((state) => {
          if (state.isConnected && state.isInternetReachable !== false) {
            tryAutoSync();
          }
        });
      }
    });

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
      responseSubscription.remove();
    };
  }, [patientProfile]);

  const handleLogout = async () => {
    await logout();
    setSelectedRole(null);
  };

  const handlePatientSubmit = async (profile) => {
    await storePatientProfile(profile);
    setPatientProfile(profile);
    setSelectedRole('pasien-dashboard');
  };

  const handlePatientEdit = () => {
    setSelectedRole('pasien');
  };

  const handlePatientExit = async () => {
    setSelectedRole(null);
  };

  const handlePatientMenu = (menuKey) => {
    if (menuKey === 'obat') {
      setSelectedRole('pasien-reminder-obat');
      return;
    }

    setSelectedRole('pasien-dashboard');
  };

  const handleBackToPatientDashboard = () => {
    setSelectedRole('pasien-dashboard');
  };

  const handleClearPatientProfile = async () => {
    await clearPatientProfile();
    setPatientProfile(null);
    setSelectedRole('pasien');
  };

  const renderLoading = () => (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
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
                  onBack={handleBackToPatientDashboard}
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
          <Stack.Screen name="Dashboard" component={MainTabNavigator} initialParams={{ user, onLogout: handleLogout }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
