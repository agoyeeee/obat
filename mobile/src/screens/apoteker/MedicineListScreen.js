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
    <View style={{ flex: 1, backgroundColor: '#F0F4F3', paddingTop: 64, paddingHorizontal: 22 }}>
      <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A2820', marginBottom: 20, letterSpacing: -0.8 }}>Ensiklopedia Obat</Text>
      
      {/* Search Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EEF0EF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
        <Search color="#9DB0AA" size={28} />
        <TextInput
          style={{ flex: 1, marginLeft: 14, fontSize: 18, fontWeight: '600', color: '#1A2820' }}
          placeholder="Cari nama atau indikasi obat..."
          placeholderTextColor="#9DB0AA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1.5, borderColor: '#EEF0EF', overflow: 'hidden', flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 }}>
        {filteredMedicines.length > 0 ? (
          <FlatList
            data={filteredMedicines}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item, index }) => (
            <Pressable 
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: 22,
                backgroundColor: pressed ? '#F8FAFA' : '#FFFFFF',
                borderBottomWidth: index !== filteredMedicines.length - 1 ? 1.5 : 0,
                borderBottomColor: '#EEF0EF'
              })}
              onPress={() => setSelectedMedicine(item)}
            >
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginRight: 18 }}>
                <Pill color="#0D7A6A" size={32} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A2820' }}>{item.nama_obat}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#9DB0AA', marginTop: 6 }} numberOfLines={2}>
                  {item.indikasi || 'Tidak ada info indikasi.'}
                </Text>
              </View>
              <ChevronRight color="#CBD5E1" size={28} />
            </Pressable>
          )}
        />
        ) : (
          <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Obat tidak ditemukan.</Text>
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