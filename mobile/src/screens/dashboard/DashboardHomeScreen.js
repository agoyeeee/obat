import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useReminders } from '../../hooks/useReminders';
import { openWhatsAppHelper } from '../../utils/helpers';
import ReminderItem from '../../components/ReminderItem';
import MedicineModal from '../../components/MedicineModal';

export default function DashboardScreen({ user, onLogout }) {
  const { schedules, medicines, adherence, loadData, markIntake, addReminder } = useReminders();
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  const [form, setForm] = useState({
    pasien_id: '', obat_id: '', dosis: '', sediaan: '', waktu_konsumsi_id: '1', jumlah_obat: '1', cara_pemakaian: ''
  });

  useEffect(() => {
    loadData(); // Fetch initial data (like medicines catalog)
  }, [loadData]);

  const handleSearch = () => {
    loadData(selectedPatientId);
  };

  const handleCreate = async () => {
    const res = await addReminder(form);
    if (res.success) {
      Alert.alert('Berhasil', 'Jadwal obat berhasil dibuat.');
      setForm(prev => ({ ...prev, dosis: '', sediaan: '', cara_pemakaian: '', jumlah_obat: '1' }));
      loadData(selectedPatientId);
    } else {
      Alert.alert('Gagal', res.message);
    }
  };

  const handleMarkIntake = async (id, status) => {
    const res = await markIntake(id, status);
    if (res.success) {
      Alert.alert('Berhasil', 'Status kepatuhan berhasil diubah.');
      loadData(selectedPatientId);
    } else {
      Alert.alert('Gagal', res.message);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        
        <View className="flex-row items-center justify-between mb-4 mt-3">
          <View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Halo, {user?.nama}</Text>
            <Text className="text-sm font-semibold text-teal-600 mt-1">⚕️ Apoteker Aktif</Text>
          </View>
          <Pressable className="bg-teal-100 rounded-xl py-2.5 px-4" onPress={onLogout}>
            <Text className="text-teal-800 font-bold text-sm">Keluar</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100 mb-4">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Filter Pasien</Text>
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Pasien</Text>
          <View className="flex-row items-start">
            <TextInput
              className="border-2 border-slate-200 rounded-l-2xl border-r-0 px-4 py-3.5 flex-1 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Contoh: 1"
              keyboardType="number-pad"
              value={selectedPatientId}
              onChangeText={setSelectedPatientId}
            />
            <Pressable className="bg-teal-600 py-4 px-6 rounded-r-2xl justify-center active:bg-teal-700 h-[56px]" onPress={handleSearch}>
              <Text className="text-white font-bold text-base">Cari</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-teal-600 rounded-[24px] p-6 shadow-md shadow-teal-600/25 mb-4">
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

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100 mb-4">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Tambah Jadwal Obat</Text>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Pasien</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50" keyboardType="number-pad" value={form.pasien_id} onChangeText={(v) => setForm((p) => ({ ...p, pasien_id: v }))} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ID Obat</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50" keyboardType="number-pad" value={form.obat_id} onChangeText={(v) => setForm((p) => ({ ...p, obat_id: v }))} />
            </View>
          </View>
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waktu (1-3)</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50" keyboardType="number-pad" value={form.waktu_konsumsi_id} onChangeText={(v) => setForm((p) => ({ ...p, waktu_konsumsi_id: v }))} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jumlah</Text>
              <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50" keyboardType="number-pad" value={form.jumlah_obat} onChangeText={(v) => setForm((p) => ({ ...p, jumlah_obat: v }))} />
            </View>
          </View>
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sediaan</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 mb-3" value={form.sediaan} onChangeText={(v) => setForm((p) => ({ ...p, sediaan: v }))} />
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dosis</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 mb-3" value={form.dosis} onChangeText={(v) => setForm((p) => ({ ...p, dosis: v }))} />
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cara Pakai</Text>
          <TextInput className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 mb-4" value={form.cara_pemakaian} onChangeText={(v) => setForm((p) => ({ ...p, cara_pemakaian: v }))} />

          <Pressable className="bg-teal-600 rounded-xl py-3.5 items-center shadow-sm active:bg-teal-700" onPress={handleCreate}>
            <Text className="text-white font-bold text-[15px]">+ Simpan Jadwal Baru</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-slate-200 border border-slate-100 mb-4">
          <Text className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Daftar Reminder Obat</Text>
          {schedules.length > 0 ? (
            schedules.map((item) => (
              <ReminderItem key={item.id} item={item} onDetail={setSelectedMedicine} onMarkIntake={handleMarkIntake} />
            ))
          ) : (
            <Text className="text-sm font-medium text-slate-500 text-center py-4">Belum ada reminder terjadwal.</Text>
          )}
        </View>

      </ScrollView>

      <MedicineModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} onContact={openWhatsAppHelper} />
    </View>
  );
}
