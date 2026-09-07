import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, Alert,
  RefreshControl, ActivityIndicator, Modal, Platform, SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Droplets, Plus, X, Pencil, Trash2,
  AlertCircle, CalendarDays, Clock,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addPatientReminderCairan,
  getPatientReminderCairanQueue,
  updatePatientReminderCairanItem,
  deletePatientReminderCairanItem,
} from '../../storage/patientReminderCairanStorage';
import { syncPendingReminderCairan } from '../../services/patientReminderCairanSyncService';
import { deleteReminderCairan } from '../../services/reminderService';

const pad = (value) => String(value).padStart(2, '0');
const formatDateYMD = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTimeHMS = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
const formatTimeHM = (time) => (time ? time.slice(0, 5) : '-');

const formatDateDisplay = (ymd) => {
  if (!ymd) return '-';
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${m[3]} ${months[parseInt(m[2]) - 1]} ${m[1]}`;
};

// ── FIELD LABEL ───────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <Text style={{
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6,
  }}>
    {children}
  </Text>
);

// ── TEXT INPUT FIELD ──────────────────────────────────────────
const InputField = ({ label, ...props }) => (
  <View style={{ marginBottom: 16 }}>
    <FieldLabel>{label}</FieldLabel>
    <TextInput
      style={{
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#fff', color: '#1E293B',
        fontWeight: '500', fontSize: 14,
      }}
      placeholderTextColor="#94A3B8"
      {...props}
    />
  </View>
);

// ── PICKER TRIGGER ────────────────────────────────────────────
const PickerTrigger = ({ label, value, icon, onPress }) => (
  <View style={{ marginBottom: 16 }}>
    <FieldLabel>{label}</FieldLabel>
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 24,
        paddingHorizontal: 18, paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        flexDirection: 'row', alignItems: 'center', gap: 12,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon}
      <Text style={{ color: '#0F172A', fontWeight: '500', fontSize: 16, flex: 1 }}>{value}</Text>
    </Pressable>
  </View>
);

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function PatientReminderCairanScreen({ onBack, profile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [queue, setQueue] = useState([]);

  const [tanggal, setTanggal] = useState(formatDateYMD(new Date()));
  const [catatanAsupan, setCatatanAsupan] = useState('');
  const [minuman, setMinuman] = useState('Contoh: Air mineral');
  const [jumlahMl, setJumlahMl] = useState('');
  const [waktu, setWaktu] = useState(formatTimeHMS(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

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
      if (result && !result.skipped) await loadQueue();
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

  const canSubmit = useMemo(
    () => Boolean(tanggal && minuman.trim() && jumlahMl.trim() && waktu),
    [tanggal, minuman, jumlahMl, waktu]
  );

  const resetForm = () => {
    setTanggal(formatDateYMD(new Date()));
    setCatatanAsupan('');
    setMinuman('Air mineral');
    setJumlahMl('');
    setWaktu(formatTimeHMS(new Date()));
    setEditingReminder(null);
  };

  const openAddModal = () => { resetForm(); setIsAddModalOpen(true); };

  const openEditModal = (item) => {
    setEditingReminder(item);
    setTanggal(item.tanggal || formatDateYMD(new Date()));
    setCatatanAsupan(item.catatan_asupan || '');
    setMinuman(item.minuman || 'Air mineral');
    setJumlahMl(String(item.jumlah_ml || ''));
    setWaktu(item.waktu || formatTimeHMS(new Date()));
    setShowDatePicker(false);
    setShowTimePicker(false);
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
      const payload = {
        tanggal,
        catatan_asupan: catatanAsupan.trim(),
        minuman: minuman.trim(),
        jumlah_ml: jumlahValue,
        waktu,
      };
      if (editingReminder) {
        const isSyncedReminder = editingReminder.sync_status === 'synced' && editingReminder.server_id;
        const updatedLocalItem = await updatePatientReminderCairanItem(editingReminder.local_id, {
          ...payload,
          sync_status: isSyncedReminder ? 'pending' : editingReminder.sync_status,
          synced_at: isSyncedReminder ? null : editingReminder.synced_at,
          server_id: editingReminder.server_id || null,
          last_error: null,
        });

        let syncWarning = '';

        setIsAddModalOpen(false);
        resetForm();
        await loadQueue();
        const syncResultAfterSave = await syncPendingReminderCairan(profile);
        if (syncResultAfterSave && syncResultAfterSave.error) {
          syncWarning = syncResultAfterSave.error;
        }
        await autoSync();
        Alert.alert(
          'Reminder cairan diperbarui',
          syncWarning
            ? `Data tersimpan lokal, tetapi sinkronisasi belum berhasil. ${syncWarning}`
            : 'Data reminder berhasil diperbarui.'
        );
        return updatedLocalItem;
      }
      await addPatientReminderCairan(payload);
      setIsAddModalOpen(false);
      resetForm();
      await loadQueue();
      const syncResult = await syncPendingReminderCairan(profile);
      await autoSync();
      Alert.alert(
        'Tersimpan',
        syncResult?.error
          ? `Catatan tersimpan lokal, tetapi sinkronisasi belum berhasil. ${syncResult.error}`
          : 'Catatan cairan tersimpan di device dan akan auto sync saat online.'
      );
    } catch (error) {
      Alert.alert('Gagal', error?.message || 'Gagal menyimpan reminder cairan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async (item) => {
    Alert.alert(
      'Hapus Reminder Cairan',
      `Hapus reminder cairan untuk ${item.minuman}? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              if (item.sync_status === 'synced' && item.server_id) {
                try {
                  await deleteReminderCairan(item.server_id);
                } catch (serverError) {
                  console.warn('Server delete reminder cairan failed, continuing local delete:', serverError?.message || serverError);
                }
              }
              await deletePatientReminderCairanItem(item.local_id);
              await loadQueue();
              Alert.alert('Catatan dihapus', 'Catatan cairan berhasil dihapus.');
            } catch (error) {
              Alert.alert('Gagal menghapus', error?.message || 'Terjadi kesalahan saat menghapus catatan cairan.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ── LOADING STATE ─────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ color: '#94A3B8', marginTop: 12, fontWeight: '600' }}>Memuat data cairan...</Text>
      </View>
    );
  }

  const pendingCount = queue.filter((i) => i.sync_status !== 'synced').length;
  const syncedCount = queue.filter((i) => i.sync_status === 'synced').length;
  const todayYmd = formatDateYMD(new Date());
  const todayItems = queue.filter((item) => item.tanggal === todayYmd);
  const totalMlToday = todayItems.reduce((acc, item) => acc + (Number(item.jumlah_ml) || 0), 0);
  const dailyTargetMin = 900;
  const dailyTargetMax = 1200;
  const isTargetReached = totalMlToday >= dailyTargetMin && totalMlToday <= dailyTargetMax;
  const dailyScore = isTargetReached ? 1 : 0;
  const dailyStatus = isTargetReached ? 'Tercukupi' : 'Tidak tercukupi';
  const targetStatusColor = isTargetReached ? '#059669' : '#D97706';

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <StatusBar style="light" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#0EA5E9', '#38BDF8', '#7DD3FC']}
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
              <Text style={{
                color: '#BAE6FD', fontSize: 10, letterSpacing: 1.5,
                textTransform: 'uppercase', fontWeight: '700',
              }}>
                Menu Pasien
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
                Cairan Harian
              </Text>
            </View>
          </View>

          <View style={{
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: '#ffffff25',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: '#ffffff40',
          }}>
            <Droplets color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
        showsVerticalScrollIndicator={false}
      >

        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: '#E0F2FE',
            shadowColor: '#0EA5E9',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 4,
          }}>
            <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
              Target Minum Harian
            </Text>
            <Text style={{ color: '#1E293B', fontSize: 20, fontWeight: '900', marginTop: 4 }}>
              900 - 1200 ml
            </Text>
            <Text style={{ color: '#475569', fontSize: 13, marginTop: 8, lineHeight: 20 }}>
              Hari ini kamu sudah mencatat {totalMlToday} ml cairan dari target harian.
            </Text>

            <View style={{ marginTop: 14, height: 10, borderRadius: 999, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
              <View
                style={{
                  width: `${Math.min((totalMlToday / dailyTargetMax) * 100, 100)}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: targetStatusColor,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: targetStatusColor, fontSize: 12, fontWeight: '800' }}>
                Status: {dailyStatus}
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>
                {Math.min(Math.round((totalMlToday / dailyTargetMax) * 100), 100)}%
              </Text>
            </View>

            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700' }}>
                Skor Hari Ini
              </Text>
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isTargetReached ? '#DCFCE7' : '#FEF3C7',
              }}>
                <Text style={{ color: targetStatusColor, fontSize: 12, fontWeight: '900' }}>
                  {dailyScore}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── TOMBOL TAMBAH CATATAN CAIRAN (BESAR DI TENGAH) ── */}
        <View style={{ marginHorizontal: 20, marginTop: 18, marginBottom: 8 }}>
          <Pressable
            onPress={openAddModal}
            style={({ pressed }) => ({
              backgroundColor: '#0284C7',
              borderRadius: 20,
              paddingVertical: 18,
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 14,
              opacity: pressed ? 0.88 : 1,
              shadowColor: '#0284C7',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1.5,
              borderColor: '#38BDF8',
            })}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#ffffff28',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus color="#fff" size={24} strokeWidth={2.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                + Catat Asupan Cairan
              </Text>
              <Text style={{ color: '#E0F2FE', fontSize: 12, marginTop: 2, fontWeight: '500' }}>
                Tekan untuk menambah catatan konsumsi air harian
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ── DAFTAR REMINDER ── */}
        <View style={{ marginHorizontal: 20, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>Daftar Cairan</Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 1 }}>
                {queue.length} catatan terdaftar
              </Text>
            </View>
          </View>

          {/* Empty state */}
          {queue.length === 0 ? (
            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 32,
              alignItems: 'center',
              borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed',
            }}>
              <View style={{
                width: 56, height: 56, borderRadius: 18,
                backgroundColor: '#F0F9FF',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Droplets color="#0EA5E9" size={24} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15, marginBottom: 4 }}>
                Belum Ada Catatan
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Tekan tombol Tambah untuk mencatat asupan cairan harian kamu.
              </Text>
            </View>
          ) : (
            queue.map((item) => {
              const isSynced = item.sync_status === 'synced';

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
                        backgroundColor: '#F0F9FF',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Droplets color="#0EA5E9" size={18} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                          {item.minuman}
                        </Text>
                        <Text style={{ color: '#0EA5E9', fontSize: 13, fontWeight: '700', marginTop: 1 }}>
                          {item.jumlah_ml} ml
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
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <CalendarDays size={12} color="#94A3B8" />
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>
                        {formatDateDisplay(item.tanggal)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>
                        {formatTimeHM(item.waktu)}
                      </Text>
                    </View>
                  </View>

                  {item.catatan_asupan ? (
                    <Text style={{ color: '#64748B', fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
                      "{item.catatan_asupan}"
                    </Text>
                  ) : null}

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
                        backgroundColor: '#F0F9FF',
                        paddingVertical: 10, borderRadius: 12,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: '#0EA5E9', fontWeight: '800', fontSize: 13 }}><Pencil color="#0EA5E9" size={13} /> Edit</Text>
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
            colors={['#0EA5E9', '#38BDF8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              paddingTop: 20, paddingBottom: 20,
              paddingHorizontal: 20,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ color: '#BAE6FD', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Form Cairan
              </Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                {editingReminder ? 'Edit Catatan Cairan' : 'Tambah Catatan Cairan'}
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
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
              {/* Tanggal */}
              {Platform.OS === 'web' ? (
                <View style={{ marginBottom: 16 }}>
                  <FieldLabel>Tanggal</FieldLabel>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    style={{
                      padding: '14px 16px', borderRadius: 14,
                      border: '1.5px solid #E2E8F0', fontSize: 14,
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                </View>
              ) : (
                <>
                  <PickerTrigger
                    label="Tanggal"
                    value={formatDateDisplay(tanggal) || 'Pilih tanggal'}
                    icon={<CalendarDays size={18} color="#94A3B8" />}
                    onPress={() => setShowDatePicker(true)}
                  />
                  {showDatePicker && (
                    <DateTimePicker
                      value={tanggal ? new Date(tanggal) : new Date()}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (event.type === 'dismissed' || !selectedDate) return;
                        setTanggal(formatDateYMD(selectedDate));
                      }}
                    />
                  )}
                </>
              )}

              <InputField
                label="Catat Asupan Cairan"
                placeholder="Contoh: Setelah olahraga"
                value={catatanAsupan}
                onChangeText={setCatatanAsupan}
              />

              <InputField
                label="Minuman"
                placeholder="Air mineral"
                value={minuman}
                onChangeText={setMinuman}
              />

              <InputField
                label="Jumlah (ml)"
                placeholder="Contoh: 250"
                keyboardType="numeric"
                value={jumlahMl}
                onChangeText={(text) => setJumlahMl(text.replace(/[^0-9]/g, ''))}
              />
              <Text style={{ color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: -8, marginBottom: 16 }}>
                Gunakan gelas dengan ukuran volume yang telah diketahui (misalnya 250 ml) untuk memudahkan proses pencatatan.
              </Text>

              {/* Waktu */}
              {Platform.OS === 'web' ? (
                <View style={{ marginBottom: 16 }}>
                  <FieldLabel>Waktu</FieldLabel>
                  <input
                    type="time"
                    value={waktu.slice(0, 5)}
                    onChange={(e) => setWaktu(`${e.target.value}:00`)}
                    style={{
                      padding: '14px 16px', borderRadius: 14,
                      border: '1.5px solid #E2E8F0', fontSize: 14,
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                </View>
              ) : (
                <>
                  <PickerTrigger
                    label="Waktu"
                    value={formatTimeHM(waktu)}
                    icon={<Clock size={18} color="#94A3B8" />}
                    onPress={() => setShowTimePicker(true)}
                  />
                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date(`2026-01-01T${waktu}`)}
                      mode="time"
                      onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (event.type === 'dismissed' || !selectedDate) return;
                        setWaktu(formatTimeHMS(selectedDate));
                      }}
                    />
                  )}
                </>
              )}

            {/* Submit button - Integrated with comfortable bottom margin */}
            <View style={{ marginTop: 24, marginBottom: 36 }}>
                <Pressable
                  onPress={submitCairan}
                  disabled={!canSubmit || isSubmitting}
                  style={({ pressed }) => ({
                    borderRadius: 18,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: canSubmit && !isSubmitting ? '#0284C7' : '#CBD5E1',
                    opacity: pressed && (canSubmit && !isSubmitting) ? 0.85 : 1,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: canSubmit && !isSubmitting ? 0.3 : 0,
                    shadowRadius: 10,
                    elevation: canSubmit && !isSubmitting ? 5 : 0,
                  })}
                >
                  <Text style={{
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: 16,
                    letterSpacing: 0.5,
                  }}>
                    {isSubmitting ? 'Menyimpan...' : editingReminder ? 'Simpan Perubahan' : 'Simpan Catatan'}
                  </Text>
                </Pressable>
                {!canSubmit ? (
                  <Text style={{ color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                    Isi jumlah cairan (ml) untuk mengaktifkan tombol simpan.
                  </Text>
                ) : null}
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}