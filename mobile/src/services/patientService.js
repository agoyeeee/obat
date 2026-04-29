import api from './api';

export const publicRegisterPatient = async (payload) => {
  const response = await api.post('/pasien/public-register', payload);
  return response.data;
};

export const fetchPublicObatList = async () => {
  const response = await api.get('/obat/public-list');
  return response.data;
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
    return response.data;
  } catch (error) {
    console.error('[API] fetchAllKuisioner failed:', error.message);
    throw error;
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
  try {
    const response = await api.get(`/rekap-kuisioner/public-show/${rekapKuisionerId}`);
    console.log('[API] fetchKuisionerDetail success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] fetchKuisionerDetail failed:', error.message);
    throw error;
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
