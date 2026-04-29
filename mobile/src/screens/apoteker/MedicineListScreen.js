import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, Pressable, TextInput, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import { Pill, ChevronRight, Search, Plus, X } from 'lucide-react-native';
import MedicineModal from '../../components/MedicineModal';
import { fetchMerksByObat, createMerk } from '../../services/reminderService';

export default function MedicineListScreen() {
  const { medicines, loadData, addMedicine, editMedicine, removeMedicine } = useReminders();
  const navigation = useNavigation();
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [namaObat, setNamaObat] = useState('');
  const [indikasi, setIndikasi] = useState('');
  const [dosisInisiasi, setDosisInisiasi] = useState('');
  const [dosisTarget, setDosisTarget] = useState('');
  const [frekuensiDefault, setFrekuensiDefault] = useState('');
  const [kontraindikasi, setKontraindikasi] = useState('');
  const [efekSamping, setEfekSamping] = useState('');
  const [monitoring, setMonitoring] = useState('');
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  // Brand modal states for inline merk selection after creating obat
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [currentObatForBrand, setCurrentObatForBrand] = useState(null);
  const [merks, setMerks] = useState([]);
  const [merkNamaInput, setMerkNamaInput] = useState('');
  const [merkLoading, setMerkLoading] = useState(false);

  useEffect(() => {
    if (medicines.length === 0) loadData();
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return medicines;
    const lowerQuery = searchQuery.toLowerCase();
    return medicines.filter(m => 
      m.nama_obat.toLowerCase().includes(lowerQuery) ||
      (m.indikasi && m.indikasi.toLowerCase().includes(lowerQuery))
    );
  }, [medicines, searchQuery]);

  const resetForm = () => {
    setEditingMedicineId(null);
    setNamaObat('');
    setIndikasi('');
    setDosisInisiasi('');
    setDosisTarget('');
    setFrekuensiDefault('');
    setKontraindikasi('');
    setEfekSamping('');
    setMonitoring('');
  };

  const openEditForm = (medicine) => {
    setEditingMedicineId(medicine.id);
    setNamaObat(medicine.nama_obat || '');
    setIndikasi(medicine.indikasi || '');
    setDosisInisiasi(Array.isArray(medicine.dosis_inisiasi) ? medicine.dosis_inisiasi.join(', ') : '');
    setDosisTarget(medicine.dosis_target || '');
    setFrekuensiDefault(String(medicine.frekuensi_default || ''));
    setKontraindikasi(medicine.kontraindikasi || '');
    setEfekSamping(medicine.efek_samping || '');
    setMonitoring(medicine.monitoring || '');
    setIsAddModalOpen(true);
  };

  const handleDeleteMedicine = (medicine) => {
    if (!medicine?.id) return;

    Alert.alert(
      'Hapus Obat',
      `Yakin ingin menghapus ${medicine.nama_obat}? Data merk dan reminder yang terhubung akan ikut terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const result = await removeMedicine(medicine.id);
            if (!result.success) {
              Alert.alert('Gagal', result.message || 'Gagal menghapus obat.');
              return;
            }

            await loadData();
            setSelectedMedicine(null);
            Alert.alert('Berhasil', 'Data obat berhasil dihapus.');
          },
        },
      ]
    );
  };

  const handleSubmitAddMedicine = async () => {
    if (!namaObat.trim() || !indikasi.trim() || !dosisInisiasi.trim() || !dosisTarget.trim() || !frekuensiDefault.trim()) {
      Alert.alert('Data belum lengkap', 'Mohon isi nama obat, indikasi, dosis inisiasi, dosis target, dan frekuensi default.');
      return;
    }

    const freq = Number(frekuensiDefault);
    if (!Number.isInteger(freq) || freq <= 0) {
      Alert.alert('Frekuensi tidak valid', 'Frekuensi default harus berupa angka bulat lebih dari 0.');
      return;
    }

    const dosisInisiasiList = dosisInisiasi
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (dosisInisiasiList.length === 0) {
      Alert.alert('Dosis inisiasi tidak valid', 'Isi minimal satu dosis inisiasi.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nama_obat: namaObat.trim(),
        indikasi: indikasi.trim(),
        dosis_inisiasi: dosisInisiasiList,
        dosis_target: dosisTarget.trim(),
        frekuensi_default: freq,
        kontraindikasi: kontraindikasi.trim() || null,
        efek_samping: efekSamping.trim() || null,
        monitoring: monitoring.trim() || null,
      };

      const isEditing = editingMedicineId !== null;
      const result = isEditing
        ? await editMedicine(editingMedicineId, payload)
        : await addMedicine(payload);

      if (!result.success) {
        Alert.alert('Gagal', result.message || 'Gagal menambah obat.');
        return;
      }

      await loadData();
      setIsAddModalOpen(false);
      resetForm();

      if (isEditing) {
        Alert.alert('Berhasil', 'Data obat berhasil diperbarui.');
        return;
      }

      // after creating obat, open inline merk selection modal (same form flow)
      const createdObat = result.data;
      if (createdObat && createdObat.id) {
        setCurrentObatForBrand(createdObat);
        setBrandModalOpen(true);
        try {
          setMerkLoading(true);
          const data = await fetchMerksByObat(createdObat.id);
          setMerks(data || []);
        } catch (err) {
          console.error('Failed loading merks', err);
          Alert.alert('Gagal', 'Gagal memuat daftar merek.');
        } finally {
          setMerkLoading(false);
        }
      } else {
        Alert.alert('Berhasil', 'Data obat berhasil ditambahkan.');
      }
    } catch (error) {
      Alert.alert('Gagal', error?.message || 'Gagal menambah obat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMerkInline = async () => {
    if (!merkNamaInput.trim() || !currentObatForBrand) {
      Alert.alert('Validasi', 'Nama merek harus diisi.');
      return;
    }

    try {
      setMerkLoading(true);
      await createMerk({ nama_merk: merkNamaInput.trim(), obat_id: currentObatForBrand.id });
      setMerkNamaInput('');
      const data = await fetchMerksByObat(currentObatForBrand.id);
      setMerks(data || []);
      Alert.alert('Berhasil', 'Merek berhasil ditambahkan.');
    } catch (err) {
      console.error('Create merk failed', err);
      Alert.alert('Gagal', err?.response?.data?.message || 'Gagal menambah merek.');
    } finally {
      setMerkLoading(false);
    }
  };


  return (
    <View className="flex-1 bg-[#F0F4F3] pt-16 px-6">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-3xl font-black text-[#1A2820] tracking-tight">Ensiklopedia Obat</Text>
        <Pressable
          className="flex-row items-center bg-[#0D7A6A] px-4 py-2.5 rounded-2xl active:opacity-80"
          onPress={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus color="white" size={18} />
          <Text className="text-white font-bold ml-2">Tambah</Text>
        </Pressable>
      </View>
      
      {/* Search Bar */}
      <View className="flex-row items-center bg-white border-[1.5px] border-[#EEF0EF] rounded-2xl px-5 py-4 mb-6 shadow-sm shadow-black/5">
        <Search color="#9DB0AA" size={24} />
        <TextInput
          className="flex-1 ml-3 text-lg font-semibold text-[#1A2820]"
          placeholder="Cari nama atau indikasi obat..."
          placeholderTextColor="#9DB0AA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="bg-white rounded-3xl border-[1.5px] border-[#EEF0EF] flex-1 shadow-sm shadow-black/5 overflow-hidden">
        {filteredMedicines.length > 0 ? (
          <FlatList
            data={filteredMedicines}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item, index }) => (
              <View className={`p-5 ${index !== filteredMedicines.length - 1 ? 'border-b-[1.5px] border-[#EEF0EF]' : ''}`}>
                <Pressable
                  className="flex-row items-center active:opacity-80"
                  onPress={() => setSelectedMedicine(item)}
                >
                  <View className="w-16 h-16 rounded-2xl bg-[#E8F8F3] items-center justify-center mr-4">
                    <Pill color="#0D7A6A" size={28} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-extrabold text-[#1A2820]">{item.nama_obat}</Text>
                    <Text className="text-base font-bold text-[#9DB0AA] mt-1" numberOfLines={2}>
                      {item.indikasi || 'Tidak ada info indikasi.'}
                    </Text>
                  </View>
                  <ChevronRight color="#CBD5E1" size={24} />
                </Pressable>

                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    className="flex-1 rounded-2xl border-2 border-[#0D7A6A] py-3 items-center bg-white active:bg-[#F0FDF9]"
                    onPress={() => navigation.navigate('SelectBrand', { obatId: item.id, namaObat: item.nama_obat })}
                  >
                    <Text className="text-[#0D7A6A] font-bold">Kelola Merek</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        ) : (
          <View className="p-10 items-center justify-center flex-1">
            <Text className="text-[#9DB0AA] text-lg font-bold text-center">Obat tidak ditemukan.</Text>
          </View>
        )}
      </View>

      <MedicineModal 
        medicine={selectedMedicine} 
        onClose={() => setSelectedMedicine(null)}
        onEditMedicine={() => {
          if (!selectedMedicine) return;
          const medicine = selectedMedicine;
          setSelectedMedicine(null);
          openEditForm(medicine);
        }}
        onManageMerk={() => {
          if (!selectedMedicine?.id) return;
          setSelectedMedicine(null);
          navigation.navigate('SelectBrand', {
            obatId: selectedMedicine.id,
            namaObat: selectedMedicine.nama_obat,
          });
        }}
        onDeleteMedicine={() => {
          if (!selectedMedicine) return;
          handleDeleteMedicine(selectedMedicine);
        }}
      />

      <Modal
        visible={isAddModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
              <Text className="text-lg font-extrabold text-slate-900">{editingMedicineId ? 'Edit Data Obat' : 'Tambah Data Obat'}</Text>
              <Pressable onPress={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}>
                <X color="#334155" size={22} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Obat</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Contoh: Amlodipine"
                value={namaObat}
                onChangeText={setNamaObat}
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Indikasi</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Contoh: Hipertensi"
                value={indikasi}
                onChangeText={setIndikasi}
                multiline
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dosis Inisiasi</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-1 bg-slate-50 text-slate-900 font-medium"
                placeholder="Pisahkan dengan koma, contoh: 5 mg, 10 mg"
                value={dosisInisiasi}
                onChangeText={setDosisInisiasi}
              />
              <Text className="text-xs text-slate-400 mb-4">Format: nilai dipisahkan koma.</Text>

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dosis Target</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Contoh: 10 mg"
                value={dosisTarget}
                onChangeText={setDosisTarget}
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Frekuensi Default (kali/hari)</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Contoh: 1"
                keyboardType="numeric"
                value={frekuensiDefault}
                onChangeText={(text) => setFrekuensiDefault(text.replace(/[^0-9]/g, ''))}
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kontraindikasi (opsional)</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Isi kontraindikasi"
                value={kontraindikasi}
                onChangeText={setKontraindikasi}
                multiline
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Efek Samping (opsional)</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium"
                placeholder="Isi efek samping"
                value={efekSamping}
                onChangeText={setEfekSamping}
                multiline
              />

              <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Monitoring (opsional)</Text>
              <TextInput
                className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-6 bg-slate-50 text-slate-900 font-medium"
                placeholder="Isi parameter monitoring"
                value={monitoring}
                onChangeText={setMonitoring}
                multiline
              />

              <Pressable
                onPress={handleSubmitAddMedicine}
                className={`rounded-2xl py-4 items-center ${isSubmitting ? 'bg-slate-400' : 'bg-[#0D7A6A] active:bg-[#0A5C50]'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base">{editingMedicineId ? 'Simpan Perubahan' : 'Simpan Obat'}</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Inline Brand Modal: pilih atau tambah merk untuk obat yang baru ditambahkan */}
      <Modal
        visible={brandModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBrandModalOpen(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
              <Text className="text-lg font-extrabold text-slate-900">Pilih Merek untuk: {currentObatForBrand?.nama_obat}</Text>
              <Pressable onPress={() => setBrandModalOpen(false)}>
                <X color="#334155" size={22} />
              </Pressable>
            </View>

            <View className="p-4">
              {merkLoading ? (
                <View className="p-4 items-center"><ActivityIndicator size="small" color="#0D7A6A" /></View>
              ) : (
                <FlatList
                  data={merks}
                  keyExtractor={item => String(item.id)}
                  style={{ maxHeight: 300 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => { setBrandModalOpen(false); Alert.alert('Merek dipilih', `Merek "${item.nama_merk}" dipilih untuk ${currentObatForBrand?.nama_obat || ''}.`); }} className="flex-row items-center p-3 border-b border-[#EEF0EF]">
                      <View className="flex-1">
                        <Text className="text-base font-bold">{item.nama_merk}</Text>
                      </View>
                      <ChevronRight color="#CBD5E1" size={20} />
                    </Pressable>
                  )}
                />
              )}

              <View className="mt-4">
                <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Tambah Merek Baru</Text>
                <TextInput
                  className="border-2 border-slate-200 rounded-2xl px-4 py-3 mb-3 bg-slate-50 text-slate-900 font-medium"
                  placeholder="Nama Merek"
                  value={merkNamaInput}
                  onChangeText={setMerkNamaInput}
                />
                <Pressable onPress={handleAddMerkInline} disabled={merkLoading} className={`rounded-2xl py-3 items-center ${merkLoading ? 'bg-slate-400' : 'bg-[#0D7A6A]'}`}>
                  {merkLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Simpan Merek</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}