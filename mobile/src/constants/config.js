import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;
if (!envUrl) {
  console.warn('[config] EXPO_PUBLIC_API_URL is not set; API_BASE_URL will be empty.');
}

const normalizeApiUrl = (url) => {
  if (!url) return '';

  if (Platform.OS === 'android') {
    return url
      .replace('http://localhost:', 'http://10.0.2.2:')
      .replace('http://127.0.0.1:', 'http://10.0.2.2:');
  }

  return url;
};

export const API_BASE_URL = normalizeApiUrl(envUrl);

// Also export for debugging
export const DEBUG_API_URL = {
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
