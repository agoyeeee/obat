import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
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
      <Text className="text-xl font-black text-[#1A2820] tracking-tight">
        {title}
      </Text>
      {onPressAll && (
        <Pressable onPress={onPressAll} className="py-2 pl-3">
          <Text className="text-sm font-bold text-[#0D9488]">Lihat Semua →</Text>
        </Pressable>
      )}
    </View>
  );
}

function MetricCard({ icon, iconBg, value, label, badge }) {
  return (
    <View className="bg-white rounded-3xl border-[1.5px] border-[#EEF0EF] flex-1 shadow-sm shadow-black/5 p-5 items-center">
      <View className={`w-14 h-14 rounded-2xl ${iconBg} items-center justify-center mb-4`}>
        {icon}
      </View>
      <Text className="text-3xl font-black text-[#1A2820] leading-[38px] text-center">{value ?? 0}</Text>
      <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-wider mt-2 text-center">
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
      className="bg-white rounded-[24px] rounded-tl-none rounded-bl-none p-5 flex-row items-center mb-3 border-[1.5px] border-[#EEF0EF] border-l-[8px] border-l-rose-500 shadow-sm shadow-black/5 active:bg-rose-50"
    >
      <View className="w-16 h-16 rounded-[20px] bg-rose-50 border-[1.5px] border-rose-100 items-center justify-center mr-4">
        <UserMinus color="#F43F5E" size={32} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-black text-[#1A2820]">{patient.nama}</Text>
        <Text className="text-sm font-extrabold text-rose-500 uppercase tracking-widest mt-1.5">
          ● {patient.last_status}
        </Text>
      </View>
      <View className="w-11 h-11 rounded-2xl bg-[#F4F6F5] items-center justify-center">
        <ChevronRight color="#9DB0AA" size={24} />
      </View>
    </Pressable>
  );
}

function ActivityItem({ activity, isLast }) {
  return (
    <View className={`flex-row items-center p-5 ${isLast ? '' : 'border-b-[1.5px] border-[#F4F6F5]'}`}>
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${activity.type === 'new_patient' ? 'bg-[#E8F8F3]' : 'bg-[#F4F6F5]'}`}>
        {activity.type === 'new_patient' ? <UserPlus color="#0D7A6A" size={28} /> : <Clock color="#64748B" size={28} />}
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-[#1A2820]">{activity.title}</Text>
        <Text className="text-xs font-bold text-[#9DB0AA] uppercase tracking-widest mt-1">
          {activity.time}
        </Text>
      </View>
    </View>
  );
}

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

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setIsRefreshing(true); fetchData(); };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F0F4F3] justify-center items-center">
        <ActivityIndicator size="large" color="#0D7A6A" />
      </View>
    );
  }

  const today = data?.today || {};
  const alerts = data?.alerts || {};
  const activities = data?.recent_activity || [];

  return (
    <View className="flex-1 bg-[#F0F4F3]">
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="bg-white pt-16 pb-7 px-6 border-b-[1.5px] border-[#EEF0EF]">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-sm font-bold text-[#9DB0AA] uppercase tracking-[1.5px]">
              {formatDateDDMMYY(new Date())}
            </Text>
            <Text className="text-2xl font-black text-[#1A2820] tracking-tight mt-1">
              Halo, {user?.nama?.split(' ')[0] || 'Apoteker'} 👋
            </Text>
          </View>
          <Pressable
            onPress={onLogout}
            className="w-14 h-14 rounded-[18px] bg-rose-50 items-center justify-center border-[1.5px] border-rose-100 active:bg-rose-100"
          >
            <LogOut color="#F43F5E" size={24} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MAIN CARD */}
        <View className="bg-[#0D7A6A] rounded-[32px] p-7 shadow-lg shadow-[#0D7A6A]/30 relative overflow-hidden">
          <View className="absolute -top-9 -right-9 w-[140px] h-[140px] rounded-full bg-white/5" />
          <View className="absolute top-7 right-7 w-16 h-16 rounded-[20px] bg-white/15 items-center justify-center">
            <Pill color="#fff" size={32} />
          </View>
          
          <Text className="text-sm font-extrabold text-white/70 uppercase tracking-widest">
            Aktivitas Hari Ini
          </Text>
          <Text className="text-3xl font-black text-white leading-[36px] my-1">
            {today.total ?? 0}
          </Text>
          <Text className="text-base text-white/85 font-bold mb-7">
            Total Jadwal Obat
          </Text>
          
          <View className="flex-row bg-black/20 rounded-3xl py-5">
            {[
              { num: today.taken ?? 0, label: 'Diminum', color: 'text-white' },
              { num: today.missed ?? 0, label: 'Tidak Patuh', color: 'text-[#FFA0AA]' },
              { num: today.pending ?? 0, label: 'Antri', color: 'text-white' },
            ].map(({ num, label, color }, i, arr) => (
              <View key={label} className={`flex-1 items-center justify-center px-1 ${i < arr.length - 1 ? 'border-r border-white/15' : ''}`}>
                <Text className={`text-2xl font-black text-center ${color}`}>{num}</Text>
                <Text className="text-xs font-extrabold text-white/60 uppercase tracking-wider mt-1 text-center">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* METRIC CARDS */}
        <View className="flex-row mt-5">
          <MetricCard icon={<AlertTriangle color="#F43F5E" size={22} />} iconBg="bg-rose-50" value={alerts.count} label="Perlu Perhatian" badge={alerts.count > 0} />
          <View className="w-3" />
          <MetricCard icon={<Activity color="#3B82F6" size={22} />} iconBg="bg-blue-50" value={activities.length} label="Update Terbaru" />
        </View>

        {/* PROBLEM PATIENTS */}
        <View className="mt-6">
          <SectionHeader title="Pasien Bermasalah" onPressAll={() => navigation.navigate('MonitoringTab')} />
          {alerts.patients?.length > 0 ? (
            alerts.patients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onPress={() => navigation.navigate('PatientDetail', { pasien_id: patient.id })}
              />
            ))
          ) : (
            <View className="bg-[#E8F8F3] border-2 border-[#52C7A0] rounded-[22px] p-8 items-center">
              <CheckCircle2 color="#0D7A6A" size={40} />
              <Text className="text-sm font-bold text-[#0D7A6A] text-center mt-3 leading-[20px]">
                Luar biasa! Semua pasien patuh hari ini.
              </Text>
            </View>
          )}
        </View>

        {/* ACTIVITY */}
        {activities.length > 0 && (
          <View className="mt-6">
            <SectionHeader title="Aktivitas Terbaru" />
            <View className="bg-white rounded-[22px] border-[1.5px] border-[#EEF0EF] overflow-hidden">
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