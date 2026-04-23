import { useState, useCallback } from 'react';
import api from '../services/api';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/pasien');
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { patients, isLoading, fetchPatients };
};
