import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

export default function MedicineModal({ medicine, onClose }) {
  if (!medicine) return null;

  return (
    <Modal visible={medicine !== null} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, maxHeight: '80%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1 }}>{medicine.nama_obat}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, backgroundColor: pressed ? '#E2E8F0' : '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginLeft: 8 })}>
              <X color="#64748B" size={20} />
            </Pressable>
          </View>
          
          <ScrollView style={{ padding: 24 }}>
            {/* Merks */}
            {medicine.merks && medicine.merks.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Merk Dagang</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {medicine.merks.map((merk, index) => (
                    <View key={index} style={{ backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#CCFBF1', marginRight: 8, marginBottom: 8 }}>
                      <Text style={{ color: '#0F766E', fontWeight: '700', fontSize: 14 }}>{merk.nama_merk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Dosis */}
            {(medicine.dosis_target || medicine.frekuensi_default) && (
              <View style={{ marginBottom: 20, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Dosis Target & Frekuensi</Text>
                <Text style={{ color: '#334155', fontSize: 14, fontWeight: '600' }}>{medicine.dosis_target || '-'} • {medicine.frekuensi_default || '-'}</Text>
              </View>
            )}

            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Indikasi</Text>
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: '500', lineHeight: 22 }}>{medicine.indikasi || '-'}</Text>
            </View>
            
            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Kontraindikasi</Text>
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: '500', lineHeight: 22 }}>{medicine.kontraindikasi || '-'}</Text>
            </View>
            
            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Efek Samping</Text>
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: '500', lineHeight: 22 }}>{medicine.efek_samping || '-'}</Text>
            </View>
            
            <View style={{ marginBottom: 32, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Monitoring</Text>
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: '500', lineHeight: 22 }}>{medicine.monitoring || '-'}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
