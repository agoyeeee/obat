import { useState, useCallback } from 'react';
import { fetchReminders, fetchMedicines, fetchWeeklyAdherence, updateIntakeStatus, createReminder, createMedicine } from '../services/reminderService';

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

  const addMedicine = async (data) => {
    try {
      const created = await createMedicine(data);
      return { success: true, data: created };
    } catch (error) {
      const responseData = error?.response?.data;
      const validationErrors = responseData?.errors;

      const fieldLabels = {
        nama_obat: 'Nama Obat',
        indikasi: 'Indikasi',
        dosis_inisiasi: 'Dosis Inisiasi',
        dosis_target: 'Dosis Target',
        frekuensi_default: 'Frekuensi Default',
        kontraindikasi: 'Kontraindikasi',
        efek_samping: 'Efek Samping',
        monitoring: 'Monitoring',
      };

      if (validationErrors && typeof validationErrors === 'object') {
        const detailedMessage = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const text = Array.isArray(messages) ? messages.join(', ') : String(messages);
            return `${fieldLabels[field] || field}: ${text}`;
          })
          .join('\n');

        return { success: false, message: detailedMessage };
      }

      return { success: false, message: responseData?.message || 'Create medicine failed' };
    }
  };

  return { schedules, medicines, adherence, isLoading, loadData, markIntake, addReminder, addMedicine };
};
