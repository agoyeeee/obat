import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENT_PROFILE_KEY = '@patient_profile';

export const storePatientProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(PATIENT_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error storing patient profile', error);
  }
};

export const getPatientProfile = async () => {
  try {
    const value = await AsyncStorage.getItem(PATIENT_PROFILE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error reading patient profile', error);
    return null;
  }
};

export const clearPatientProfile = async () => {
  try {
    await AsyncStorage.removeItem(PATIENT_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing patient profile', error);
  }
};
