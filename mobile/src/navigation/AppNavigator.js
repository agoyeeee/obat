import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import EntryScreen from '../screens/EntryScreen';
import LoginScreen from '../screens/LoginScreen';
import PatientHomeScreen from '../screens/pasien/PatientHomeScreen';
import PatientDashboardScreen from '../screens/pasien/PatientDashboardScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

import MainTabNavigator from './MainTabNavigator';
import { clearPatientProfile, getPatientProfile, storePatientProfile } from '../storage/patientStorage';

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    const loadPatientProfile = async () => {
      const savedProfile = await getPatientProfile();
      if (savedProfile) {
        setPatientProfile(savedProfile);
      }
    };

    loadPatientProfile();
  }, []);

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
