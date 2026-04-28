import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, RefreshControl, ActivityIndicator, Modal, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Droplets, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addPatientReminderCairan, getPatientReminderCairanQueue } from '../../storage/patientReminderCairanStorage';
import { syncPendingReminderCairan } from '../../services/patientReminderCairanSyncService';

const pad = (value) => String(value).padStart(2, '0');
const formatDateYMD = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTimeHMS = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
const formatTimeHM = (time) => (time ? time.slice(0, 5) : '-');

export default function PatientReminderCairanScreen({ onBack, profile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [queue, setQueue] = useState([]);

  const [tanggal, setTanggal] = useState(formatDateYMD(new Date()));
  const [catatanAsupan, setCatatanAsupan] = useState('');
  const [minuman, setMinuman] = useState('Air mineral');
  const [jumlahMl, setJumlahMl] = useState('');
  const [waktu, setWaktu] = useState(formatTimeHMS(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadQueue = useCallback(async () => {
    const data = await getPatientReminderCairanQueue();
    setQueue(Array.isArray(data) ? data : []);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  const autoSync = useCallback(async () => {
    if (!profile || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncPendingReminderCairan(profile);
      if (result && !result.skipped) {
        await loadQueue();
      }
    } finally {
      setIsSyncing(false);
    }
  }, [profile, isSyncing, loadQueue]);

  useEffect(() => {
    const bootstrap = async () => {
      await loadQueue();
      await autoSync();
    };

    bootstrap();
  }, [loadQueue, autoSync]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadQueue();
    await autoSync();
  }, [loadQueue, autoSync]);

  const canSubmit = useMemo(() => Boolean(tanggal && minuman.trim() && jumlahMl.trim() && waktu), [tanggal, minuman, jumlahMl, waktu]);

  const resetForm = () => {
    setTanggal(formatDateYMD(new Date()));
    setCatatanAsupan('');
    setMinuman('Air mineral');
    setJumlahMl('');
    setWaktu(formatTimeHMS(new Date()));
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const submitCairan = async () => {
    if (!canSubmit) {
      Alert.alert('Data belum lengkap', 'Mohon isi semua field wajib terlebih dahulu.');
      return;
    }

    const jumlahValue = Number(jumlahMl);
    if (!Number.isFinite(jumlahValue) || jumlahValue <= 0) {
      Alert.alert('Jumlah tidak valid', 'Jumlah (ml) harus berupa angka lebih dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPatientReminderCairan({
        tanggal,
        catatan_asupan: catatanAsupan.trim(),
        minuman: minuman.trim(),
        jumlah_ml: jumlahValue,
        waktu,
      });
      setIsAddModalOpen(false);
      await loadQueue();
      await autoSync();
      Alert.alert('Tersimpan', 'Reminder cairan tersimpan di device dan akan auto sync saat online.');
    } catch (error) {
      Alert.alert('Gagal', error?.message || 'Gagal menyimpan reminder cairan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="bg-white pt-14 pb-6 px-6 border-b border-slate-100 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={onBack} className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 active:bg-slate-200">
              <ArrowLeft color="#334155" size={18} />
            </Pressable>
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Form Pasien</Text>
              <Text className="text-2xl font-black text-slate-900 tracking-tight mt-1">Reminder Minum Cairan</Text>
            </View>
          </View>
          <View className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center">
            <Droplets color="#2563EB" size={20} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-black text-slate-900">Daftar Reminder Cairan</Text>
            <Pressable onPress={openAddModal} className="bg-blue-600 rounded-xl px-3 py-2 flex-row items-center active:bg-blue-700">
              <Plus color="#FFFFFF" size={16} />
              <Text className="text-white font-bold text-sm ml-1.5">Tambah</Text>
            </Pressable>
          </View>

          {queue.length === 0 ? (
            <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-5">
              <Text className="text-slate-500 text-sm text-center">Belum ada reminder cairan. Tekan Tambah untuk membuat reminder baru.</Text>
            </View>
          ) : (
            queue.map((item) => {
              const isSynced = item.sync_status === 'synced';
              const isAlarmActive = Array.isArray(item.alarm_notification_ids) && item.alarm_notification_ids.length > 0;
              return (
                <View key={item.local_id} className="rounded-2xl border border-slate-200 p-4 mb-3 bg-white">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="text-base font-black text-slate-900 flex-1 mr-2">{item.minuman}</Text>
                    <View className={`px-2.5 py-1 rounded-full ${isSynced ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Text className={`text-[10px] font-bold uppercase ${isSynced ? 'text-emerald-700' : 'text-amber-700'}`}>{isSynced ? 'Synced' : 'Pending'}</Text>
                    </View>
                  </View>
                  <Text className="text-xs font-semibold text-slate-500">Jumlah {item.jumlah_ml} ml</Text>
                  <Text className="text-xs font-semibold text-slate-500 mt-1">Tanggal {item.tanggal}</Text>
                  <Text className="text-xs font-semibold text-slate-500 mt-1">Waktu {formatTimeHM(item.waktu)}</Text>
                  {item.catatan_asupan ? <Text className="text-xs font-semibold text-slate-500 mt-1">Catatan {item.catatan_asupan}</Text> : null}
                  <Text className={`text-xs font-bold mt-3 ${isAlarmActive ? 'text-emerald-600' : 'text-slate-400'}`}>{isAlarmActive ? 'Alarm Aktif Otomatis' : 'Menyiapkan Alarm...'}</Text>
                  {item.last_error ? <Text className="text-xs font-semibold text-rose-500 mt-2">Error sync: {item.last_error}</Text> : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={isAddModalOpen} animationType="slide" transparent={false} onRequestClose={() => setIsAddModalOpen(false)}>
        <SafeAreaView className="flex-1 bg-slate-50">
          <View className="bg-white px-5 pt-5 pb-4 border-b border-slate-100 flex-row items-center justify-between z-50">
            <Text className="text-lg font-black text-slate-900">Tambah Reminder Cairan</Text>
            <Pressable onPress={() => setIsAddModalOpen(false)} className="w-9 h-9 rounded-lg bg-slate-100 items-center justify-center active:bg-slate-200">
              <X color="#334155" size={18} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: '2px solid #E2E8F0', marginBottom: 14 }}
              />
            ) : (
              <>
                <Pressable onPress={() => setShowDatePicker(true)} className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50 mb-4">
                  <Text className="text-slate-900 font-medium">{tanggal || 'Pilih tanggal'}</Text>
                </Pressable>
                {showDatePicker ? (
                  <DateTimePicker
                    value={tanggal ? new Date(tanggal) : new Date()}
                    mode="date"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'dismissed' || !selectedDate) return;
                      setTanggal(formatDateYMD(selectedDate));
                    }}
                  />
                ) : null}
              </>
            )}

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Catat Asupan Cairan</Text>
            <TextInput className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium" placeholder="Contoh: Setelah olahraga" value={catatanAsupan} onChangeText={setCatatanAsupan} />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Minuman</Text>
            <TextInput className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium" placeholder="Air mineral" value={minuman} onChangeText={setMinuman} />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jumlah (ml)</Text>
            <TextInput className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium" placeholder="Contoh: 250" keyboardType="numeric" value={jumlahMl} onChangeText={(text) => setJumlahMl(text.replace(/[^0-9]/g, ''))} />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waktu</Text>
            {Platform.OS === 'web' ? (
              <input
                type="time"
                value={waktu.slice(0, 5)}
                onChange={(e) => setWaktu(`${e.target.value}:00`)}
                style={{ padding: 12, borderRadius: 12, border: '2px solid #E2E8F0', marginBottom: 14 }}
              />
            ) : (
              <>
                <Pressable onPress={() => setShowTimePicker(true)} className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-slate-50 mb-4">
                  <Text className="text-slate-900 font-medium">{formatTimeHM(waktu)}</Text>
                </Pressable>
                {showTimePicker ? (
                  <DateTimePicker
                    value={new Date(`2026-01-01T${waktu}`)}
                    mode="time"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(false);
                      if (event.type === 'dismissed' || !selectedDate) return;
                      setWaktu(formatTimeHMS(selectedDate));
                    }}
                  />
                ) : null}
              </>
            )}

            <Pressable onPress={submitCairan} disabled={!canSubmit || isSubmitting} className={`mt-2 rounded-2xl py-4 items-center ${canSubmit && !isSubmitting ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-300'}`}>
              <Text className="text-white font-bold text-base">{isSubmitting ? 'Menyimpan...' : 'Simpan Reminder Offline'}</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}