import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import { 
  Bell, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  UserMinus, 
  UserPlus,
  LogOut,
  ShieldPlus
} from 'lucide-react-native';

export default function DashboardHomeScreen({ route, navigation }) {
  const { user, onLogout } = route.params || {};
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/monitoring/today-summary');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching today summary:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View className="bg-white pt-14 pb-6 px-6 border-b border-slate-100 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Halo, {user?.nama?.split(' ')[0] || 'Apoteker'}
            </Text>
          </View>
          <Pressable 
            onPress={onLogout}
            className="w-12 h-12 rounded-2xl bg-rose-50 items-center justify-center border border-rose-100 active:bg-rose-100"
          >
            <LogOut color="#F43F5E" size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        
        {/* MAIN ACTION CARD: REMINDER TODAY */}
        <View className="bg-teal-600 rounded-[32px] p-6 shadow-xl shadow-teal-900/20 mb-6 overflow-hidden">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-teal-100 font-bold text-sm uppercase tracking-wider">Aktivitas Hari Ini</Text>
              <Text className="text-white text-4xl font-black mt-1">{data?.today?.total || 0}</Text>
              <Text className="text-teal-100 font-semibold">Total Jadwal Obat</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
              <Bell color="#FFFFFF" size={24} />
            </View>
          </View>

          <View className="flex-row bg-black/10 rounded-2xl p-4 justify-between items-center">
            <View className="items-center flex-1 border-r border-white/10">
              <Text className="text-white text-xl font-black">{data?.today?.taken || 0}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Diminum</Text>
            </View>
            <View className="items-center flex-1 border-r border-white/10">
              <Text className="text-rose-200 text-xl font-black">{data?.today?.missed || 0}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Terlewat</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-white text-xl font-black">{data?.today?.pending || 0}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Menunggu</Text>
            </View>
          </View>
        </View>

        {/* ALERT CARD: PERLU PERHATIAN */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-rose-500">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                <AlertTriangle color="#F43F5E" size={20} />
              </View>
              {data?.alerts?.count > 0 && (
                <View className="bg-rose-500 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-[10px] font-black">URGENT</Text>
                </View>
              )}
            </View>
            <Text className="text-3xl font-black text-slate-900">{data?.alerts?.count || 0}</Text>
            <Text className="text-xs font-bold text-slate-500 uppercase mt-1">Perlu Perhatian</Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mb-3">
              <Activity color="#3B82F6" size={20} />
            </View>
            <Text className="text-3xl font-black text-slate-900">{data?.recent_activity?.length || 0}</Text>
            <Text className="text-xs font-bold text-slate-500 uppercase mt-1">Update Terbaru</Text>
          </View>
        </View>

        {/* LIST: PASIEN BERMASALAH HARI INI */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-black text-slate-900 tracking-tight">Pasien Bermasalah Hari Ini</Text>
            <Pressable onPress={() => navigation.navigate('MonitoringTab')}>
              <Text className="text-sm font-bold text-teal-600">Lihat Semua</Text>
            </Pressable>
          </View>

          {data?.alerts?.patients?.length > 0 ? (
            data.alerts.patients.map((patient) => (
              <Pressable 
                key={patient.id}
                onPress={() => navigation.navigate('MonitoringTab', { screen: 'PatientDetail', params: { pasien_id: patient.id } })}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 flex-row items-center active:bg-slate-50"
              >
                <View className="w-12 h-12 rounded-full bg-rose-50 items-center justify-center mr-4 border border-rose-100">
                  <UserMinus color="#F43F5E" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-slate-900">{patient.nama}</Text>
                  <Text className="text-xs font-bold text-rose-500 mt-0.5">Status: {patient.last_status.toUpperCase()}</Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                  <ChevronRight color="#CBD5E1" size={18} />
                </View>
              </Pressable>
            ))
          ) : (
            <View className="bg-emerald-50 rounded-2xl p-8 items-center border border-dashed border-emerald-200">
              <CheckCircle2 color="#10B981" size={40} />
              <Text className="text-emerald-700 font-bold mt-3 text-center">Luar Biasa! Semua pasien patuh hari ini.</Text>
            </View>
          )}
        </View>

        {/* OPTIONAL: AKTIVITAS TERBARU */}
        <View>
          <Text className="text-xl font-black text-slate-900 tracking-tight mb-4">Aktivitas Terbaru</Text>
          <View className="bg-white rounded-3xl p-2 border border-slate-100">
            {data?.recent_activity?.map((activity, idx) => (
              <View 
                key={idx} 
                className={`flex-row items-center p-4 ${idx !== data.recent_activity.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-4">
                  {activity.type === 'new_patient' ? <UserPlus color="#64748B" size={18} /> : <Clock color="#64748B" size={18} />}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">{activity.title}</Text>
                  <Text className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase">{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}