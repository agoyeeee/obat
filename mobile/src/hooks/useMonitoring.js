import { useState, useCallback } from 'react';
import api from '../services/api';

export const useMonitoring = () => {
  const [todayData, setTodayData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch today's monitoring summary
  const fetchTodaySummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/monitoring/today-summary');
      setTodayData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching today summary:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch weekly monitoring for a specific patient
  const fetchWeeklyMonitoring = useCallback(async (pasienId, startDate) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/monitoring/mingguan', {
        params: {
          pasien_id: pasienId,
          start_date: startDate,
        },
      });
      setWeeklyData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching weekly monitoring:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch monthly monitoring for a specific patient
  const fetchMonthlyMonitoring = useCallback(async (pasienId, month, year) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/monitoring/bulanan', {
        params: {
          pasien_id: pasienId,
          month: month,
          year: year,
        },
      });
      setMonthlyData(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching monthly monitoring:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Log consumption (untuk patient yang melaporkan konsumsi obat)
  const logConsumption = useCallback(async (logData) => {
    try {
      const response = await api.post('/monitoring/log', logData);
      return response.data;
    } catch (err) {
      console.error('Error logging consumption:', err);
      setError(err.message);
      return null;
    }
  }, []);

  return {
    // State
    todayData,
    weeklyData,
    monthlyData,
    isLoading,
    error,
    
    // Methods
    fetchTodaySummary,
    fetchWeeklyMonitoring,
    fetchMonthlyMonitoring,
    logConsumption,
  };
};
