import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, Alert,
  RefreshControl, ActivityIndicator, Modal, Platform, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Pill, CloudUpload, CircleCheck, Clock3,
  Plus, X, Bell, ChevronDown, Pencil, Trash2, AlertCircle, ChevronRight,
} from 'lucide-react-native';
import { HelpCircle } from 'lucide-react-native';
import PatientInformasiObatDetailScreen from './PatientInformasiObatDetailScreen';
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

const TIME_PRESETS = {
  2: ['07.00 - 19.00', '06.00 - 18.00', '08.00 - 20.00', '09.00 - 21.00', '10.00 - 22.00'],
  3: ['06.00 - 14.00 - 22.00', '07.00 - 15.00 - 23.00', '08.00 - 16.00 - 24.00', '09.00 - 17.00 - 01.00', '10.00 - 18.00 - 02.00'],
};

const formatDoseOption = (item) => {
  if (item && typeof item === 'object' && item.dosis !== undefined) {
    const satuan = item.satuan ? ` ${item.satuan}` : '';
    return `${item.dosis}${satuan}`;
  }
  if (item === null || item === undefined) return '';
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
      if (label) options.push({ label, value: label });
    }
  }
  if (options.length === 0 && obat.dosis_target) {
    const label = String(obat.dosis_target);
    options.push({ label, value: label });
  }
  return options;
};

const getDoseDisplay = (obat) => {
  if (!obat) return '';
  if (obat.dosis_target) return String(obat.dosis_target);
  if (Array.isArray(obat.dosis_inisiasi) && obat.dosis_inisiasi.length > 0) {
    const parts = obat.dosis_inisiasi.map((item) => {
      if (item && typeof item === 'object' && item.dosis !== undefined) {
        return `${item.dosis}${item.satuan ? ` ${item.satuan}` : ''}`;
      }
      return String(item);
    }).filter(Boolean);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} - ${parts[parts.length - 1]}`;
  }
  return '';
};

const renderLabel = (label) => (
  <Text style={{
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6,
  }}>
    {label}
  </Text>
);

// ── SELECT FIELD ──────────────────────────────────────────────
const renderSelectField = (label, value, options, onChangeText, setSelectModal, rightElement) => (
  <View style={{ marginBottom: 16 }}>
    {renderLabel(label)}
    <TouchableOpacity
      onPress={() => setSelectModal({ visible: true, label, options, onSelect: onChangeText })}
      style={{
        borderWidth: 1.5,
        borderColor: value ? '#14B8A6' : '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: value ? '#F5F3FF' : '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: value ? '#1E293B' : '#94A3B8', fontWeight: value ? '600' : '400', fontSize: 14, flex: 1 }}>
        {value || 'Pilih opsi...'}
      </Text>
      {rightElement ? rightElement : <ChevronRight color={value ? '#14B8A6' : '#CBD5E1'} size={18} />}
    </TouchableOpacity>
  </View>
);

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function PatientReminderObatScreen({ onBack, profile, onOpenDetail }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [obatList, setObatList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [reminderItems, setReminderItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAutoSchedulingAlarm, setIsAutoSchedulingAlarm] = useState(false);
  const [selectModal, setSelectModal] = useState({ visible: false, label: '', options: [], onSelect: null });
  const [showObatInfoModal, setShowObatInfoModal] = useState(false);

  const [selectedObatId, setSelectedObatId] = useState('');
  const [dosis, setDosis] = useState('');
  const [frekuensi, setFrekuensi] = useState('');
  const [sediaan, setSediaan] = useState('');
  const [waktuKonsumsi, setWaktuKonsumsi] = useState('');
  const [jamCustom, setJamCustom] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [jumlahObat, setJumlahObat] = useState('');
  const [aturanMinum, setAturanMinum] = useState('');
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

  const frekuensiNumber = Number(frekuensi);
  const presetOptions = useMemo(() => {
    const presets = TIME_PRESETS[frekuensiNumber] || [];
    return presets.map((item) => ({ label: item, value: item }));
  }, [frekuensiNumber]);

  const isFrekuensiOne = frekuensiNumber === 1;

  const canSubmit = useMemo(() => {
    if (!selectedObatId || !dosis || !sediaan || !jumlahObat || !aturanMinum) return false;
    if (isFrekuensiOne && !jamCustom.trim()) return false;
    if (!isFrekuensiOne && !waktuKonsumsi) return false;
    return true;
  }, [selectedObatId, dosis, sediaan, jumlahObat, aturanMinum, isFrekuensiOne, jamCustom, waktuKonsumsi]);

  useEffect(() => {
    if (!selectedObat) {
      setAturanMinum('');
      return;
    }

    setAturanMinum(selectedObat.cara_pemakaian || '');
  }, [selectedObat]);

  const handleSelectObat = (obatId) => {
    setSelectedObatId(obatId);
    setSelectModal({ visible: false, label: '', options: [], onSelect: null });
    const obat = obatList.find((item) => String(item.id) === String(obatId));
    if (!obat) return;
    const freq = Number(obat.frekuensi_default || 0);
    const doseDisplay = getDoseDisplay(obat);
    setDosis(doseDisplay || '');
    setFrekuensi(String(freq || ''));
    setAturanMinum(obat.cara_pemakaian || '');
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
    setDosis('');
    setFrekuensi('');
    setSediaan('');
    setWaktuKonsumsi('');
    setJamCustom('');
    setJumlahObat('');
    setAturanMinum('');
    setSelectModal({ visible: false, label: '', options: [], onSelect: null });
    setEditingReminder(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingReminder(item);
    setSelectedObatId(String(item.obat_id || ''));
    setDosis(item.dosis || '');
    setFrekuensi(String(item.frekuensi || ''));
    setSediaan(item.sediaan || '');
    setWaktuKonsumsi(item.waktu_konsumsi || '');
    setJamCustom(item.frekuensi === 1 ? (item.waktu_konsumsi || '') : '');
    setJumlahObat(String(item.jumlah_obat || ''));
    setSelectModal({ visible: false, label: '', options: [], onSelect: null });
    setIsAddModalOpen(true);
  };

  const autoScheduleAlarms = useCallback(async (items) => {
    if (isAutoSchedulingAlarm) return;
    const candidates = (items || []).filter(
      (item) => item.sync_status === 'synced' && item.server_id &&
        (!Array.isArray(item.alarm_notification_ids) || item.alarm_notification_ids.length === 0)
    );
    if (candidates.length === 0) return;
    setIsAutoSchedulingAlarm(true);
    try {
      for (const item of candidates) {
        try {
          const notificationIds = await scheduleReminderObatAlarms(item);
          await updatePatientReminderObatAlarmIds(item.local_id, notificationIds);
        } catch (error) {
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
      Alert.alert('Data belum lengkap', 'Mohon lengkapi semua field pengingat minum obat terlebih dahulu.');
      return;
    }
    const payload = {
      obat_id: Number(selectedObatId),
      nama_obat: selectedObat?.nama_obat || '-',
      dosis,
      sediaan,
      frekuensi: Number(frekuensi),
      waktu_konsumsi: isFrekuensiOne ? jamCustom.trim() : waktuKonsumsi,
      jumlah_obat: Number(jumlahObat),
      aturan_minum: aturanMinum,
    };
    try {
      setIsSaving(true);
      if (editingReminder) {
        const isSyncedReminder = editingReminder.sync_status === 'synced' && editingReminder.server_id;
        const updatedLocalItem = await updatePatientReminderObatItem(editingReminder.local_id, {
          ...payload,
          sync_status: isSyncedReminder ? 'pending' : editingReminder.sync_status,
          synced_at: isSyncedReminder ? null : editingReminder.synced_at,
          server_id: editingReminder.server_id || null,
          alarm_notification_ids: isSyncedReminder ? [] : (editingReminder.alarm_notification_ids || []),
          last_error: null,
        });

        try {
          const notificationIds = await scheduleReminderObatAlarms(updatedLocalItem);
          await updatePatientReminderObatAlarmIds(updatedLocalItem.local_id, notificationIds);
        } catch (alarmError) {
          console.error('Failed to schedule alarm after edit:', alarmError?.message || alarmError);
        }

        let syncWarning = '';

        if (isSyncedReminder) {
          try {
            await cancelReminderObatAlarms(editingReminder.alarm_notification_ids || []);
          } catch (alarmError) {
            console.error('Failed to cancel alarm before edit sync:', alarmError?.message || alarmError);
          }

          const syncResult = await syncPendingReminderObat(profile);
          if (syncResult?.error) {
            syncWarning = syncResult.error;
          }
        }

        await loadQueueStats();
        setIsAddModalOpen(false);
        resetForm();
        Alert.alert(
          'Reminder diperbarui',
          syncWarning
            ? `Data tersimpan lokal, tetapi sinkronisasi belum berhasil. ${syncWarning}`
            : (isSyncedReminder
              ? 'Data diperbarui dan akan tersinkron ulang ke server.'
              : 'Data reminder berhasil diperbarui.'
            )
        );
        return updatedLocalItem;
      }
      const createdItem = await addPatientReminderObat(payload);

      try {
        const notificationIds = await scheduleReminderObatAlarms(createdItem);
        await updatePatientReminderObatAlarmIds(createdItem.local_id, notificationIds);
      } catch (alarmError) {
        console.error('Failed to schedule alarm after submit:', alarmError?.message || alarmError);
      }

      const syncResult = await syncPendingReminderObat(profile);
      await loadQueueStats();
      setIsAddModalOpen(false);
      resetForm();
      Alert.alert(
        'Reminder ditambahkan',
        syncResult?.error
          ? `Data tersimpan lokal, tetapi sinkronisasi belum berhasil. ${syncResult.error}`
          : 'Data tersimpan, dan alarm otomatis diaktifkan jika sinkronisasi berhasil.'
      );
    } catch (error) {
      Alert.alert('Gagal menyimpan offline', error?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReminder = async (item) => {
    Alert.alert(
      'Hapus Pengigat Minum Obat',
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
                try {
                  await deleteReminderObat(item.server_id);
                } catch (serverError) {
                  console.warn('Server delete reminder failed, continuing local delete:', serverError?.message || serverError);
                }
              }
              await cancelReminderObatAlarms(item.alarm_notification_ids || []);
              await deletePatientReminderObatItem(item.local_id);
              await loadQueueStats();
              Alert.alert('Reminder dihapus', 'Pengigat Minum obat berhasil dihapus.');
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

  // ── LOADING STATE ─────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ color: '#94A3B8', marginTop: 12, fontWeight: '600' }}>Memuat data obat...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <StatusBar style="light" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#6366F1', '#818CF8', '#A5B4FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: 30,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        {/* Decorative circles */}
        <View style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: 90,
          backgroundColor: '#ffffff18',
        }} />
        <View style={{
          position: 'absolute', top: 30, right: 60,
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: '#ffffff10',
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => ({
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: '#ffffff25',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#ffffff40',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <ArrowLeft color="#fff" size={18} />
            </Pressable>
            <View>
              <Text style={{ color: '#C7D2FE', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' }}>
                Menu Pasien
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
                Pengigat Minum Obat
              </Text>
            </View>
          </View>

          <View style={{
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: '#ffffff25',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: '#ffffff40',
          }}>
            <Pill color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >

        {/* ── DAFTAR REMINDER ── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>Daftar Pengingat Minum Obat</Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 1 }}>
                {reminderItems.length} pengingat minum obat terdaftar
              </Text>
            </View>

            <Pressable
              onPress={handleOpenAddModal}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: '#6366F1',
                paddingHorizontal: 14, paddingVertical: 10,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 5,
              })}
            >
              
              <Text style={{ color: '#6366F1', fontWeight: '800', fontSize: 13 }}><Plus color="#6366F1" size={10} /> Tambah</Text>
            </Pressable>
          </View>

          {/* Empty state */}
          {reminderItems.length === 0 ? (
            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 32,
              alignItems: 'center',
              borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed',
            }}>
              <View style={{
                width: 56, height: 56, borderRadius: 18,
                backgroundColor: '#EEF2FF',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Bell color="#6366F1" size={24} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15, marginBottom: 4 }}>
                Belum Ada Pengingat Minum Obat
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Tekan tombol Tambah untuk membuat pengingat minum obat baru.
              </Text>
            </View>
          ) : (
            reminderItems.map((item) => {
              const isSynced = item.sync_status === 'synced';
              const isAlarmActive = Array.isArray(item.alarm_notification_ids) && item.alarm_notification_ids.length > 0;

              return (
                <View key={item.local_id} style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 12,
                  shadowColor: '#64748B',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 10,
                  elevation: 3,
                }}>
                  {/* Top row */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={{
                        width: 40, height: 40, borderRadius: 13,
                        backgroundColor: '#EEF2FF',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Pill color="#6366F1" size={18} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                          {item.nama_obat}
                        </Text>
                        
                      </View>
                    </View>

                    <View style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50,
                      backgroundColor: isSynced ? '#DCFCE7' : '#FEF3C7',
                    }}>
                      <Text style={{
                        fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8,
                        color: isSynced ? '#059669' : '#D97706',
                      }}>
                        {isSynced ? 'Synced' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 }} />

                  {/* Info rows */}
                  {[
                    { label: 'Dosis', value: `${item.dosis} · ${item.frekuensi}x per hari` },
                    { label: 'Waktu', value: item.waktu_konsumsi },
                    { label: 'Aturan', value: item.aturan_minum },
                  ].map((row, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', width: 52 }}>{row.label}</Text>
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600', flex: 1 }}>{row.value}</Text>
                    </View>
                  ))}

                  {/* Alarm status */}
                  <View style={{
                    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: isAlarmActive ? '#F0FDF4' : '#F8FAFC',
                    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
                  }}>
                    <Bell size={12} color={isAlarmActive ? '#059669' : '#CBD5E1'} />
                    <Text style={{
                      fontSize: 11, fontWeight: '700',
                      color: isAlarmActive ? '#059669' : '#94A3B8',
                    }}>
                      {isAlarmActive
                        ? 'Alarm Aktif Otomatis'
                        : isSynced ? 'Menyiapkan Alarm...' : 'Alarm Menunggu Sync'}
                    </Text>
                  </View>

                  {/* Error */}
                  {item.last_error && (
                    <View style={{
                      marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6,
                      backgroundColor: '#FFF1F2', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
                    }}>
                      <AlertCircle size={12} color="#F43F5E" />
                      <Text style={{ color: '#F43F5E', fontSize: 11, fontWeight: '600', flex: 1 }}>
                        {item.last_error}
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                    <Pressable
                      onPress={() => openEditModal(item)}
                      style={({ pressed }) => ({
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: '#EEF2FF',
                        paddingVertical: 10, borderRadius: 12,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      
                      <Text style={{ color: '#6366F1', fontWeight: '800', fontSize: 13 }}><Pencil color="#6366F1" size={13} /> Edit</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteReminder(item)}
                      style={({ pressed }) => ({
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: '#FFF1F2',
                        paddingVertical: 10, borderRadius: 12,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      
                      <Text style={{ color: '#F43F5E', fontWeight: '800', fontSize: 13 }}><Trash2 color="#F43F5E" size={13} /> Hapus</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── MODAL TAMBAH / EDIT ── */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => { setIsAddModalOpen(false); resetForm(); }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
          {/* Modal header */}
          <LinearGradient
            colors={['#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              paddingTop: 20, paddingBottom: 20,
              paddingHorizontal: 20,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ color: '#C7D2FE', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Form Reminder
              </Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                {editingReminder ? 'Edit Pengigat Minum Obat' : 'Tambah Pengigat Minum Obat'}
              </Text>
            </View>
            <Pressable
              onPress={() => { setIsAddModalOpen(false); resetForm(); }}
              style={({ pressed }) => ({
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: '#ffffff25',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#ffffff40',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <X color="#fff" size={18} />
            </Pressable>
          </LinearGradient>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Form card */}
            <View style={{
              backgroundColor: '#fff', borderRadius: 24, padding: 20,
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 6,
            }}>
              {renderSelectField(
                'Nama Obat',
                selectedObat?.nama_obat || '',
                obatOptions,
                handleSelectObat,
                setSelectModal,
                selectedObat ? (
                    <Pressable
                      onPress={() => {
                        if (!selectedObat) {
                          Alert.alert('Pilih obat terlebih dahulu');
                          return;
                        }
                        setShowObatInfoModal(true);
                      }}
                      style={{ padding: 6, marginRight: 6 }}
                    >
                      <HelpCircle color={selectedObat ? '#6366F1' : '#CBD5E1'} size={18} />
                    </Pressable>
                ) : null
              )}

              

              <View style={{ marginBottom: 16 }}>
                {renderLabel('Dosis')}
                <View style={{
                  borderWidth: 1.5,
                  borderColor: dosis ? '#14B8A6' : '#E2E8F0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: dosis ? '#F5F3FF' : '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{ color: dosis ? '#1E293B' : '#94A3B8', fontWeight: dosis ? '600' : '400', fontSize: 14, flex: 1 }}>
                    {dosis || '—'}
                  </Text>
                </View>
              </View>

              {renderSelectField(
                'Sediaan',
                sediaan ? SEDIAAN_OPTIONS.find((item) => item.value === sediaan)?.label : '',
                SEDIAAN_OPTIONS,
                (value) => { setSediaan(value); setSelectModal({ visible: false, label: '', options: [], onSelect: null }); },
                setSelectModal
              )}

              {/* Frekuensi (read-only) */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
                  Frekuensi
                </Text>
                <View style={{
                  borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
                  paddingHorizontal: 16, paddingVertical: 14,
                  backgroundColor: '#F8FAFC',
                }}>
                  <Text style={{ color: frekuensi ? '#1E293B' : '#94A3B8', fontWeight: '500', fontSize: 14 }}>
                    {frekuensi ? `${frekuensi} kali sehari` : 'Akan terisi otomatis dari nama obat'}
                  </Text>
                </View>
              </View>

              {/* Waktu konsumsi */}
              {!frekuensi ? null : isFrekuensiOne ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
                    Waktu Konsumsi Obat
                  </Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={jamCustom ? jamCustom.slice(0, 5) : ''}
                      onChange={(e) => setJamCustom(`${e.target.value}:00`)}
                      style={{
                        padding: '14px 16px', borderRadius: 14,
                        border: '1.5px solid #E2E8F0', marginBottom: 14,
                        fontSize: 14, width: '100%', boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <>
                      <Pressable
                        onPress={() => setShowTimePicker(true)}
                        style={{
                          borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
                          paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: '#1E293B', fontWeight: '600', fontSize: 14 }}>
                          {formatTimeHM(jamCustom)}
                        </Text>
                      </Pressable>
                      {showTimePicker && (
                        <DateTimePicker
                          value={new Date(`2026-01-01T${jamCustom || '21:00:00'}`)}
                          mode="time"
                          onChange={(event, selectedDate) => {
                            setShowTimePicker(false);
                            if (event.type === 'dismissed' || !selectedDate) return;
                            setJamCustom(formatTimeHMS(selectedDate));
                          }}
                        />
                      )}
                    </>
                  )}
                  <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>
                    Frekuensi 1x/hari bebas selama 24 jam, isi jam sesuai kebutuhan.
                  </Text>
                </View>
              ) : (
                renderSelectField(
                  'Waktu Konsumsi Obat',
                  waktuKonsumsi,
                  presetOptions,
                  (value) => { setWaktuKonsumsi(value); setSelectModal({ visible: false, label: '', options: [], onSelect: null }); },
                  setSelectModal
                )
              )}

              {/* Jumlah obat */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
                  Jumlah Obat
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
                    paddingHorizontal: 16, paddingVertical: 14,
                    backgroundColor: '#fff', color: '#1E293B',
                    fontWeight: '500', fontSize: 14,
                  }}
                  placeholder="Masukkan jumlah obat"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={jumlahObat}
                  onChangeText={(text) => setJumlahObat(text.replace(/[^0-9]/g, ''))}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                {renderLabel('Aturan Minum Obat')}
                <View style={{
                  borderWidth: 1.5,
                  borderColor: aturanMinum ? '#14B8A6' : '#E2E8F0',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: aturanMinum ? '#F5F3FF' : '#F8FAFC',
                }}>
                  <Text style={{ color: aturanMinum ? '#1E293B' : '#94A3B8', fontWeight: aturanMinum ? '600' : '400', fontSize: 14, lineHeight: 20 }}>
                    {aturanMinum || 'Akan terisi otomatis dari data obat yang dipilih'}
                  </Text>
                </View>
                <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 6 }}>
                  Aturan minum mengikuti data bawaan obat dan tidak perlu dipilih lagi.
                </Text>
              </View>
            </View>

            {/* Modal Selector */}
            <Modal
              visible={selectModal.visible}
              transparent
              animationType="fade"
              onRequestClose={() => setSelectModal({ visible: false, label: '', options: [], onSelect: null })}
            >
              <View style={{
                flex: 1,
                backgroundColor: '#00000040',
                justifyContent: 'flex-end',
              }}>
                <View style={{
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 20,
                  paddingTop: 24,
                  paddingBottom: 32,
                  maxHeight: '80%',
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: 16,
                  }}>
                    {selectModal.label}
                  </Text>

                  <ScrollView
                    style={{ maxHeight: 400 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {selectModal.options.map((option, i) => (
                      <Pressable
                        key={`${i}-${option.value}`}
                        onPress={() => {
                          if (selectModal.onSelect) {
                            selectModal.onSelect(option.value);
                          }
                          setSelectModal({ visible: false, label: '', options: [], onSelect: null });
                        }}
                        style={({ pressed }) => ({
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          marginVertical: 6,
                          borderBottomWidth: 0,
                          backgroundColor: pressed ? '#F5F3FF' : '#fff',
                        })}
                      >
                        <Text style={{
                          color: '#1E293B',
                          fontWeight: '500',
                          fontSize: 15,
                        }}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </ScrollView>

          {/* Submit button - Fixed at bottom */}
          <View style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: 24,
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            backgroundColor: '#6366F1',
          }}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isSaving}
              style={({ pressed }) => ({
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: canSubmit && !isSaving ? '#6366F1' : '#CBD5E1',
                opacity: pressed && (canSubmit && !isSaving) ? 0.8 : 1,
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: canSubmit && !isSaving ? 0.3 : 0,
                shadowRadius: 12,
                elevation: canSubmit && !isSaving ? 6 : 0,
              })}
            >
              <Text style={{
                color: canSubmit && !isSaving ? '#fff' : '#94A3B8',
                fontWeight: '700',
                fontSize: 16,
                letterSpacing: 0.5,
              }}>
                {isSaving ? 'Menyimpan...' : editingReminder ? 'Simpan Perubahan' : 'Simpan Reminder'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={showObatInfoModal}
        animationType="slide"
        onRequestClose={() => setShowObatInfoModal(false)}
      >
        <PatientInformasiObatDetailScreen
          obat={selectedObat}
          onBack={() => setShowObatInfoModal(false)}
        />
      </Modal>
    </View>
  );
}