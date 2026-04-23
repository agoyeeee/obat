import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAuthData = async (token, user) => {
  try {
    await AsyncStorage.setItem('@auth_token', token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
  } catch (e) {
    console.error('Error storing auth data', e);
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    const userString = await AsyncStorage.getItem('@auth_user');
    const user = userString ? JSON.parse(userString) : null;
    return { token, user };
  } catch (e) {
    console.error('Error getting auth data', e);
    return { token: null, user: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@auth_user');
  } catch (e) {
    console.error('Error clearing auth data', e);
  }
};
