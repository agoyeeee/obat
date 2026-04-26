import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePatients } from '../../hooks/usePatients';
import { Activity, Users, CheckCircle, XCircle, Search, ChevronRight, Calendar } from 'lucide-react-native';

export default function MonitoringListScreen({ navigation }) {
  const { patients, isLoading, fetchPatients } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const { totalPatients, patuhCount, tidakPatuhCount } = useMemo(() => {
    let patuh = 0;
    let tidakPatuh = 0;
    
    patients.forEach(p => {
      const status = p.rekapan_obat?.[0]?.status_kepatuhan;
      if (status === 'PATUH') patuh++;
      else if (status === 'TIDAK_PATUH') tidakPatuh++;
    });

    return {
      totalPatients: patients.length,
      patuhCount: patuh,
      tidakPatuhCount: tidakPatuh,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    return patients.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(p.id).includes(searchQuery)
    );
  }, [patients, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F3' }}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A2820', letterSpacing: -0.8 }}>Pantau Pasien</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>Monitoring Kepatuhan Mingguan</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY CARDS */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28, borderWidth: 1.5, borderColor: '#EEF0EF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#1A2820', lineHeight: 54 }}>{totalPatients}</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#9DB0AA', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Total Monitoring</Text>
              </View>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#EFF4FF', alignItems: 'center', justifyContent: 'center' }}>
                <Users color="#3B82F6" size={32} />
              </View>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1.5, borderColor: '#EEF0EF', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <CheckCircle color="#10B981" size={24} />
              </View>
              <Text style={{ fontSize: 36, fontWeight: '900', color: '#10B981', textAlign: 'center' }}>{patuhCount}</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#9DB0AA', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' }}>Patuh</Text>
            </View>

            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1.5, borderColor: '#EEF0EF', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <XCircle color="#F43F5E" size={24} />
              </View>
              <Text style={{ fontSize: 36, fontWeight: '900', color: '#F43F5E', textAlign: 'center' }}>{tidakPatuhCount}</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#9DB0AA', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' }}>Tidak Patuh</Text>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EEF0EF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, marginBottom: 20 }}>
          <Search color="#9DB0AA" size={28} />
          <TextInput
            style={{ flex: 1, marginLeft: 14, fontSize: 18, fontWeight: '600', color: '#1A2820' }}
            placeholder="Cari pasien untuk dipantau..."
            placeholderTextColor="#9DB0AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0D7A6A" style={{ marginTop: 40 }} />
        ) : filteredPatients.length > 0 ? (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1.5, borderColor: '#EEF0EF', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 }}>
            {filteredPatients.map((item, index) => {
              const status = item.rekapan_obat?.[0]?.status_kepatuhan;
              const isPatuh = status === 'PATUH';
              
              return (
                <Pressable 
                  key={item.id} 
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 22,
                    backgroundColor: pressed ? '#F8FAFA' : '#FFFFFF',
                    borderBottomWidth: index !== filteredPatients.length - 1 ? 1.5 : 0,
                    borderBottomColor: '#EEF0EF'
                  })}
                  onPress={() => navigation.navigate('PatientDetail', { pasien_id: item.id })}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginRight: 18 }}>
                    <Activity color="#0D7A6A" size={32} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A2820' }}>{item.nama}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>ID: {item.id}</Text>
                  </View>
                  
                  {status ? (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 12, backgroundColor: isPatuh ? '#E8F8F3' : '#FFF0F2' }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: isPatuh ? '#0D7A6A' : '#F43F5E', textTransform: 'uppercase' }}>
                        {status === 'TIDAK_PATUH' ? 'TIDAK PATUH' : status}
                      </Text>
                    </View>
                  ) : null}
                  
                  <ChevronRight color="#CBD5E1" size={28} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 40, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
            <Calendar color="#CBD5E1" size={64} />
            <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 20, textAlign: 'center' }}>Tidak ada data pasien</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}