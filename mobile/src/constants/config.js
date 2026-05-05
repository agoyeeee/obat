import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine API base URL based on environment
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';
// Fallback for Android Emulator (10.0.2.2 is special alias for host machine)
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:8000/api';

const getExpoHostUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;

  const withoutProtocol = hostUri.replace(/^exp(s)?:\/\//, '');
  const host = withoutProtocol.split(':')[0];
  if (!host) return null;

  return `http://${host}:8000/api`;
};

const resolveApiBaseUrl = () => {
  const expoHostUrl = getExpoHostUrl();
  if (Platform.OS !== 'web' && expoHostUrl) return expoHostUrl;

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (Platform.OS === 'web' && expoHostUrl) return expoHostUrl;

  if (Platform.OS === 'android') {
    return ANDROID_EMULATOR_URL;
  }

  return DEFAULT_API_BASE_URL;
};

// Use environment variable first, then platform-aware fallback
export const API_BASE_URL = resolveApiBaseUrl();

// Also export for debugging
export const DEBUG_API_URL = {
  default: DEFAULT_API_BASE_URL,
  emulator: ANDROID_EMULATOR_URL,
  current: API_BASE_URL,
};

export const COLORS = {
  primary: '#0D9488',
  primaryLight: '#CCFBF1',
  primaryDark: '#115E59',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
};
