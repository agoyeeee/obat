import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import { Pill, ChevronRight } from 'lucide-react-native';
import MedicineModal from '../../components/MedicineModal';
import { openWhatsAppHelper } from '../../utils/helpers';

export default function MedicineListScreen() {
  const { medicines, loadData } = useReminders();
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  useEffect(() => {
    if (medicines.length === 0) loadData();
  }, [medicines]);

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-5 pb-4">
      <Text className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Ensiklopedia Obat</Text>
      
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        <FlatList
          data={medicines}
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
      </View>

      <MedicineModal 
        medicine={selectedMedicine} 
        onClose={() => setSelectedMedicine(null)} 
        onContact={openWhatsAppHelper} 
      />
    </View>
  );
}
