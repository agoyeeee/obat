import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Pill, Activity, ClipboardList } from 'lucide-react-native';

// Import Screen Asli
import DashboardHomeScreen from '../screens/apoteker/DashboardHomeScreen';
import MedicineListScreen from '../screens/apoteker/MedicineListScreen';
import MonitoringListScreen from '../screens/apoteker/MonitoringListScreen';
import QuestionnaireListScreen from '../screens/apoteker/QuestionnaireListScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }) {
  const { user, onLogout } = route.params || {};

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingBottom: 12,
          paddingTop: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardHomeScreen} 
        initialParams={{ user, onLogout }}
        options={{ 
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ObatTab" 
        component={MedicineListScreen} 
        options={{ 
          tabBarLabel: 'Obat',
          tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="MonitoringTab" 
        component={MonitoringListScreen} 
        options={{ 
          tabBarLabel: 'Pantau',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="KuisionerTab" 
        component={QuestionnaireListScreen} 
        options={{ 
          tabBarLabel: 'Kuisioner',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
