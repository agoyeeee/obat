import { View, Text, FlatList, Pressable } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import { useEffect } from 'react';

export default function MedicineListScreen() {
  const { medicines, loadData } = useReminders();

  useEffect(() => {
    if (medicines.length === 0) loadData();
  }, [medicines]);

  return (
    <View className="flex-1 bg-slate-50 pt-10 px-5">
      <Text className="text-2xl font-extrabold text-slate-900 mb-6">Ensiklopedia Obat</Text>
      <FlatList
        data={medicines}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                <Text>💊</Text>
              </View>
              <Text className="text-lg font-bold text-slate-900">{item.nama_obat}</Text>
            </View>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Indikasi</Text>
            <Text className="text-slate-700 text-sm mb-3">{item.indikasi || '-'}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efek Samping</Text>
            <Text className="text-slate-700 text-sm mb-3">{item.efek_samping || '-'}</Text>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kontraindikasi</Text>
            <Text className="text-slate-700 text-sm">{item.kontraindikasi || '-'}</Text>
          </View>
        )}
      />
    </View>
  );
}
