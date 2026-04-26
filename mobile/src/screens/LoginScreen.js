import { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ onLogin, onBack }) {
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await onLogin(nama, password);
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <View className="flex-1 px-6 justify-center">
        <Pressable onPress={onBack} className="self-start mb-6 px-3 py-2 rounded-full bg-slate-100 active:bg-slate-200">
          <Text className="text-sm font-bold text-slate-700">Kembali</Text>
        </Pressable>
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-3xl bg-teal-100 items-center justify-center mb-4">
            <Text className="text-3xl">💊</Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">MedReminder</Text>
          <Text className="text-base font-semibold text-teal-600 mt-1">Portal Login Apoteker</Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-lg shadow-teal-900/5 border border-slate-100">
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Apoteker</Text>
          <TextInput
            className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
            placeholder="Masukkan nama Anda"
            placeholderTextColor="#94a3b8"
            value={nama}
            onChangeText={setNama}
          />

          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</Text>
          <TextInput
            className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-5 bg-slate-50 text-slate-900 font-medium text-[15px]"
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable 
            className="bg-teal-600 rounded-2xl py-4 items-center shadow-md shadow-teal-600/30 active:bg-teal-700" 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</Text>
          </Pressable>
        </View>

        <View className="mt-8 p-5 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
          <Text className="text-xs font-bold text-slate-500 mb-2">Akun Demo (Apoteker):</Text>
          <View className="flex-row justify-between py-1">
            <Text className="text-sm font-medium text-slate-500">Nama:</Text>
            <Text className="text-sm font-bold text-slate-900">Siti Rahmawati</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-sm font-medium text-slate-500">Pass:</Text>
            <Text className="text-sm font-bold text-slate-900">coba</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
