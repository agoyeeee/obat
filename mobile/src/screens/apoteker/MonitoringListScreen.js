import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View className="flex-1 bg-[#F0F4FF]">
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <LinearGradient
        colors={['#0D9488', '#14B8A6', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-16 pb-7 px-6 rounded-b-[36px]"
      >
        <View className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/10" />
        <View className="absolute top-8 right-16 w-20 h-20 rounded-full bg-white/10" />
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-semibold text-[#C7D2FE] uppercase tracking-[1.5px]">
              Monitoring Apoteker
            </Text>
            <Text className="text-2xl font-black text-white tracking-tight mt-1">
              Pantau Pasien
            </Text>
            <Text className="text-sm font-bold text-white/75 mt-1">Monitoring Kepatuhan Pasien</Text>
          </View>
          <View className="w-12 h-12 rounded-[14px] bg-white/20 items-center justify-center border border-white/30">
            <Activity color="#fff" size={22} />
          </View>
        </View>
        <View className="mt-4 self-start flex-row items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2">
          <Users color="#fff" size={14} />
          <Text className="text-white text-xs font-bold">{totalPatients} pasien terpantau</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY CARDS */}
        <View className="mb-5">
          <View className="bg-white rounded-[28px] p-7 border-[1.5px] border-[#E2E8F0] shadow-sm shadow-black/5 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl leading-[38px] font-black text-[#1E293B]">{totalPatients}</Text>
                <Text className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-widest mt-1">Total Monitoring</Text>
              </View>
              <View className="w-16 h-16 rounded-[20px] bg-[#EEF2FF] items-center justify-center">
                <Users color="#6366F1" size={32} />
              </View>
            </View>
          </View>
          
          {/* Kepatuhan Cards - Side by Side */}
          <View className="flex-row gap-3">
            {/* Obat Card */}
            <View className="flex-1 bg-white rounded-[22px] p-4 border-[1.5px] border-[#E2E8F0] shadow-sm shadow-black/5">
              <Text className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-3">Kepatuhan Obat</Text>
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center mr-2">
                  <CheckCircle color="#10B981" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-black text-emerald-500">{patuhCount}</Text>
                  <Text className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wide">Patuh</Text>
                </View>
              </View>
              <View className="h-[1px] bg-[#E2E8F0] my-1.5" />
              <View className="flex-row items-center mt-2">
                <View className="w-8 h-8 rounded-lg bg-rose-50 items-center justify-center mr-2">
                  <XCircle color="#F43F5E" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-black text-rose-500">{tidakPatuhCount}</Text>
                  <Text className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wide">Tidak Patuh</Text>
                </View>
              </View>
            </View>

            {/* Cairan Card */}
            <View className="flex-1 bg-white rounded-[22px] p-4 border-[1.5px] border-[#E2E8F0] shadow-sm shadow-black/5">
              <Text className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-3">Kepatuhan Cairan</Text>
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg bg-[#E0F2FE] items-center justify-center mr-2">
                  <Droplets color="#0EA5E9" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-black text-sky-500">{patuhCairanCount}</Text>
                  <Text className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wide">Patuh</Text>
                </View>
              </View>
              <View className="h-[1px] bg-[#E2E8F0] my-1.5" />
              <View className="flex-row items-center mt-2">
                <View className="w-8 h-8 rounded-lg bg-rose-50 items-center justify-center mr-2">
                  <XCircle color="#F43F5E" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-black text-rose-500">{tidakPatuhCairanCount}</Text>
                  <Text className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wide">Tidak Patuh</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-white border-[1.5px] border-[#E2E8F0] rounded-2xl px-5 py-4 mb-5 shadow-sm shadow-black/5">
          <Search color="#94A3B8" size={24} />
          <TextInput
            className="flex-1 ml-3 text-base font-semibold text-[#1E293B]"
            placeholder="Cari nama pasien ..."
            placeholderTextColor="#94A3B8"
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
                <Text className="text-lg font-black text-[#1E293B]">Perlu Perhatian</Text>
                <Text className="text-sm font-bold text-[#F43F5E] mt-1">
                  {alertCount} pasien tidak patuh hari ini
                </Text>
              </View>
            </View>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#6366F1" className="mt-10" />
        ) : filteredPatients.length > 0 ? (
          <View className="bg-white rounded-3xl border-[1.5px] border-[#E2E8F0] shadow-sm shadow-black/5 overflow-hidden">
            {filteredPatients.map((item, index) => {
              const status = item.rekapan_obat?.[0]?.status_kepatuhan;
              const isPatuh = status === 'PATUH';
              
              return (
                <Pressable 
                  key={item.id} 
                  className={`flex-row items-center p-5 active:bg-[#F1F5F9] ${index !== filteredPatients.length - 1 ? 'border-b-[1.5px] border-[#E2E8F0]' : ''}`}
                  onPress={() => navigation.navigate('PatientDetail', { pasien_id: item.id })}
                >
                  <View className="w-16 h-16 rounded-[20px] bg-[#EEF2FF] items-center justify-center mr-4">
                    <Activity color="#6366F1" size={28} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-extrabold text-[#1E293B]" numberOfLines={1} ellipsizeMode="tail">
                      {item.nama}
                    </Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={24} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-10 items-center border-[1.5px] border-[#E2E8F0]">
            <Calendar color="#CBD5E1" size={64} />
            <Text className="text-[#94A3B8] text-base font-bold mt-5 text-center">Tidak ada data pasien</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
