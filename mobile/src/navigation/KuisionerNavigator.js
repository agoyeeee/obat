import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientKuisionerListScreen from '../screens/pasien/PatientKuisionerListScreen';
import PatientKuisionerFormScreen from '../screens/pasien/PatientKuisionerFormScreen';
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
        name="KuisionerList"
        options={{
          animationEnabled: false,
        }}
      >
        {(props) => (
          <PatientKuisionerListScreen
            {...props}
            route={{ params: { patientProfile } }}
            onBack={onBack}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="KuisionerForm"
        options={{
          animationEnabled: true,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {(props) => (
          <PatientKuisionerFormScreen
            {...props}
            route={{ params: { patientProfile, kuisioners: [] } }}
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
