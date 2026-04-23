import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ nama: '', password: '' });
  const [schedules, setSchedules] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [createScheduleForm, setCreateScheduleForm] = useState({
    pasien_id: '',
    obat_id: '',
    dosis: '',
    sediaan: '',
    waktu_konsumsi_id: '1',
    jumlah_obat: '1',
    cara_pemakaian: '',
  });

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  async function handleLogin() {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', loginForm);
      setToken(response.data.token);
      setUser(response.data.user);
      await loadDashboard(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert('Login gagal', error?.response?.data?.message || 'Periksa nama dan password.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore
    }
    setToken('');
    setUser(null);
    setSchedules([]);
    setAdherence(null);
    setSelectedMedicine(null);
  }

  async function loadDashboard(sessionToken = token, sessionUser = user) {
    if (!sessionToken || !sessionUser) return;
    const apiSession = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${sessionToken}` },
    });

    const paramsForPasien = selectedPatientId ? { pasien_id: Number(selectedPatientId) } : {};

    const scheduleResponse = await apiSession.get('/reminder-obat', { params: paramsForPasien });
    const medicineResponse = await apiSession.get('/obat');

    let adherenceResponse = { data: null };
    if (selectedPatientId) {
      adherenceResponse = await apiSession.get('/rekapan-obat', {
        params: { pasien_id: Number(selectedPatientId) },
      });
    }

    setSchedules(scheduleResponse.data || []);
    setMedicines(medicineResponse.data || []);
    setAdherence(adherenceResponse.data && adherenceResponse.data.length > 0 ? adherenceResponse.data[0] : null);
  }

  async function markIntake(scheduleId, status) {
    try {
      await api.put(`/reminder-obat/${scheduleId}`, { skor_kepatuhan: status });
      Alert.alert('Berhasil', 'Status kepatuhan berhasil diubah.');
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal mengubah status kepatuhan.');
    }
  }

  async function createSchedule() {
    try {
      await api.post('/reminder-obat', {
        pasien_id: Number(createScheduleForm.pasien_id),
        obat_id: Number(createScheduleForm.obat_id),
        waktu_konsumsi_id: Number(createScheduleForm.waktu_konsumsi_id),
        dosis: createScheduleForm.dosis,
        sediaan: createScheduleForm.sediaan,
        jumlah_obat: Number(createScheduleForm.jumlah_obat),
        cara_pemakaian: createScheduleForm.cara_pemakaian,
      });

      Alert.alert('Berhasil', 'Jadwal obat berhasil dibuat.');
      setCreateScheduleForm((prev) => ({ ...prev, dosis: '', sediaan: '', cara_pemakaian: '', jumlah_obat: '1' }));
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal membuat jadwal obat.');
    }
  }

  function openWhatsApp() {
    const medicineName = selectedMedicine?.nama_obat || 'obat';
    const message = encodeURIComponent(`Halo, saya ingin bertanya terkait obat ${medicineName}.`);
    Linking.openURL(`https://wa.me/6281234567890?text=${message}`).catch(() => {
      Alert.alert('Error', 'Tidak dapat membuka WhatsApp.');
    });
  }

  if (!token || !user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar style="dark" />
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-3xl bg-teal-100 items-center justify-center mb-4">
              <Text className="text-3xl">💊</Text>
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">MedReminder</Text>
            <Text className="text-base font-semibold text-teal-600 mt-1">Portal Apoteker</Text>
          </View>

          <View className="bg-white p-6 rounded-3xl shadow-lg shadow-teal-900/5 border border-slate-100">
            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Apoteker</Text>
            <TextInput
              className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Masukkan nama Anda"
              placeholderTextColor="#94a3b8"
              value={loginForm.nama}
              onChangeText={(value) => setLoginForm((prev) => ({ ...prev, nama: value }))}
            />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</Text>
            <TextInput
              className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-5 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Masukkan kata sandi"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={loginForm.password}
              onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
            />

            <Pressable 
              className="bg-teal-600 rounded-2xl py-4 items-center shadow-md shadow-teal-600/30 active:bg-teal-700" 
              onPress={handleLogin} 
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-base">{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</Text>
            </Pressable>
          </View>

          <View className="mt-8 p-5 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
            <Text className="text-xs font-bold text-slate-500 mb-2">Akun Demo (Apoteker):</Text>
            <View className="flex-row justify-between py-1">
              <Text className="text-sm font-medium text-slate-500">Nama:</Text>
              <Text className="text-sm font-bold text-slate-900">Siti Rahmawati</Text>
            </View>
            <View className="flex-row justify-between py-1">
              <Text className="text-sm font-medium text-slate-500">Pass:</Text>
              <Text className="text-sm font-bold text-slate-900">coba</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center justify-between mb-2 mt-3">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Halo, {user.nama}</Text>
            <Text className="text-sm font-semibold text-teal-600 mt-1">⚕️ Apoteker Aktif</Text>
          </View>
          <Pressable className="bg-teal-100 rounded-xl py-2.5 px-4" onPress={handleLogout}>
            <Text className="text-teal-800 font-bold text-sm">Keluar</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Filter Pasien</Text>
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Pasien</Text>
          <View className="flex-row items-start">
            <TextInput
              className="border-2 border-slate-200 rounded-l-2xl border-r-0 px-4 py-3.5 flex-1 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Contoh: 1"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              value={selectedPatientId}
              onChangeText={setSelectedPatientId}
            />
            <Pressable className="bg-teal-600 py-4 px-6 rounded-r-2xl justify-center active:bg-teal-700 h-[56px]" onPress={() => loadDashboard()}>
              <Text className="text-white font-bold text-base">Cari</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-teal-600 rounded-[24px] p-6 shadow-md shadow-teal-600/25">
          <Text className="text-base font-semibold text-teal-100 mb-2">Evaluasi Mingguan</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-black text-white tracking-tighter">
              {adherence ? adherence.status_kepatuhan : 'Belum Tersedia'}
            </Text>
            {adherence && (
              <View className="bg-white/20 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-bold">Minggu: {adherence.minggu_mulai}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Tambah Jadwal Obat</Text>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Pasien</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900" keyboardType="number-pad" value={createScheduleForm.pasien_id} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, pasien_id: v }))} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Obat</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900" keyboardType="number-pad" value={createScheduleForm.obat_id} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, obat_id: v }))} />
            </View>
          </View>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waktu (1-3)</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900" keyboardType="number-pad" value={createScheduleForm.waktu_konsumsi_id} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, waktu_konsumsi_id: v }))} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jumlah</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900" keyboardType="number-pad" value={createScheduleForm.jumlah_obat} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, jumlah_obat: v }))} />
            </View>
          </View>

          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sediaan (cth: Tablet)</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900 mb-3" value={createScheduleForm.sediaan} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, sediaan: v }))} />

          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dosis (cth: 1x Sehari)</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900 mb-3" value={createScheduleForm.dosis} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, dosis: v }))} />

          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cara Pakai</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-medium text-slate-900 mb-4" value={createScheduleForm.cara_pemakaian} onChangeText={(v) => setCreateScheduleForm((p) => ({ ...p, cara_pemakaian: v }))} />

          <Pressable className="bg-teal-600 rounded-xl py-3.5 items-center shadow-sm active:bg-teal-700" onPress={createSchedule}>
            <Text className="text-white font-bold text-[15px]">+ Simpan Jadwal Baru</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Daftar Reminder Obat</Text>
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="border border-slate-200 rounded-[20px] p-4 mb-3 bg-slate-50">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base font-bold text-slate-900 flex-1">{item.obat?.nama_obat || 'Obat'}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${item.skor_kepatuhan === 'PATUH' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <Text className={`text-[11px] font-extrabold ${item.skor_kepatuhan === 'PATUH' ? 'text-emerald-700' : 'text-red-700'}`}>{item.skor_kepatuhan}</Text>
                  </View>
                </View>
                
                <View className="bg-white p-3 rounded-xl mb-3 space-y-1.5">
                  <Text className="text-slate-500 text-sm font-medium">⏱️ {item.waktu_konsumsi?.label_waktu}</Text>
                  <Text className="text-slate-500 text-sm font-medium">💊 {item.dosis} ({item.sediaan})</Text>
                  <Text className="text-slate-500 text-sm font-medium">ℹ️ {item.cara_pemakaian}</Text>
                </View>

                <View className="flex-row gap-2">
                  <Pressable className="flex-1 border-2 border-slate-200 rounded-xl py-2 items-center active:bg-slate-100" onPress={() => setSelectedMedicine(item.obat || null)}>
                    <Text className="text-slate-700 font-bold text-[13px]">Detail</Text>
                  </Pressable>

                  <Pressable className="flex-1 bg-emerald-500 rounded-xl py-2 items-center active:bg-emerald-600" onPress={() => markIntake(item.id, 'PATUH')}>
                    <Text className="text-white font-bold text-[13px]">✓ Patuh</Text>
                  </Pressable>
                  <Pressable className="flex-1 bg-red-500 rounded-xl py-2 items-center active:bg-red-600" onPress={() => markIntake(item.id, 'TIDAK_PATUH')}>
                    <Text className="text-white font-bold text-[13px]">✕ Tdk Patuh</Text>
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text className="text-sm font-medium text-slate-500 text-center py-4">Belum ada reminder terjadwal.</Text>}
          />
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Katalog Obat Tersedia</Text>
          {medicines.map((medicine, index) => (
            <Pressable key={medicine.id} onPress={() => setSelectedMedicine(medicine)} className={`flex-row items-center py-3 ${index !== medicines.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <View className="w-11 h-11 rounded-xl bg-teal-50 items-center justify-center mr-3">
                <Text className="text-lg">💊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-slate-900">{medicine.nama_obat}</Text>
                <Text className="text-[13px] text-slate-500 mt-0.5" numberOfLines={1}>{medicine.indikasi}</Text>
              </View>
              <Text className="text-2xl text-slate-300 px-2">›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedMedicine)} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/60 justify-center p-5">
          <View className="bg-white rounded-[28px] max-h-[80%] overflow-hidden shadow-2xl">
            <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
              <Text className="text-xl font-extrabold text-slate-900 flex-1">{selectedMedicine?.nama_obat}</Text>
              <Pressable onPress={() => setSelectedMedicine(null)} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center ml-2">
                <Text className="text-slate-500 font-bold text-base">✕</Text>
              </Pressable>
            </View>
            
            <ScrollView className="p-6">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Indikasi</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{selectedMedicine?.indikasi || '-'}</Text>
              
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kontraindikasi</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{selectedMedicine?.kontraindikasi || '-'}</Text>
              
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efek Samping</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{selectedMedicine?.efek_samping || '-'}</Text>
              
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monitoring</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{selectedMedicine?.monitoring || '-'}</Text>
            </ScrollView>

            <View className="p-6 pt-2">
              <Pressable className="bg-teal-600 rounded-xl py-4 items-center active:bg-teal-700" onPress={openWhatsApp}>
                <Text className="text-white font-bold text-base">Tanya via WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
