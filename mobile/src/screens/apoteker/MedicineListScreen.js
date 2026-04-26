import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import { Pill, ChevronRight, Search } from 'lucide-react-native';
import MedicineModal from '../../components/MedicineModal';

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
    <View className="flex-1 bg-[#F0F4F3] pt-16 px-6">
      <Text className="text-3xl font-black text-[#1A2820] mb-5 tracking-tight">Ensiklopedia Obat</Text>
      
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
              <Pressable 
                className={`flex-row items-center p-5 active:bg-[#F8FAFA] ${index !== filteredMedicines.length - 1 ? 'border-b-[1.5px] border-[#EEF0EF]' : ''}`}
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
      />
    </View>
  );
}