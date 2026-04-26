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
    <View className="flex-1 bg-[#F0F4F3]">
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View className="bg-white pt-16 pb-7 px-6 border-b-[1.5px] border-[#EEF0EF]">
        <Text className="text-3xl font-black text-[#1A2820] tracking-tight">Pantau Pasien</Text>
        <Text className="text-base font-bold text-[#9DB0AA] mt-1">Monitoring Kepatuhan Mingguan</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY CARDS */}
        <View className="mb-5">
          <View className="bg-white rounded-[28px] p-7 border-[1.5px] border-[#EEF0EF] shadow-sm shadow-black/5 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[48px] leading-[54px] font-black text-[#1A2820]">{totalPatients}</Text>
                <Text className="text-base font-extrabold text-[#9DB0AA] uppercase tracking-widest mt-1">Total Monitoring</Text>
              </View>
              <View className="w-16 h-16 rounded-[20px] bg-blue-50 items-center justify-center">
                <Users color="#3B82F6" size={32} />
              </View>
            </View>
          </View>
          
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white rounded-3xl p-5 border-[1.5px] border-[#EEF0EF] items-center mr-2">
              <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mb-3">
                <CheckCircle color="#10B981" size={24} />
              </View>
              <Text className="text-4xl font-black text-emerald-500 text-center">{patuhCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Patuh</Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-5 border-[1.5px] border-[#EEF0EF] items-center ml-2">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center mb-3">
                <XCircle color="#F43F5E" size={24} />
              </View>
              <Text className="text-4xl font-black text-rose-500 text-center">{tidakPatuhCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Tidak Patuh</Text>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-white border-[1.5px] border-[#EEF0EF] rounded-2xl px-5 py-4 mb-5 shadow-sm shadow-black/5">
          <Search color="#9DB0AA" size={24} />
          <TextInput
            className="flex-1 ml-3 text-lg font-semibold text-[#1A2820]"
            placeholder="Cari pasien untuk dipantau..."
            placeholderTextColor="#9DB0AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0D7A6A" className="mt-10" />
        ) : filteredPatients.length > 0 ? (
          <View className="bg-white rounded-3xl border-[1.5px] border-[#EEF0EF] shadow-sm shadow-black/5 overflow-hidden">
            {filteredPatients.map((item, index) => {
              const status = item.rekapan_obat?.[0]?.status_kepatuhan;
              const isPatuh = status === 'PATUH';
              
              return (
                <Pressable 
                  key={item.id} 
                  className={`flex-row items-center p-5 active:bg-[#F8FAFA] ${index !== filteredPatients.length - 1 ? 'border-b-[1.5px] border-[#EEF0EF]' : ''}`}
                  onPress={() => navigation.navigate('PatientDetail', { pasien_id: item.id })}
                >
                  <View className="w-16 h-16 rounded-[20px] bg-[#E8F8F3] items-center justify-center mr-4">
                    <Activity color="#0D7A6A" size={28} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-extrabold text-[#1A2820]">{item.nama}</Text>
                    <Text className="text-sm font-bold text-[#9DB0AA] mt-1">ID: {item.id}</Text>
                  </View>
                  
                  {status ? (
                    <View className={`px-3 py-1.5 rounded-full mr-3 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                      <Text className={`text-xs font-black uppercase ${isPatuh ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                        {status === 'TIDAK_PATUH' ? 'TIDAK PATUH' : status}
                      </Text>
                    </View>
                  ) : null}
                  
                  <ChevronRight color="#CBD5E1" size={24} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-10 items-center border-[1.5px] border-[#EEF0EF]">
            <Calendar color="#CBD5E1" size={64} />
            <Text className="text-[#9DB0AA] text-lg font-bold mt-5 text-center">Tidak ada data pasien</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}