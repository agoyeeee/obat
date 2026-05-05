import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientKuisionerTahapScreen from '../screens/pasien/PatientKuisionerTahapScreen';
import PatientRekapKuisionerScreen from '../screens/pasien/PatientRekapKuisionerScreen';

const Stack = createNativeStackNavigator();

export default function KuisionerNavigator({ patientProfile, onBack }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="KuisionerTahap"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => (
          <PatientKuisionerTahapScreen
            {...props}
            route={{ params: { patientProfile } }}
            onBack={onBack}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="RekapKuisioner"
        options={{
          animationEnabled: true,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {(props) => (
          <PatientRekapKuisionerScreen
            {...props}
            route={{ params: { rekapId: null } }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
