import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useMonitoring } from '../../hooks/useMonitoring';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserMinus,
  UserPlus,
  LogOut,
  Pill,
} from 'lucide-react-native';
import { formatDateDDMMYY } from '../../utils/date';

function SectionHeader({ title, onPressAll }) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-xl font-black text-[#1E293B] tracking-tight">
        {title}
      </Text>
      {onPressAll && (
        <Pressable onPress={onPressAll} className="py-2 pl-3">
          <Text className="text-sm font-bold text-[#6366F1]">Lihat Semua →</Text>
        </Pressable>
      )}
    </View>
  );
}

function MetricCard({ icon, iconBg, value, label, badge }) {
  return (
    <View className="bg-white rounded-3xl border-[1.5px] border-[#E2E8F0] flex-1 shadow-sm shadow-black/5 p-5 items-center">
      <View className={`w-14 h-14 rounded-2xl ${iconBg} items-center justify-center mb-4`}>
        {icon}
      </View>
      <Text className="text-3xl font-black text-[#1E293B] leading-[38px] text-center">{value ?? 0}</Text>
      <Text className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mt-2 text-center">
        {label}
      </Text>
      {badge && (
        <View className="self-start bg-rose-500 rounded-full px-3 py-1.5 mt-3">
          <Text className="text-white text-xs font-black tracking-widest">PENTING</Text>
        </View>
      )}
    </View>
  );
}

function PatientRow({ patient, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-[24px] rounded-tl-none rounded-bl-none p-5 flex-row items-center mb-3 border-[1.5px] border-[#E2E8F0] border-l-[8px] border-l-rose-500 shadow-sm shadow-black/5 active:bg-rose-50"
    >
      <View className="w-16 h-16 rounded-[20px] bg-rose-50 border-[1.5px] border-rose-100 items-center justify-center mr-4">
        <UserMinus color="#F43F5E" size={32} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-black text-[#1E293B]">{patient.nama}</Text>
        <Text className="text-sm font-extrabold text-rose-500 uppercase tracking-widest mt-1.5">
          ● {patient.last_status}
        </Text>
      </View>
      <View className="w-11 h-11 rounded-2xl bg-[#F1F5F9] items-center justify-center">
        <ChevronRight color="#94A3B8" size={24} />
      </View>
    </Pressable>
  );
}

function ActivityItem({ activity, isLast }) {
  return (
    <View className={`flex-row items-center p-5 ${isLast ? '' : 'border-b-[1.5px] border-[#F1F5F9]'}`}>
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${activity.type === 'new_patient' ? 'bg-teal-50' : 'bg-[#F1F5F9]'}`}>
        {activity.type === 'new_patient' ? <UserPlus color="#0D9488" size={28} /> : <Clock color="#64748B" size={28} />}
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-[#1E293B]">{activity.title}</Text>
        <Text className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mt-1">
          {activity.time}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardHomeScreen({ route, navigation }) {
  const { user, onLogout } = route.params || {};
  const { todayData, isLoading, fetchTodaySummary } = useMonitoring();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { 
    fetchTodaySummary(); 
  }, [fetchTodaySummary]);
  
  const onRefresh = () => { 
    setIsRefreshing(true); 
    fetchTodaySummary().finally(() => setIsRefreshing(false));
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F0F4FF] justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const today = todayData?.today || {};
  const alerts = todayData?.alerts || {};
  const activities = todayData?.recent_activity || [];

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
          <View>
            <Text className="text-sm font-semibold text-[#C7D2FE] uppercase tracking-[1.5px]">
              {formatDateDDMMYY(new Date())}
            </Text>
            <Text className="text-2xl font-black text-white tracking-tight mt-1">
              Halo, {user?.nama?.split(' ')[0] || 'Apoteker'} 👋
            </Text>
          </View>
          <Pressable
            onPress={onLogout}
            className="w-12 h-12 rounded-[14px] bg-white/20 items-center justify-center border border-white/30 active:opacity-70"
          >
            <LogOut color="#fff" size={20} />
          </Pressable>
        </View>
        <View className="mt-4 self-start flex-row items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2">
          <Activity color="#fff" size={14} />
          <Text className="text-white text-xs font-bold">Status: Terpantau Aktif</Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* MAIN CARD */}
        <LinearGradient
          colors={['#0D9488', '#14B8A6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[32px] p-7 shadow-lg shadow-[#0D9488]/30 relative overflow-hidden"
        >
          <View className="absolute -top-9 -right-9 w-[140px] h-[140px] rounded-full bg-white/5" />
          
          <Text className="text-sm font-extrabold mb-4 text-white/70 uppercase tracking-widest">
            Aktivitas Hari Ini
          </Text>
          
          <View className="flex-row bg-black/20 rounded-3xl py-5">
            {[
              { num: today.taken ?? 0, label: 'Patuh', color: 'text-white' },
              { num: today.missed ?? 0, label: 'Tidak Patuh', color: 'text-[#FFA0AA]' },
            ].map(({ num, label, color }, i, arr) => (
              <View key={label} className={`flex-1 items-center justify-center px-1 ${i < arr.length - 1 ? 'border-r border-white/15' : ''}`}>
                <Text className={`text-2xl font-black text-center ${color}`}>{num}</Text>
                <Text className="text-xs font-extrabold text-white/60 uppercase tracking-wider mt-1 text-center">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* METRIC CARDS */}
        {/* <View className="flex-row mt-5">
          <MetricCard icon={<AlertTriangle color="#F43F5E" size={22} />} iconBg="bg-rose-50" value={alerts.count} label="Perlu Perhatian" badge={alerts.count > 0} />
          <View className="w-3" />
          <MetricCard icon={<Activity color="#6366F1" size={22} />} iconBg="bg-indigo-50" value={activities.length} label="Update Terbaru" />
        </View> */}


        {/* ACTIVITY */}
        {activities.length > 0 && (
          <View className="mt-6">
            <SectionHeader title="Aktivitas Terbaru" />
            <View className="bg-white rounded-[22px] border-[1.5px] border-[#E2E8F0] overflow-hidden">
              {activities.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} isLast={idx === activities.length - 1} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}