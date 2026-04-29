import api from './api';

export const fetchReminders = async (pasien_id) => {
  const params = pasien_id ? { pasien_id: Number(pasien_id) } : {};
  const response = await api.get('/reminder-obat', { params });
  return response.data;
};

export const fetchMedicines = async () => {
  const response = await api.get('/obat');
  return response.data;
};

export const createMedicine = async (data) => {
  const response = await api.post('/obat', data);
  return response.data;
};

export const updateMedicine = async (medicineId, data) => {
  const response = await api.put(`/obat/${medicineId}`, data);
  return response.data;
};

export const deleteMedicine = async (medicineId) => {
  const response = await api.delete(`/obat/${medicineId}`);
  return response.data;
};

export const fetchMerksByObat = async (obatId) => {
  const response = await api.get(`/obat/${obatId}`);
  return response.data?.merks || [];
};

export const createMerk = async (data) => {
  const response = await api.post('/merk', data);
  return response.data;
};

export const fetchWeeklyAdherence = async (pasien_id) => {
  if (!pasien_id) return null;
  const response = await api.get('/rekapan-obat', { params: { pasien_id: Number(pasien_id) } });
  return response.data?.length > 0 ? response.data[0] : null;
};

export const createReminder = async (data) => {
  const response = await api.post('/reminder-obat', data);
  return response.data;
};

export const updateIntakeStatus = async (scheduleId, status) => {
  const response = await api.put(`/reminder-obat/${scheduleId}`, { skor_kepatuhan: status });
  return response.data;
};
