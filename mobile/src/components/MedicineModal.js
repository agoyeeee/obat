import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

export default function MedicineModal({ medicine, onClose, onContact }) {
  if (!medicine) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 bg-slate-900/60 justify-center p-5">
        <View className="bg-white rounded-[28px] max-h-[80%] overflow-hidden shadow-2xl">
          <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
            <Text className="text-xl font-extrabold text-slate-900 flex-1">{medicine.nama_obat}</Text>
            <Pressable onPress={onClose} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center ml-2">
              <X color="#64748B" size={20} />
            </Pressable>
          </View>
          
          <ScrollView className="p-6">
            {/* Merks */}
            {medicine.merks && medicine.merks.length > 0 && (
              <View className="mb-5">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Merk Dagang</Text>
                <View className="flex-row flex-wrap gap-2">
                  {medicine.merks.map((merk, index) => (
                    <View key={index} className="bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                      <Text className="text-teal-700 font-bold text-sm">{merk.nama_merk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Dosis */}
            {(medicine.dosis_target || medicine.frekuensi_default) && (
              <View className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dosis Target & Frekuensi</Text>
                <Text className="text-slate-700 text-sm font-semibold">{medicine.dosis_target || '-'} • {medicine.frekuensi_default || '-'}</Text>
              </View>
            )}

            <View className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Indikasi</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed">{medicine.indikasi || '-'}</Text>
            </View>
            
            <View className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Kontraindikasi</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed">{medicine.kontraindikasi || '-'}</Text>
            </View>
            
            <View className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Efek Samping</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed">{medicine.efek_samping || '-'}</Text>
            </View>
            
            <View className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Monitoring</Text>
              <Text className="text-slate-700 text-sm font-medium leading-relaxed">{medicine.monitoring || '-'}</Text>
            </View>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}
