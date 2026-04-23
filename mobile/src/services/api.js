import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getAuthData } from '../storage/authStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const { token } = await getAuthData();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
