import { View, Text, Pressable } from 'react-native';
import { Clock, Pill, Info, Check, X } from 'lucide-react-native';

export default function ReminderItem({ item, onDetail, onMarkIntake }) {
  const isPatuh = item.skor_kepatuhan === 'PATUH';

  return (
    <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 16, marginBottom: 12, backgroundColor: '#F8FAFC' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 }}>{item.obat?.nama_obat || 'Obat'}</Text>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: isPatuh ? '#D1FAE5' : '#FEE2E2' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: isPatuh ? '#047857' : '#B91C1C' }}>
            {item.skor_kepatuhan}
          </Text>
        </View>
      </View>
      
      <View style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Clock color="#64748B" size={14} />
          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>{item.waktu_konsumsi?.label_waktu}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pill color="#64748B" size={14} />
          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>{item.dosis} ({item.sediaan})</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'start' }}>
          <Info color="#64748B" size={14} style={{ marginTop: 2 }} />
          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500', marginLeft: 8, flex: 1 }}>{item.cara_pemakaian}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Pressable 
          style={({ pressed }) => ({
            flex: 1, borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F1F5F9' : 'transparent'
          })} 
          onPress={() => onDetail(item.obat)}
        >
          <Text style={{ color: '#334155', fontWeight: '700', fontSize: 13 }}>Detail</Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable 
          style={({ pressed }) => ({
            flex: 1, backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.9 : 1
          })} 
          onPress={() => onMarkIntake(item.id, 'PATUH')}
        >
          <Check color="#FFFFFF" size={14} />
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Patuh</Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable 
          style={({ pressed }) => ({
            flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.9 : 1
          })} 
          onPress={() => onMarkIntake(item.id, 'TIDAK_PATUH')}
        >
          <X color="#FFFFFF" size={14} />
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Tdk Patuh</Text>
        </Pressable>
      </View>
    </View>
  );
}
