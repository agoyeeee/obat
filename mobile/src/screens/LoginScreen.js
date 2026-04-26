import { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ onLogin }) {
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await onLogin(nama, password);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 24, backgroundColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 30 }}>💊</Text>
          </View>
          <Text style={{ fontSize: 30, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 }}>MedReminder</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#0D9488', marginTop: 4 }}>Portal Apoteker</Text>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 32, shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Nama Apoteker</Text>
          <TextInput
            style={{ borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, backgroundColor: '#F8FAFC', color: '#0F172A', fontWeight: '500', fontSize: 15 }}
            placeholder="Masukkan nama Anda"
            placeholderTextColor="#94a3b8"
            value={nama}
            onChangeText={setNama}
          />

          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</Text>
          <TextInput
            style={{ borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, backgroundColor: '#F8FAFC', color: '#0F172A', fontWeight: '500', fontSize: 15 }}
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#94a3b8"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable 
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#0D9488' : '#0D9488', 
              opacity: pressed ? 0.9 : 1,
              borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#0D9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3
            })} 
            onPress={handleLogin} 
            disabled={isLoading}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 32, padding: 20, backgroundColor: '#F1F5F9', borderRadius: 24, borderWidth: 1.5, borderColor: '#CBD5E1' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 }}>Akun Demo (Apoteker):</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748B' }}>Nama:</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>Siti Rahmawati</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748B' }}>Pass:</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>coba</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
