import { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView, Image } from 'react-native';
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
        
        {/* Back Button */}
        <Pressable
          onPress={onBack}
          className="self-start mb-6 px-4 py-2 rounded-full bg-slate-100 active:bg-slate-200"
        >
          <Text className="text-xs font-bold text-slate-700">
            Kembali
          </Text>
        </Pressable>

        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={require('../../assets/logo sobatjantung.png')}
            style={{ width: 340, height: 110, marginBottom: 8 }}
            resizeMode="contain"
          />
          <View className="bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200">
            <Text className="text-xs font-bold text-teal-700 tracking-wide">
              Portal Apoteker
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-teal-600/5 border border-slate-100">
          {/* Nama */}
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Nama Apoteker</Text>
          <TextInput
            className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
            placeholder="Masukkan nama Anda"
            placeholderTextColor="#94A3B8"
            value={nama}
            onChangeText={setNama}
          />

          {/* Password */}
          <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Password</Text>
          <TextInput
            className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-5 bg-slate-50 text-slate-900 font-medium text-[15px]"
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#94A3B8"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`bg-teal-600 rounded-2xl py-4 items-center mt-2 shadow-lg shadow-teal-600/30 active:opacity-90 ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-base">
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
            </Text>
          </Pressable>
        </View>

        {/* Demo Account */}
        <View className="mt-8 p-5 bg-slate-100 rounded-3xl border-[1.5px] border-slate-300">
          <Text className="text-xs font-bold text-slate-500 mb-2">Akun Demo (Apoteker):</Text>

          <View className="flex-row justify-between py-1">
            <Text className="text-sm font-medium text-slate-500">Nama:</Text>
            <Text className="text-sm font-bold text-slate-900">apt. Meta Kartika Untari, M.Sc.</Text>
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