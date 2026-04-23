import { View, Text, Pressable } from 'react-native';

export default function ReminderItem({ item, onDetail, onMarkIntake }) {
  const isPatuh = item.skor_kepatuhan === 'PATUH';

  return (
    <View className="border border-slate-200 rounded-[20px] p-4 mb-3 bg-slate-50">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-bold text-slate-900 flex-1">{item.obat?.nama_obat || 'Obat'}</Text>
        <View className={`px-2.5 py-1 rounded-full ${isPatuh ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <Text className={`text-[11px] font-extrabold ${isPatuh ? 'text-emerald-700' : 'text-red-700'}`}>
            {item.skor_kepatuhan}
          </Text>
        </View>
      </View>
      
      <View className="bg-white p-3 rounded-xl mb-3 space-y-1.5">
        <Text className="text-slate-500 text-sm font-medium">⏱️ {item.waktu_konsumsi?.label_waktu}</Text>
        <Text className="text-slate-500 text-sm font-medium">💊 {item.dosis} ({item.sediaan})</Text>
        <Text className="text-slate-500 text-sm font-medium">ℹ️ {item.cara_pemakaian}</Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable 
          className="flex-1 border-2 border-slate-200 rounded-xl py-2 items-center active:bg-slate-100" 
          onPress={() => onDetail(item.obat)}
        >
          <Text className="text-slate-700 font-bold text-[13px]">Detail</Text>
        </Pressable>

        <Pressable 
          className="flex-1 bg-emerald-500 rounded-xl py-2 items-center active:bg-emerald-600" 
          onPress={() => onMarkIntake(item.id, 'PATUH')}
        >
          <Text className="text-white font-bold text-[13px]">✓ Patuh</Text>
        </Pressable>
        
        <Pressable 
          className="flex-1 bg-red-500 rounded-xl py-2 items-center active:bg-red-600" 
          onPress={() => onMarkIntake(item.id, 'TIDAK_PATUH')}
        >
          <Text className="text-white font-bold text-[13px]">✕ Tdk Patuh</Text>
        </Pressable>
      </View>
    </View>
  );
}
