import { View, Text, Pressable } from 'react-native';
import { Clock, Pill, Info, Check, X } from 'lucide-react-native';

export default function ReminderItem({ item, onDetail, onMarkIntake }) {
  const isPatuh = item.skor_kepatuhan === 'PATUH';

  return (
    <View className="border border-slate-200 rounded-[20px] p-4 mb-3 bg-slate-50 shadow-sm shadow-slate-200">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-extrabold text-slate-900 flex-1">{item.obat?.nama_obat || 'Obat'}</Text>
        <View className={`px-3 py-1.5 rounded-full ${isPatuh ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          <Text className={`text-[11px] font-black tracking-widest uppercase ${isPatuh ? 'text-emerald-700' : 'text-rose-700'}`}>
            {item.skor_kepatuhan}
          </Text>
        </View>
      </View>
      
      <View className="bg-white p-4 rounded-[16px] mb-4 border border-slate-100">
        <View className="flex-row items-center mb-3">
          <Clock color="#94A3B8" size={16} />
          <Text className="text-slate-600 text-sm font-bold ml-2.5">{item.waktu_konsumsi?.label_waktu}</Text>
        </View>
        <View className="flex-row items-center mb-3">
          <Pill color="#94A3B8" size={16} />
          <Text className="text-slate-600 text-sm font-bold ml-2.5">{item.dosis} ({item.sediaan})</Text>
        </View>
        <View className="flex-row items-start">
          <Info color="#94A3B8" size={16} className="mt-0.5" />
          <Text className="text-slate-600 text-sm font-bold ml-2.5 flex-1 leading-relaxed">{item.obat?.cara_pemakaian || item.cara_pemakaian || '-'}</Text>
        </View>
      </View>

      <View className="flex-row space-x-2">
        <Pressable 
          className="flex-1 border-2 border-slate-200 rounded-xl py-2.5 items-center justify-center active:bg-slate-100"
          onPress={() => onDetail(item.obat)}
        >
          <Text className="text-slate-700 font-extrabold text-[13px] uppercase tracking-wider">Detail</Text>
        </Pressable>
        <Pressable 
          className="flex-1 bg-emerald-500 rounded-xl py-2.5 flex-row items-center justify-center active:opacity-90 shadow-sm shadow-emerald-500/20"
          onPress={() => onMarkIntake(item.id, 'PATUH')}
        >
          <Check color="#FFFFFF" size={14} />
          <Text className="text-white font-black text-[13px] ml-1.5 uppercase tracking-wider">Patuh</Text>
        </Pressable>
        <Pressable 
          className="flex-1 bg-rose-500 rounded-xl py-2.5 flex-row items-center justify-center active:opacity-90 shadow-sm shadow-rose-500/20"
          onPress={() => onMarkIntake(item.id, 'TIDAK_PATUH')}
        >
          <X color="#FFFFFF" size={14} />
          <Text className="text-white font-black text-[13px] ml-1.5 uppercase tracking-wider">Tdk Patuh</Text>
        </Pressable>
      </View>
    </View>
  );
}
