import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import { Pill, ChevronRight, Search } from 'lucide-react-native';
import MedicineModal from '../../components/MedicineModal';
import { openWhatsAppHelper } from '../../utils/helpers';

export default function MedicineListScreen() {
  const { medicines, loadData } = useReminders();
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-5 pb-4">
      <Text className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Ensiklopedia Obat</Text>
      
      {/* Search Bar */}
      <View className="flex-row items-center bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-3 mb-6">
        <Search color="#94A3B8" size={20} />
        <TextInput
          className="flex-1 ml-3 text-slate-900 text-base font-medium"
          placeholder="Cari nama atau indikasi obat..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        {filteredMedicines.length > 0 ? (
          <FlatList
            data={filteredMedicines}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <Pressable 
              className={`flex-row items-center p-4 active:bg-slate-50 ${index !== medicines.length - 1 ? 'border-b border-slate-100' : ''}`}
              onPress={() => setSelectedMedicine(item)}
            >
              <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center mr-4">
                <Pill color="#0D9488" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900">{item.nama_obat}</Text>
                <Text className="text-sm font-medium text-slate-500 mt-0.5" numberOfLines={1}>
                  {item.indikasi || 'Tidak ada info indikasi.'}
                </Text>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </Pressable>
          )}
        />
        ) : (
          <View className="p-8 items-center justify-center flex-1">
            <Text className="text-slate-400 font-medium text-center">Obat tidak ditemukan.</Text>
          </View>
        )}
      </View>

      <MedicineModal 
        medicine={selectedMedicine} 
        onClose={() => setSelectedMedicine(null)} 
        onContact={openWhatsAppHelper} 
      />
    </View>
  );
}