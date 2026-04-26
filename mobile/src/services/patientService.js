import api from './api';

export const publicRegisterPatient = async (payload) => {
  const response = await api.post('/pasien/public-register', payload);
  return response.data;
};
