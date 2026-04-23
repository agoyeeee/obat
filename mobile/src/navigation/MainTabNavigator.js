import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { Home, Pill, Activity, ClipboardList } from 'lucide-react-native';

// Tab Screens (Entry points)
import DashboardHomeScreen from '../screens/dashboard/DashboardHomeScreen';
import MedicineListScreen from '../screens/obat/MedicineListScreen';
import MonitoringListScreen from '../screens/monitoring/MonitoringListScreen';
import QuestionnaireListScreen from '../screens/kuisioner/QuestionnaireListScreen';

import PatientDetailScreen from '../screens/dashboard/PatientDetailScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const MonitoringStack = createNativeStackNavigator();
const KuisionerStack = createNativeStackNavigator();

// --- STACKS --- //
function DashboardStackNavigator({ route }) {
  const { user, onLogout } = route.params || {};
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" initialParams={{ user, onLogout }}>
        {(props) => <DashboardHomeScreen {...props} />}
      </DashboardStack.Screen>
      <DashboardStack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </DashboardStack.Navigator>
  );
}

function MonitoringStackNavigator() {
  return (
    <MonitoringStack.Navigator screenOptions={{ headerShown: false }}>
      <MonitoringStack.Screen name="MonitoringList" component={MonitoringListScreen} />
      {/* Monitoring detail will go here */}
    </MonitoringStack.Navigator>
  );
}

function KuisionerStackNavigator() {
  return (
    <KuisionerStack.Navigator screenOptions={{ headerShown: false }}>
      <KuisionerStack.Screen name="QuestionnaireList" component={QuestionnaireListScreen} />
    </KuisionerStack.Navigator>
  );
}

// --- MAIN TAB NAVIGATOR --- //
export default function MainTabNavigator({ route }) {
  const { user, onLogout } = route.params || {};

  return (
    <Tab.Navigator
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
        component={DashboardStackNavigator} 
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
        component={MonitoringStackNavigator} 
        options={{ 
          tabBarLabel: 'Pantau',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="KuisionerTab" 
        component={KuisionerStackNavigator} 
        options={{ 
          tabBarLabel: 'Kuisioner',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
