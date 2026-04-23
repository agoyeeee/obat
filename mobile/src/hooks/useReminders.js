import { useState, useCallback } from 'react';
import { fetchReminders, fetchMedicines, fetchWeeklyAdherence, updateIntakeStatus, createReminder } from '../services/reminderService';

export const useReminders = () => {
  const [schedules, setSchedules] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async (pasien_id) => {
    setIsLoading(true);
    try {
      const [schedulesData, medicinesData, adherenceData] = await Promise.all([
        fetchReminders(pasien_id),
        fetchMedicines(),
        fetchWeeklyAdherence(pasien_id)
      ]);
      setSchedules(schedulesData || []);
      setMedicines(medicinesData || []);
      setAdherence(adherenceData);
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markIntake = async (scheduleId, status) => {
    try {
      await updateIntakeStatus(scheduleId, status);
      return { success: true };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || 'Update failed' };
    }
  };

  const addReminder = async (data) => {
    try {
      await createReminder(data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || 'Create failed' };
    }
  };

  return { schedules, medicines, adherence, isLoading, loadData, markIntake, addReminder };
};
