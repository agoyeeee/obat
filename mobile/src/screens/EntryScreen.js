import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, UserRound } from 'lucide-react-native';

export default function EntryScreen({ onSelectApoteker, onSelectPasien }) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-18 h-18 rounded-[28px] bg-teal-100 items-center justify-center mb-4">
            <Text className="text-4xl">💊</Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">MedReminder</Text>
          <Text className="text-base font-semibold text-teal-600 mt-2 text-center">Pilih mode akses</Text>
        </View>

        <View className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-900/5 border border-slate-100 mb-4">
          <View className="flex-row items-start mb-4">
            <View className="w-11 h-11 rounded-2xl bg-teal-100 items-center justify-center mr-3">
              <ShieldCheck color="#0F766E" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-slate-900">Apoteker</Text>
              <Text className="text-sm text-slate-500 mt-1">Masuk untuk mengelola pasien, obat, monitoring, dan kuisioner.</Text>
            </View>
          </View>
          <Pressable className="bg-teal-600 rounded-2xl py-4 items-center active:bg-teal-700" onPress={onSelectApoteker}>
            <Text className="text-white font-bold text-base">Masuk sebagai Apoteker</Text>
          </Pressable>
        </View>

        <View className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-900/5 border border-slate-100">
          <View className="flex-row items-start mb-4">
            <View className="w-11 h-11 rounded-2xl bg-blue-100 items-center justify-center mr-3">
              <UserRound color="#2563EB" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-slate-900">Pasien</Text>
              <Text className="text-sm text-slate-500 mt-1">Tidak perlu login. Akses pasien akan diarahkan ke tampilan informasi publik atau portal khusus pasien.</Text>
            </View>
          </View>
          <Pressable className="bg-blue-600 rounded-2xl py-4 items-center active:bg-blue-700" onPress={onSelectPasien}>
            <Text className="text-white font-bold text-base">Masuk sebagai Pasien</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}