import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, RefreshControl, ActivityIndicator, Modal, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Pill, CloudUpload, CircleCheck, Clock3, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchPublicObatList } from '../../services/patientService';
import { syncPendingReminderObat } from '../../services/patientSyncService';
import { scheduleReminderObatAlarms, cancelReminderObatAlarms } from '../../services/reminderAlarmService';
import {
  addPatientReminderObat,
  getPatientReminderObatQueue,
  updatePatientReminderObatAlarmIds,
  updatePatientReminderObatItem,
  deletePatientReminderObatItem,
} from '../../storage/patientReminderObatStorage';
import { deleteReminderObat } from '../../services/reminderService';

const SEDIAAN_OPTIONS = [
  { label: 'Tablet', value: 'tablet' },
  { label: 'Kapsul', value: 'kapsul' },
  { label: 'Sirup', value: 'sirup' },
];

const ATURAN_OPTIONS = [
  { label: 'Sebelum makan (±30 menit)', value: 'Sebelum makan (±30 menit)' },
  { label: 'Sesudah makan (±30 menit)', value: 'Sesudah makan (±30 menit)' },
  { label: 'Saat makan', value: 'Saat makan' },
  { label: 'Sebelum tidur', value: 'Sebelum tidur' },
  { label: 'Pagi hari', value: 'Pagi hari' },
  { label: 'Malam hari', value: 'Malam hari' },
  { label: 'Custom', value: 'custom' },
];

const TIME_PRESETS = {
  2: ['07.00 - 19.00', '06.00 - 18.00', '08.00 - 20.00'],
  3: ['06.00 - 14.00 - 22.00', '06.30 - 14.30 - 22.30', '07.00 - 15.00 - 23.00', '07.30 - 15.30 - 23.30'],
};

const formatDoseOption = (item) => {
  if (item && typeof item === 'object' && item.dosis !== undefined) {
    const satuan = item.satuan ? ` ${item.satuan}` : '';
    return `${item.dosis}${satuan}`;
  }

  if (item === null || item === undefined) {
    return '';
  }

  return String(item);
};

const pad = (value) => String(value).padStart(2, '0');
const formatTimeHMS = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
const formatTimeHM = (time) => (time ? time.slice(0, 5) : '-');

const resolveDoseOptions = (obat) => {
  if (!obat) return [];

  const options = [];

  if (Array.isArray(obat.dosis_inisiasi) && obat.dosis_inisiasi.length > 0) {
    for (const doseItem of obat.dosis_inisiasi) {
      const label = formatDoseOption(doseItem);
      if (label) {
        options.push({ label, value: label });
      }
    }
  }

  if (options.length === 0 && obat.dosis_target) {
    const label = String(obat.dosis_target);
    options.push({ label, value: label });
  }

  return options;
};

const SelectField = ({ label, valueLabel, placeholder, options, isOpen, onToggle, onSelect }) => (
  <View className="mb-4">
    <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</Text>
    <Pressable
      onPress={onToggle}
      className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50"
    >
      <Text className={valueLabel ? 'text-slate-900 font-medium' : 'text-slate-400'}>{valueLabel || placeholder}</Text>
    </Pressable>
    {isOpen ? (
      <View className="mt-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {options.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => onSelect(item.value)}
            className="px-4 py-3 border-b border-slate-100 active:bg-slate-50"
          >
            <Text className="text-slate-700 font-medium">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    ) : null}
  </View>
);

export default function PatientReminderObatScreen({ onBack, profile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [obatList, setObatList] = useState([]);
  const [activeSelect, setActiveSelect] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [reminderItems, setReminderItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAutoSchedulingAlarm, setIsAutoSchedulingAlarm] = useState(false);

  const [selectedObatId, setSelectedObatId] = useState('');
  const [selectedMerkId, setSelectedMerkId] = useState('');
  const [dosis, setDosis] = useState('');
  const [frekuensi, setFrekuensi] = useState('');
  const [sediaan, setSediaan] = useState('');
  const [waktuKonsumsi, setWaktuKonsumsi] = useState('');
  const [jamCustom, setJamCustom] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [jumlahObat, setJumlahObat] = useState('');
  const [aturanMinum, setAturanMinum] = useState('');
  const [aturanCustom, setAturanCustom] = useState('');
  const [editingReminder, setEditingReminder] = useState(null);

  const loadQueueStats = useCallback(async () => {
    const queue = await getPatientReminderObatQueue();
    const pending = queue.filter((item) => item.sync_status !== 'synced').length;
    const synced = queue.filter((item) => item.sync_status === 'synced').length;
    setPendingCount(pending);
    setSyncedCount(synced);
    setReminderItems(queue);
  }, []);

  const loadObat = useCallback(async () => {
    try {
      const data = await fetchPublicObatList();
      setObatList(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Gagal memuat data obat', error?.message || 'Periksa koneksi backend lalu coba lagi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const attemptSyncPending = useCallback(async (showSuccessAlert = false) => {
    if (!profile) return;

    setIsSyncing(true);

    try {
      const result = await syncPendingReminderObat(profile);

      if (result.skipped && showSuccessAlert) {
        Alert.alert('Sinkronisasi', 'Tidak ada data pending untuk disinkronkan.');
      }

      await loadQueueStats();

      if (showSuccessAlert && !result.skipped) {
        Alert.alert('Sinkronisasi berhasil', `${result.syncedCount} reminder berhasil dikirim ke server.`);
      }
    } catch (error) {
      if (showSuccessAlert) {
        Alert.alert('Sinkronisasi gagal', error?.message || 'Gagal sinkronisasi ke server.');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [profile, loadQueueStats]);

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadObat(), loadQueueStats()]);
      await attemptSyncPending(false);
    };

    bootstrap();
  }, [loadObat, loadQueueStats, attemptSyncPending]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadObat(), loadQueueStats()]);
    await attemptSyncPending(false);
  }, [loadObat, loadQueueStats, attemptSyncPending]);

  const obatOptions = useMemo(
    () => obatList.map((obat) => ({ label: obat.nama_obat, value: String(obat.id) })),
    [obatList]
  );

  const selectedObat = useMemo(
    () => obatList.find((item) => String(item.id) === selectedObatId) || null,
    [obatList, selectedObatId]
  );

  const doseOptions = useMemo(() => resolveDoseOptions(selectedObat), [selectedObat]);

  const merkOptions = useMemo(() => {
    if (!selectedObat?.merks || selectedObat.merks.length === 0) return [];
    return selectedObat.merks.map((merk) => ({ label: merk.nama_merk, value: String(merk.id) }));
  }, [selectedObat]);

  const frekuensiNumber = Number(frekuensi);
  const presetOptions = useMemo(() => {
    const presets = TIME_PRESETS[frekuensiNumber] || [];
    return presets.map((item) => ({ label: item, value: item }));
  }, [frekuensiNumber]);

  const isCustomAturan = aturanMinum === 'custom';
  const isFrekuensiOne = frekuensiNumber === 1;

  const canSubmit = useMemo(() => {
    if (!selectedObatId || !dosis || !sediaan || !jumlahObat || !aturanMinum) return false;
    if (isFrekuensiOne && !jamCustom.trim()) return false;
    if (!isFrekuensiOne && !waktuKonsumsi) return false;
    if (isCustomAturan && !aturanCustom.trim()) return false;
    return true;
  }, [selectedObatId, dosis, sediaan, jumlahObat, aturanMinum, isFrekuensiOne, jamCustom, waktuKonsumsi, isCustomAturan, aturanCustom]);

  const handleSelectObat = (obatId) => {
    setSelectedObatId(obatId);
    setSelectedMerkId('');
    setActiveSelect(null);

    const obat = obatList.find((item) => String(item.id) === String(obatId));
    if (!obat) return;

    const freq = Number(obat.frekuensi_default || 0);
    const obatDoseOptions = resolveDoseOptions(obat);
    setDosis(obatDoseOptions[0]?.value || '');
    setFrekuensi(String(freq || ''));

    if (freq === 1) {
      setWaktuKonsumsi('');
    } else {
      const defaults = TIME_PRESETS[freq] || [];
      setWaktuKonsumsi(defaults[0] || '');
    }

    setJamCustom('');
  };

  const resetForm = () => {
    setSelectedObatId('');
    setSelectedMerkId('');
    setDosis('');
    setFrekuensi('');
    setSediaan('');
    setWaktuKonsumsi('');
    setJamCustom('');
    setJumlahObat('');
    setAturanMinum('');
    setAturanCustom('');
    setActiveSelect(null);
    setEditingReminder(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingReminder(item);
    setSelectedObatId(String(item.obat_id || ''));
    setSelectedMerkId(String(item.merk_id || ''));
    setDosis(item.dosis || '');
    setFrekuensi(String(item.frekuensi || ''));
    setSediaan(item.sediaan || '');
    setWaktuKonsumsi(item.waktu_konsumsi || '');
    setJamCustom(item.frekuensi === 1 ? (item.waktu_konsumsi || '') : '');
    setJumlahObat(String(item.jumlah_obat || ''));
    setAturanMinum(item.aturan_minum || '');
    setAturanCustom('');
    setActiveSelect(null);
    setIsAddModalOpen(true);
  };

  const autoScheduleAlarms = useCallback(async (items) => {
    if (isAutoSchedulingAlarm) return;

    const candidates = (items || []).filter(
      (item) => item.sync_status === 'synced' && item.server_id && (!Array.isArray(item.alarm_notification_ids) || item.alarm_notification_ids.length === 0)
    );

    if (candidates.length === 0) return;

    setIsAutoSchedulingAlarm(true);
    try {
      for (const item of candidates) {
        try {
          const notificationIds = await scheduleReminderObatAlarms(item);
          await updatePatientReminderObatAlarmIds(item.local_id, notificationIds);
        } catch (error) {
          // Keep UI usable even if one alarm schedule fails.
          console.error('Auto schedule alarm failed:', error?.message || error);
        }
      }
      await loadQueueStats();
    } finally {
      setIsAutoSchedulingAlarm(false);
    }
  }, [isAutoSchedulingAlarm, loadQueueStats]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Data belum lengkap', 'Mohon lengkapi semua field reminder obat terlebih dahulu.');
      return;
    }

    const payload = {
      obat_id: Number(selectedObatId),
      merk_id: selectedMerkId ? Number(selectedMerkId) : null,
      nama_obat: selectedObat?.nama_obat || '-',
      nama_merk: selectedMerkId ? (merkOptions.find((m) => m.value === selectedMerkId)?.label || null) : null,
      dosis,
      sediaan,
      frekuensi: Number(frekuensi),
      waktu_konsumsi: isFrekuensiOne ? jamCustom.trim() : waktuKonsumsi,
      jumlah_obat: Number(jumlahObat),
      aturan_minum: isCustomAturan ? aturanCustom.trim() : aturanMinum,
    };

    try {
      setIsSaving(true);
      if (editingReminder) {
        const isSyncedReminder = editingReminder.sync_status === 'synced' && editingReminder.server_id;

        if (isSyncedReminder) {
          await deleteReminderObat(editingReminder.server_id);
          await cancelReminderObatAlarms(editingReminder.alarm_notification_ids || []);
        }

        const updatedLocalItem = await updatePatientReminderObatItem(editingReminder.local_id, {
          ...payload,
          sync_status: isSyncedReminder ? 'pending' : editingReminder.sync_status,
          synced_at: isSyncedReminder ? null : editingReminder.synced_at,
          server_id: isSyncedReminder ? null : editingReminder.server_id,
          alarm_notification_ids: isSyncedReminder ? [] : (editingReminder.alarm_notification_ids || []),
          last_error: null,
        });

        if (isSyncedReminder) {
          await syncPendingReminderObat(profile);
          await loadQueueStats();

          const latestQueue = await getPatientReminderObatQueue();
          const updatedAfterSync = latestQueue.find((item) => item.local_id === editingReminder.local_id);
          if (updatedAfterSync?.sync_status === 'synced' && updatedAfterSync.server_id) {
            try {
              const notificationIds = await scheduleReminderObatAlarms(updatedAfterSync);
              await updatePatientReminderObatAlarmIds(updatedAfterSync.local_id, notificationIds);
              await loadQueueStats();
            } catch (alarmError) {
              console.error('Failed to schedule alarm after edit:', alarmError?.message || alarmError);
            }
          }
        } else {
          await loadQueueStats();
        }

        setIsAddModalOpen(false);
        resetForm();
        Alert.alert('Reminder diperbarui', isSyncedReminder
          ? 'Data diperbarui dan akan tersinkron ulang ke server.'
          : 'Data reminder berhasil diperbarui.'
        );
        return updatedLocalItem;
      }

      const createdItem = await addPatientReminderObat(payload);
      await syncPendingReminderObat(profile);
      await loadQueueStats();

      const latestQueue = await getPatientReminderObatQueue();
      const createdAfterSync = latestQueue.find((item) => item.local_id === createdItem.local_id);
      if (createdAfterSync?.sync_status === 'synced' && createdAfterSync.server_id) {
        try {
          const notificationIds = await scheduleReminderObatAlarms(createdAfterSync);
          await updatePatientReminderObatAlarmIds(createdAfterSync.local_id, notificationIds);
          await loadQueueStats();
        } catch (alarmError) {
          console.error('Failed to auto activate alarm after submit:', alarmError?.message || alarmError);
        }
      }

      setIsAddModalOpen(false);
      resetForm();
      Alert.alert('Reminder ditambahkan', 'Data tersimpan, dan alarm otomatis diaktifkan jika sinkronisasi berhasil.');
    } catch (error) {
      Alert.alert('Gagal menyimpan offline', error?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReminder = async (item) => {
    Alert.alert(
      'Hapus Reminder Obat',
      `Hapus reminder untuk ${item.nama_obat}? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              if (item.sync_status === 'synced' && item.server_id) {
                await deleteReminderObat(item.server_id);
              }

              await cancelReminderObatAlarms(item.alarm_notification_ids || []);

              await deletePatientReminderObatItem(item.local_id);
              await loadQueueStats();
              Alert.alert('Reminder dihapus', 'Reminder obat berhasil dihapus.');
            } catch (error) {
              Alert.alert('Gagal menghapus', error?.message || 'Terjadi kesalahan saat menghapus reminder.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    autoScheduleAlarms(reminderItems);
  }, [reminderItems, autoScheduleAlarms]);

  const handleActivateAlarm = async (item) => {
    if (!item.server_id) {
      Alert.alert('Belum bisa aktifkan alarm', 'Reminder masih pending sync. Sinkronkan dulu agar bisa dipantau apoteker.');
      return;
    }

    try {
      const notificationIds = await scheduleReminderObatAlarms(item);
      await updatePatientReminderObatAlarmIds(item.local_id, notificationIds);
      await loadQueueStats();

      Alert.alert('Alarm aktif', `Alarm untuk ${item.nama_obat} berhasil dijadwalkan.`);
    } catch (error) {
      Alert.alert('Gagal aktifkan alarm', error?.message || 'Terjadi kesalahan saat membuat alarm.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="bg-white pt-14 pb-6 px-6 border-b border-slate-100 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={onBack}
              className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 active:bg-slate-200"
            >
              <ArrowLeft color="#334155" size={18} />
            </Pressable>
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Form Pasien</Text>
              <Text className="text-2xl font-black text-slate-900 tracking-tight mt-1">Reminder Minum Obat</Text>
            </View>
          </View>
          <View className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 items-center justify-center">
            <Pill color="#0D9488" size={20} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-3">
              <View className="flex-row items-center mb-1">
                <Clock3 size={16} color="#B45309" />
                <Text className="ml-1.5 text-xs font-bold text-amber-700 uppercase">Pending</Text>
              </View>
              <Text className="text-2xl font-black text-amber-900">{pendingCount}</Text>
            </View>
            <View className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
              <View className="flex-row items-center mb-1">
                <CircleCheck size={16} color="#047857" />
                <Text className="ml-1.5 text-xs font-bold text-emerald-700 uppercase">Tersinkron</Text>
              </View>
              <Text className="text-2xl font-black text-emerald-900">{syncedCount}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => attemptSyncPending(true)}
            disabled={isSyncing}
            className={`rounded-2xl py-3.5 items-center flex-row justify-center ${isSyncing ? 'bg-slate-300' : 'bg-teal-600 active:bg-teal-700'}`}
          >
            {isSyncing ? <ActivityIndicator color="#FFFFFF" size="small" /> : <CloudUpload color="#FFFFFF" size={18} />}
            <Text className="text-white font-bold text-sm ml-2">{isSyncing ? 'Sinkronisasi...' : 'Sync Sekarang'}</Text>
          </Pressable>
          <Text className="text-xs text-slate-400 mt-2">Data tetap aman di device meskipun sedang offline.</Text>
        </View>

        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-black text-slate-900">Daftar Reminder Obat</Text>
            <Pressable
              onPress={handleOpenAddModal}
              className="bg-blue-600 rounded-xl px-3 py-2 flex-row items-center active:bg-blue-700"
            >
              <Plus color="#FFFFFF" size={16} />
              <Text className="text-white font-bold text-sm ml-1.5">Tambah</Text>
            </Pressable>
          </View>

          {reminderItems.length === 0 ? (
            <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-5">
              <Text className="text-slate-500 text-sm text-center">Belum ada reminder. Tekan tombol Tambah untuk membuat reminder baru.</Text>
            </View>
          ) : (
            reminderItems.map((item) => {
              const isSynced = item.sync_status === 'synced';
              const isAlarmActive = Array.isArray(item.alarm_notification_ids) && item.alarm_notification_ids.length > 0;
              return (
                <View key={item.local_id} className="rounded-2xl border border-slate-200 p-4 mb-3 bg-white">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="text-base font-black text-slate-900 flex-1 mr-2">{item.nama_obat}</Text>
                    <View className={`px-2.5 py-1 rounded-full ${isSynced ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Text className={`text-[10px] font-bold uppercase ${isSynced ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isSynced ? 'Synced' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {item.nama_merk && <Text className="text-xs font-semibold text-slate-500">Merk: {item.nama_merk}</Text>}
                  <Text className="text-xs font-semibold text-slate-500">Dosis {item.dosis} | {item.frekuensi}x/hari</Text>
                  <Text className="text-xs font-semibold text-slate-500 mt-1">Waktu {item.waktu_konsumsi}</Text>
                  <Text className="text-xs font-semibold text-slate-500 mt-1">Aturan {item.aturan_minum}</Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className={`text-xs font-bold ${isAlarmActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isAlarmActive ? 'Alarm Aktif Otomatis' : (isSynced ? 'Menyiapkan Alarm...' : 'Alarm Menunggu Sync')}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-end mt-3">
                    <Pressable
                      onPress={() => openEditModal(item)}
                      className="bg-blue-600 rounded-xl px-3 py-2 mr-2 active:bg-blue-700"
                    >
                      <Text className="text-white text-xs font-bold">Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteReminder(item)}
                      className="bg-rose-600 rounded-xl px-3 py-2 active:bg-rose-700"
                    >
                      <Text className="text-white text-xs font-bold">Hapus</Text>
                    </Pressable>
                  </View>
                  {item.last_error ? (
                    <Text className="text-xs font-semibold text-rose-500 mt-2">Error sync: {item.last_error}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
      >
        <SafeAreaView className="flex-1 bg-slate-50">
          <View className="bg-white px-5 pt-5 pb-4 border-b border-slate-100 flex-row items-center justify-between z-50">
            <Text className="text-lg font-black text-slate-900">{editingReminder ? 'Edit Reminder Obat' : 'Tambah Reminder Obat'}</Text>
            <Pressable
              onPress={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="w-9 h-9 rounded-lg bg-slate-100 items-center justify-center active:bg-slate-200"
            >
              <X color="#334155" size={18} />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 bg-slate-50"
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
n              <SelectField
                label="Nama Obat"
                valueLabel={selectedObat?.nama_obat || ''}
                placeholder="Pilih nama obat"
                options={obatOptions}
                isOpen={activeSelect === 'obat'}
                onToggle={() => setActiveSelect(activeSelect === 'obat' ? null : 'obat')}
                onSelect={handleSelectObat}
              />

              {merkOptions.length > 0 && (
                <SelectField
                  label="Merk Obat"
                  valueLabel={selectedMerkId ? (merkOptions.find((m) => m.value === selectedMerkId)?.label || '') : ''}
                  placeholder={merkOptions.length > 1 ? 'Pilih merk' : merkOptions[0]?.label}
                  options={merkOptions}
                  isOpen={activeSelect === 'merk'}
                  onToggle={() => setActiveSelect(activeSelect === 'merk' ? null : 'merk')}
                  onSelect={(value) => {
                    setSelectedMerkId(value);
                    setActiveSelect(null);
                  }}
                />
              )}

              <SelectField
                label="Dosis"
                valueLabel={dosis}
                placeholder={selectedObat ? 'Pilih dosis' : 'Pilih nama obat dulu'}
                options={doseOptions}
                isOpen={activeSelect === 'dosis'}
                onToggle={() => {
                  if (!selectedObat || doseOptions.length === 0) return;
                  setActiveSelect(activeSelect === 'dosis' ? null : 'dosis');
                }}
                onSelect={(value) => {
                  setDosis(value);
                  setActiveSelect(null);
                }}
              />

              <SelectField
                label="Sediaan"
                valueLabel={sediaan ? SEDIAAN_OPTIONS.find((item) => item.value === sediaan)?.label : ''}
                placeholder="Pilih sediaan"
                options={SEDIAAN_OPTIONS}
                isOpen={activeSelect === 'sediaan'}
                onToggle={() => setActiveSelect(activeSelect === 'sediaan' ? null : 'sediaan')}
                onSelect={(value) => {
                  setSediaan(value);
                  setActiveSelect(null);
                }}
              />

              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Frekuensi</Text>
                <View className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-100">
                  <Text className="text-slate-700 font-medium">
                    {frekuensi ? `${frekuensi} kali sehari` : 'Akan terisi otomatis dari nama obat'}
                  </Text>
                </View>
              </View>

              {!frekuensi ? null : isFrekuensiOne ? (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waktu Konsumsi Obat</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={jamCustom ? jamCustom.slice(0, 5) : ''}
                      onChange={(e) => setJamCustom(`${e.target.value}:00`)}
                      style={{ padding: 12, borderRadius: 12, border: '2px solid #E2E8F0', marginBottom: 14 }}
                    />
                  ) : (
                    <>
                      <Pressable onPress={() => setShowTimePicker(true)} className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50 mb-4">
                        <Text className="text-slate-900 font-medium">{formatTimeHM(jamCustom)}</Text>
                      </Pressable>
                      {showTimePicker ? (
                        <DateTimePicker
                          value={new Date(`2026-01-01T${jamCustom || '21:00:00'}`)}
                          mode="time"
                          onChange={(event, selectedDate) => {
                            setShowTimePicker(false);
                            if (event.type === 'dismissed' || !selectedDate) return;
                            setJamCustom(formatTimeHMS(selectedDate));
                          }}
                        />
                      ) : null}
                    </>
                  )}
                  <Text className="text-xs text-slate-400 mt-2">Frekuensi 1x/hari bebas selama 24 jam, isi jam sesuai kebutuhan.</Text>
                </View>
              ) : (
                <SelectField
                  label="Waktu Konsumsi Obat"
                  valueLabel={waktuKonsumsi}
                  placeholder="Pilih jadwal default"
                  options={presetOptions}
                  isOpen={activeSelect === 'waktu'}
                  onToggle={() => setActiveSelect(activeSelect === 'waktu' ? null : 'waktu')}
                  onSelect={(value) => {
                    setWaktuKonsumsi(value);
                    setActiveSelect(null);
                  }}
                />
              )}

              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jumlah Obat</Text>
                <TextInput
                  className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50 text-slate-900 font-medium"
                  placeholder="Masukkan jumlah obat"
                  keyboardType="numeric"
                  value={jumlahObat}
                  onChangeText={(text) => setJumlahObat(text.replace(/[^0-9]/g, ''))}
                />
              </View>

              <SelectField
                label="Aturan Minum Obat"
                valueLabel={
                  aturanMinum
                    ? (ATURAN_OPTIONS.find((item) => item.value === aturanMinum)?.label || aturanMinum)
                    : ''
                }
                placeholder="Pilih aturan minum"
                options={ATURAN_OPTIONS}
                isOpen={activeSelect === 'aturan'}
                onToggle={() => setActiveSelect(activeSelect === 'aturan' ? null : 'aturan')}
                onSelect={(value) => {
                  setAturanMinum(value);
                  if (value !== 'custom') {
                    setAturanCustom('');
                  }
                  setActiveSelect(null);
                }}
              />

              {isCustomAturan ? (
                <View className="mb-2">
                  <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Isi Aturan Custom</Text>
                  <TextInput
                    className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50 text-slate-900 font-medium"
                    placeholder="Contoh: Sesudah sarapan dan sebelum olahraga"
                    value={aturanCustom}
                    onChangeText={setAturanCustom}
                  />
                  <Text className="text-xs text-slate-400 mt-2">Saran: isi waktu + kondisi, misalnya 30 menit setelah makan malam.</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                className={`mt-4 rounded-2xl py-4 items-center ${canSubmit && !isSaving ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-300'}`}
                disabled={!canSubmit || isSaving}
              >
                <Text className="text-white font-bold text-base">{isSaving ? 'Menyimpan...' : (editingReminder ? 'Simpan Perubahan' : 'Simpan Reminder Offline')}</Text>
              </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
