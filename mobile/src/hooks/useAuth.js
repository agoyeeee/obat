import { useState, useEffect } from 'react';
import { getAuthData, storeAuthData, clearAuthData } from '../storage/authStorage';
import { loginApoteker, logoutApoteker } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    const data = await getAuthData();
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
    }
    setIsLoading(false);
  };

  const login = async (nama, password) => {
    setIsLoading(true);
    try {
      const data = await loginApoteker(nama, password);
      await storeAuthData(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutApoteker();
    await clearAuthData();
    setToken(null);
    setUser(null);
  };

  return { user, token, isLoading, login, logout };
};
