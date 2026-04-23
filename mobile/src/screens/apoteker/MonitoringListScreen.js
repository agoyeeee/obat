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
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-slate-100 shadow-sm z-10">
        <Text className="text-2xl font-black text-slate-900 tracking-tight mt-2">Pantau Pasien</Text>
        <Text className="text-sm font-semibold text-slate-500 mt-1">Monitoring Kepatuhan Mingguan</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY CARDS */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-black text-slate-900">{totalPatients}</Text>
                <Text className="text-sm font-bold text-slate-500 mt-1">Total Monitoring</Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
                <Users color="#3B82F6" size={24} />
              </View>
            </View>
          </View>
          
          <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-3">
              <CheckCircle color="#10B981" size={20} />
            </View>
            <Text className="text-3xl font-black text-emerald-600">{patuhCount}</Text>
            <Text className="text-sm font-bold text-slate-500 mt-1">Status Patuh</Text>
          </View>

          <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center mb-3">
              <XCircle color="#F43F5E" size={20} />
            </View>
            <Text className="text-3xl font-black text-rose-600">{tidakPatuhCount}</Text>
            <Text className="text-sm font-bold text-slate-500 mt-1">Perlu Perhatian</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-3 mb-6">
          <Search color="#94A3B8" size={20} />
          <TextInput
            className="flex-1 ml-3 text-slate-900 text-base font-medium"
            placeholder="Cari pasien untuk dipantau..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
        ) : filteredPatients.length > 0 ? (
          <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {filteredPatients.map((item, index) => {
              const status = item.rekapan_obat?.[0]?.status_kepatuhan;
              const isPatuh = status === 'PATUH';
              const isTidakPatuh = status === 'TIDAK_PATUH';
              
              return (
                <Pressable 
                  key={item.id} 
                  className={`flex-row items-center p-4 active:bg-slate-50 ${index !== filteredPatients.length - 1 ? 'border-b border-slate-100' : ''}`}
                  onPress={() => navigation.navigate('PatientDetail', { pasien_id: item.id })}
                >
                  <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center mr-4">
                    <Activity color="#0D9488" size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">{item.nama}</Text>
                    <Text className="text-xs font-bold text-slate-400 mt-0.5">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</Text>
                  </View>
                  
                  {status ? (
                    <View className={`px-3 py-1.5 rounded-full mr-2 ${isPatuh ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      <Text className={`text-[10px] font-black ${isPatuh ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {status}
                      </Text>
                    </View>
                  ) : (
                    <View className="px-3 py-1.5 rounded-full bg-slate-100 mr-2">
                      <Text className="text-[10px] font-black text-slate-400">NO DATA</Text>
                    </View>
                  )}
                  
                  <ChevronRight color="#CBD5E1" size={20} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-10 items-center border border-slate-100 shadow-sm">
            <Calendar color="#CBD5E1" size={48} />
            <Text className="text-slate-400 font-bold mt-4 text-center">Tidak ada data pasien yang ditemukan</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}