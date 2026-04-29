import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { fetchMerksByObat, createMerk } from '../../services/reminderService';
import { ChevronRight, Plus, X } from 'lucide-react-native';

export default function SelectBrandScreen({ navigation, route }) {
  const { obatId, namaObat } = route.params || {};
  const [merks, setMerks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [namaMerk, setNamaMerk] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMerks = async () => {
    setLoading(true);
    try {
      const data = await fetchMerksByObat(obatId);
      setMerks(data || []);
    } catch (error) {
      console.error('Failed loading merks', error);
      Alert.alert('Gagal', 'Gagal memuat daftar merek.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!obatId) {
      Alert.alert('Error', 'ID obat tidak tersedia');
      navigation.goBack();
      return;
    }
    loadMerks();
  }, [obatId]);

  const handleAddMerk = async () => {
    if (!namaMerk.trim()) {
      Alert.alert('Validasi', 'Nama merek harus diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createMerk({ nama_merk: namaMerk.trim(), obat_id: obatId });
      setNamaMerk('');
      setIsAddModalOpen(false);
      await loadMerks();
      Alert.alert('Berhasil', 'Merek berhasil ditambahkan.');
    } catch (error) {
      console.error('Create merk failed', error);
      const msg = error?.response?.data?.message || 'Gagal menambah merek.';
      Alert.alert('Gagal', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMerk = (merk) => {
    Alert.alert('Merek dipilih', `Merek "${merk.nama_merk}" dipilih untuk ${namaObat || ''}.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View className="flex-1 bg-[#F0F4F3] pt-16 px-6">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-2xl font-black text-[#1A2820]">Merek untuk: {namaObat}</Text>
        <Pressable onPress={() => setIsAddModalOpen(true)} className="flex-row items-center bg-[#0D7A6A] px-3 py-2 rounded-2xl">
          <Plus color="white" size={16} />
          <Text className="text-white font-bold ml-2">Tambah</Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-3xl border-[1.5px] border-[#EEF0EF] flex-1 shadow-sm shadow-black/5 overflow-hidden">
        {loading ? (
          <View className="p-8 items-center"><ActivityIndicator size="large" color="#0D7A6A" /></View>
        ) : merks.length > 0 ? (
          <FlatList
            data={merks}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleSelectMerk(item)} className="flex-row items-center p-4 border-b border-[#EEF0EF]">
                <View className="flex-1">
                  <Text className="text-lg font-extrabold text-[#1A2820]">{item.nama_merk}</Text>
                </View>
                <ChevronRight color="#CBD5E1" size={20} />
              </Pressable>
            )}
          />
        ) : (
          <View className="p-8 items-center">
            <Text className="text-[#9DB0AA] text-lg font-bold">Belum ada merek untuk obat ini.</Text>
          </View>
        )}
      </View>

      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <View className="flex-1 bg-black/35 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[50%]">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
              <Text className="text-lg font-extrabold">Tambah Merek</Text>
              <Pressable onPress={() => setIsAddModalOpen(false)}>
                <X color="#334155" size={22} />
              </Pressable>
            </View>
            <View className="p-5">
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Nama Merek</Text>
              <TextInput value={namaMerk} onChangeText={setNamaMerk} placeholder="Contoh: Merk A" className="border-2 border-slate-200 rounded-2xl px-4 py-3 mb-4" />

              <Pressable onPress={handleAddMerk} disabled={isSubmitting} className={`rounded-2xl py-3 items-center ${isSubmitting ? 'bg-slate-400' : 'bg-[#0D7A6A]'}`}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Simpan Merek</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
