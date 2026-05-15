import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const CACHED_PUBLIC_OBAT_KEY = '@cached_public_obat_list';
const CACHED_PUBLIC_KUISIONER_KEY = '@cached_public_kuisioner_list';

const readCachedJson = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('[API] readCachedJson failed:', key, error?.message || error);
    return null;
  }
};

const writeCachedJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[API] writeCachedJson failed:', key, error?.message || error);
  }
};

export const publicRegisterPatient = async (payload) => {
  const response = await api.post('/pasien/public-register', payload);
  return response.data;
};

export const publicUpdatePatient = async (patientId, payload) => {
  const response = await api.put(`/pasien/public-update/${patientId}`, payload);
  return response.data;
};

export const fetchPublicObatList = async () => {
  try {
    const response = await api.get('/obat/public-list');
    await writeCachedJson(CACHED_PUBLIC_OBAT_KEY, response.data);
    return response.data;
  } catch (error) {
    const cached = await readCachedJson(CACHED_PUBLIC_OBAT_KEY);
    console.warn('[API] fetchPublicObatList failed, using cache:', error?.message || error);
    return Array.isArray(cached) ? cached : [];
  }
};

export const fetchPublicApotekerContacts = async () => {
  const response = await api.get('/apoteker/public-contacts');
  return response.data;
};

export const publicSyncReminderObat = async (payload) => {
  const response = await api.post('/pasien/public-sync-reminder-obat', payload);
  return response.data;
};

export const publicLogKonsumsiObat = async (payload) => {
  const response = await api.post('/pasien/public-log-konsumsi-obat', payload);
  return response.data;
};

export const publicLogKonsumsiCairan = async (payload) => {
  const response = await api.post('/pasien/public-log-konsumsi-cairan', payload);
  return response.data;
};

export const publicSyncReminderCairan = async (payload) => {
  const response = await api.post('/pasien/public-sync-reminder-cairan', payload);
  return response.data;
};

export const publicLogKonsumsiCairanAlarm = async (payload) => {
  const response = await api.post('/pasien/public-log-konsumsi-cairan-alarm', payload);
  return response.data;
};

export const publicListLogKonsumsiCairan = async (payload) => {
  const response = await api.post('/pasien/public-log-konsumsi-cairan/list', payload);
  return response.data;
};

// Kuisioner endpoints (public)
export const fetchAllKuisioner = async () => {
  try {
    const response = await api.get('/kuisioner/public-list');
    console.log('[API] fetchAllKuisioner success:', response.data);
    await writeCachedJson(CACHED_PUBLIC_KUISIONER_KEY, response.data);
    return response.data;
  } catch (error) {
    const cached = await readCachedJson(CACHED_PUBLIC_KUISIONER_KEY);
    console.warn('[API] fetchAllKuisioner failed, using cache:', error?.message || error);
    return Array.isArray(cached) ? cached : [];
  }
};

export const fetchPastKuisionerResponses = async (patientId) => {
  try {
    const response = await api.get(`/rekap-kuisioner/public-by-pasien/${patientId}`);
    console.log('[API] fetchPastKuisionerResponses success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] fetchPastKuisionerResponses failed:', error.message);
    throw error;
  }
};

export const fetchKuisionerDetail = async (rekapKuisionerId) => {
  const cacheKey = `@cached_kuisioner_detail_${rekapKuisionerId}`;

  try {
    const response = await api.get(`/rekap-kuisioner/public-show/${rekapKuisionerId}`);
    console.log('[API] fetchKuisionerDetail success:', response.data);
    await writeCachedJson(cacheKey, response.data);
    return response.data;
  } catch (error) {
    const cached = await readCachedJson(cacheKey);
    console.warn('[API] fetchKuisionerDetail failed, using cache:', error?.message || error);
    return cached || null;
  }
};

export const fetchApotekerKuisionerRekaps = async () => {
  try {
    const response = await api.get('/rekap-kuisioner');
    console.log('[API] fetchApotekerKuisionerRekaps success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] fetchApotekerKuisionerRekaps failed:', error.message);
    throw error;
  }
};

export const createKuisioner = async (payload) => {
  try {
    const response = await api.post('/kuisioner', payload);
    console.log('[API] createKuisioner success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] createKuisioner failed:', error.message);
    throw error;
  }
};

export const updateKuisioner = async (kuisionerId, payload) => {
  try {
    const response = await api.put(`/kuisioner/${kuisionerId}`, payload);
    console.log('[API] updateKuisioner success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] updateKuisioner failed:', error.message);
    throw error;
  }
};

export const deleteKuisioner = async (kuisionerId) => {
  try {
    const response = await api.delete(`/kuisioner/${kuisionerId}`);
    console.log('[API] deleteKuisioner success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] deleteKuisioner failed:', error.message);
    throw error;
  }
};

export const submitKuisionerAnswers = async (patientId, tanggal, jawaban) => {
  try {
    const response = await api.post('/rekap-kuisioner/public-store', {
      pasien_id: patientId,
      tanggal: tanggal,
      jawaban: jawaban,
    });
    console.log('[API] submitKuisionerAnswers success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] submitKuisionerAnswers failed:', error.message);
    throw error;
  }
};
