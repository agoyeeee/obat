// Determine API base URL based on environment
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';
// Fallback for Android Emulator (10.0.2.2 is special alias for host machine)
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:8000/api';

// Use environment variable first, then localhost, then android emulator fallback
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

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
