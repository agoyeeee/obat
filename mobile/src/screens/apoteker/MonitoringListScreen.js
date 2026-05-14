import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePatients } from '../../hooks/usePatients';
import { useMonitoring } from '../../hooks/useMonitoring';
import { Activity, Users, CheckCircle, XCircle, Search, ChevronRight, Calendar, Droplets } from 'lucide-react-native';

export default function MonitoringListScreen({ navigation }) {
  const { patients, isLoading, fetchPatients } = usePatients();
  const { todayData, fetchTodaySummary } = useMonitoring();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchTodaySummary();
  }, [fetchPatients, fetchTodaySummary]);

  const { totalPatients, patuhCount, tidakPatuhCount, patuhCairanCount, tidakPatuhCairanCount } = useMemo(() => {
    let patuh = 0;
    let tidakPatuh = 0;
    let patuhCairan = 0;
    let tidakPatuhCairan = 0;

    patients.forEach(p => {
      const status = p.rekapan_obat?.[0]?.status_kepatuhan;
      if (status === 'PATUH') patuh++;
      else if (status === 'TIDAK_PATUH') tidakPatuh++;

      const statusCairan = p.rekapan_cairan?.[0]?.status_kepatuhan;
      if (statusCairan === 'PATUH') patuhCairan++;
      else if (statusCairan === 'TIDAK_PATUH') tidakPatuhCairan++;
    });

    return {
      totalPatients: patients.length,
      patuhCount: patuh,
      tidakPatuhCount: tidakPatuh,
      patuhCairanCount: patuhCairan,
      tidakPatuhCairanCount: tidakPatuhCairan,
    };
  }, [patients]);

  // Get alert count from today's monitoring data
  const alertCount = useMemo(() => {
    return todayData?.alerts?.count ?? 0;
  }, [todayData]);

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
        <Text className="text-2xl font-black text-[#1A2820] tracking-tight">Pantau Pasien</Text>
        <Text className="text-sm font-bold text-[#9DB0AA] mt-1">Monitoring Kepatuhan Mingguan</Text>
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
                <Text className="text-3xl leading-[38px] font-black text-[#1A2820]">{totalPatients}</Text>
                <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-widest mt-1">Total Monitoring</Text>
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
              <Text className="text-3xl font-black text-emerald-500 text-center">{patuhCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Patuh</Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-5 border-[1.5px] border-[#EEF0EF] items-center ml-2">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center mb-3">
                <XCircle color="#F43F5E" size={24} />
              </View>
              <Text className="text-3xl font-black text-rose-500 text-center">{tidakPatuhCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Tidak Patuh</Text>
            </View>
          </View>
          
          {/* Cairan summary */}
          <View className="flex-row space-x-4 mt-4">
            <View className="flex-1 bg-white rounded-3xl p-5 border-[1.5px] border-[#EEF0EF] items-center mr-2">
              <View className="w-12 h-12 rounded-2xl bg-sky-50 items-center justify-center mb-3">
                <Droplets color="#06B6D4" size={24} />
              </View>
              <Text className="text-3xl font-black text-sky-500 text-center">{patuhCairanCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Cairan Patuh</Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-5 border-[1.5px] border-[#EEF0EF] items-center ml-2">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center mb-3">
                <XCircle color="#F43F5E" size={24} />
              </View>
              <Text className="text-3xl font-black text-rose-500 text-center">{tidakPatuhCairanCount}</Text>
              <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-1 text-center">Cairan Tidak Patuh</Text>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-white border-[1.5px] border-[#EEF0EF] rounded-2xl px-5 py-4 mb-5 shadow-sm shadow-black/5">
          <Search color="#9DB0AA" size={24} />
          <TextInput
            className="flex-1 ml-3 text-base font-semibold text-[#1A2820]"
            placeholder="Cari pasien untuk dipantau..."
            placeholderTextColor="#9DB0AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ALERTS SECTION */}
        {alertCount > 0 && (
          <View className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 mb-5">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-rose-100 items-center justify-center mr-3">
                <XCircle color="#F43F5E" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-[#1A2820]">Perlu Perhatian</Text>
                <Text className="text-sm font-bold text-[#F43F5E] mt-1">
                  {alertCount} pasien tidak patuh hari ini
                </Text>
              </View>
            </View>
          </View>
        )}

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
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-extrabold text-[#1A2820]" numberOfLines={1} ellipsizeMode="tail">
                      {item.nama}
                    </Text>
                  </View>
                  <ChevronRight color="#CBD5E1" size={24} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-10 items-center border-[1.5px] border-[#EEF0EF]">
            <Calendar color="#CBD5E1" size={64} />
            <Text className="text-[#9DB0AA] text-base font-bold mt-5 text-center">Tidak ada data pasien</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}