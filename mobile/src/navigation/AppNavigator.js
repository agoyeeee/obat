import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';
import MainTabNavigator from './MainTabNavigator';
import PatientDetailScreen from '../screens/apoteker/PatientDetailScreen';

const RootTab = createBottomTabNavigator();

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();

  const renderLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );

  return (
    <NavigationContainer>
      <RootTab.Navigator 
        screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { display: 'none' } 
        }}
      >
        {isLoading ? (
          <RootTab.Screen name="Splash">
            {() => renderLoading()}
          </RootTab.Screen>
        ) : !user ? (
          <RootTab.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={login} />}
          </RootTab.Screen>
        ) : (
          <>
            <RootTab.Screen name="Dashboard" component={MainTabNavigator} initialParams={{ user, onLogout: logout }} />
            <RootTab.Screen name="PatientDetail" component={PatientDetailScreen} />
          </>
        )}
      </RootTab.Navigator>
    </NavigationContainer>
  );
}
