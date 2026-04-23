import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Tab Screens (Entry points)
import DashboardHomeScreen from '../screens/dashboard/DashboardHomeScreen';
import MedicineListScreen from '../screens/obat/MedicineListScreen';
import MonitoringListScreen from '../screens/monitoring/MonitoringListScreen';
import QuestionnaireListScreen from '../screens/kuisioner/QuestionnaireListScreen';

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
      {/* Patient detail will go here */}
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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>
        }} 
      />
      <Tab.Screen 
        name="ObatTab" 
        component={MedicineListScreen} 
        options={{ 
          tabBarLabel: 'Obat',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💊</Text>
        }} 
      />
      <Tab.Screen 
        name="MonitoringTab" 
        component={MonitoringStackNavigator} 
        options={{ 
          tabBarLabel: 'Pantau',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text>
        }} 
      />
      <Tab.Screen 
        name="KuisionerTab" 
        component={KuisionerStackNavigator} 
        options={{ 
          tabBarLabel: 'Kuisioner',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>
        }} 
      />
    </Tab.Navigator>
  );
}
