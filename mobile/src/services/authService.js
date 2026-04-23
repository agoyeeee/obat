import api from './api';

export const loginApoteker = async (nama, password) => {
  const response = await api.post('/auth/login', { nama, password });
  return response.data;
};

export const logoutApoteker = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore server error on logout
  }
};
