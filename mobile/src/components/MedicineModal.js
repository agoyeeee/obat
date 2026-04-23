import { Modal, View, Text, ScrollView, Pressable } from 'react-native';

export default function MedicineModal({ medicine, onClose, onContact }) {
  if (!medicine) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 bg-slate-900/60 justify-center p-5">
        <View className="bg-white rounded-[28px] max-h-[80%] overflow-hidden shadow-2xl">
          <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
            <Text className="text-xl font-extrabold text-slate-900 flex-1">{medicine.nama_obat}</Text>
            <Pressable onPress={onClose} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center ml-2">
              <Text className="text-slate-500 font-bold text-base">✕</Text>
            </Pressable>
          </View>
          
          <ScrollView className="p-6">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Indikasi</Text>
            <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{medicine.indikasi || '-'}</Text>
            
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kontraindikasi</Text>
            <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{medicine.kontraindikasi || '-'}</Text>
            
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efek Samping</Text>
            <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{medicine.efek_samping || '-'}</Text>
            
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monitoring</Text>
            <Text className="text-slate-700 text-sm font-medium leading-relaxed mb-4">{medicine.monitoring || '-'}</Text>
          </ScrollView>

          <View className="p-6 pt-2">
            <Pressable className="bg-teal-600 rounded-xl py-4 items-center active:bg-teal-700" onPress={() => onContact(medicine.nama_obat)}>
              <Text className="text-white font-bold text-base">Tanya via WhatsApp</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
