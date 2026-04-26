import api from './api';

export const publicRegisterPatient = async (payload) => {
  const response = await api.post('/pasien/public-register', payload);
  return response.data;
};

export const fetchPublicObatList = async () => {
  const response = await api.get('/obat/public-list');
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
