import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

import MainTabNavigator from './MainTabNavigator';

export default function AppNavigator() {
  const { user, isLoading, login, logout } = useAuth();

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
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={login} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dashboard" component={MainTabNavigator} initialParams={{ user, onLogout: logout }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
