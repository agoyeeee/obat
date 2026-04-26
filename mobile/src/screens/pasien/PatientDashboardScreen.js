import { View, Text, Pressable, ScrollView, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import {
  LogOut,
  UserRound,
  Bell,
  Droplets,
  MessageCircle,
  ClipboardList,
  ChevronRight,
  AlertTriangle,
  Activity,
  CalendarDays,
} from 'lucide-react-native';

export default function PatientDashboardScreen({ profile, onEditProfile, onBack }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  const openMenu = (menuName) => {
    Alert.alert('Menu', `${menuName} akan dibuka di update berikutnya.`);
  };

  const menuItems = [
    {
      key: 'obat',
      title: 'Reminder Minum Obat',
      subtitle: 'Lihat jadwal dan status minum obat',
      icon: <Bell color="#0D9488" size={20} />,
      bgClass: 'bg-teal-50 border-teal-100',
      onPress: () => openMenu('Reminder Minum Obat'),
    },
    {
      key: 'cairan',
      title: 'Reminder Minum Cairan',
      subtitle: 'Pantau target cairan harian',
      icon: <Droplets color="#3B82F6" size={20} />,
      bgClass: 'bg-blue-50 border-blue-100',
      onPress: () => openMenu('Reminder Minum Cairan'),
    },
    {
      key: 'tanya-apoteker',
      title: 'Tanya Apoteker',
      subtitle: 'Konsultasi cepat seputar terapi',
      icon: <MessageCircle color="#8B5CF6" size={20} />,
      bgClass: 'bg-violet-50 border-violet-100',
      onPress: () => openMenu('Tanya Apoteker'),
    },
    {
      key: 'kuisioner',
      title: 'Kuisioner',
      subtitle: 'Isi evaluasi berkala kondisi',
      icon: <ClipboardList color="#F59E0B" size={20} />,
      bgClass: 'bg-amber-50 border-amber-100',
      onPress: () => openMenu('Kuisioner'),
    },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="bg-white pt-14 pb-6 px-6 border-b border-slate-100 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Halo, {profile?.nama?.split(' ')[0] || 'Pasien'}
            </Text>
          </View>
          <Pressable
            onPress={onBack}
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
        <View className="bg-teal-600 rounded-[32px] p-6 shadow-xl shadow-teal-900/20 mb-6 overflow-hidden">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-teal-100 font-bold text-sm uppercase tracking-wider">Portal Pasien</Text>
              <Text className="text-white text-4xl font-black mt-1">4</Text>
              <Text className="text-teal-100 font-semibold">Menu Utama Tersedia</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center">
              <UserRound color="#FFFFFF" size={24} />
            </View>
          </View>

          <View className="flex-row bg-black/10 rounded-2xl p-4 justify-between items-center">
            <View className="items-center flex-1 border-r border-white/10">
              <Text className="text-white text-xl font-black">{profile?.usia || 0}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Usia</Text>
            </View>
            <View className="items-center flex-1 border-r border-white/10">
              <Text className="text-white text-xl font-black">{profile?.berat_badan || 0}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Berat (kg)</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-white text-xl font-black">{profile?.jenis_kelamin || '-'}</Text>
              <Text className="text-teal-100 text-[10px] font-bold uppercase">Kelamin</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-rose-500">
            <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mb-3">
              <AlertTriangle color="#F43F5E" size={20} />
            </View>
            <Text className="text-3xl font-black text-slate-900">{profile?.tgl_diagnosa ? '1' : '0'}</Text>
            <Text className="text-xs font-bold text-slate-500 uppercase mt-1">Data Diagnosa</Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mb-3">
              <Activity color="#3B82F6" size={20} />
            </View>
            <Text className="text-3xl font-black text-slate-900">4</Text>
            <Text className="text-xs font-bold text-slate-500 uppercase mt-1">Menu Aktif</Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-black text-slate-900 tracking-tight">Menu Pasien</Text>
            <Pressable onPress={onEditProfile}>
              <Text className="text-sm font-bold text-teal-600">Ubah Biodata</Text>
            </Pressable>
          </View>

          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 flex-row items-center active:bg-slate-50"
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border ${item.bgClass}`}>
                {item.icon}
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-slate-900">{item.title}</Text>
                <Text className="text-xs font-semibold text-slate-500 mt-0.5">{item.subtitle}</Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                <ChevronRight color="#CBD5E1" size={18} />
              </View>
            </Pressable>
          ))}
        </View>

        <View className="bg-white rounded-3xl p-5 border border-slate-100">
          <View className="flex-row items-center mb-2">
            <CalendarDays color="#64748B" size={18} />
            <Text className="ml-2 text-sm font-bold text-slate-500 uppercase">Tanggal Diagnosa</Text>
          </View>
          <Text className="text-base font-black text-slate-900">{profile?.tgl_diagnosa || '-'}</Text>
          <Text className="text-xs text-slate-400 mt-2">Data ini diambil dari biodata pasien yang tersimpan di device.</Text>
        </View>

        <Pressable onPress={onEditProfile} className="mt-5 bg-blue-600 rounded-2xl py-4 items-center active:bg-blue-700">
          <Text className="text-white font-bold text-base">Ubah Biodata</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
