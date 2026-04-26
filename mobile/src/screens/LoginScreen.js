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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        
        {/* Back Button */}
        <Pressable
          onPress={onBack}
          style={{
            alignSelf: 'flex-start',
            marginBottom: 24,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: '#F1F5F9',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155' }}>
            Kembali
          </Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 24,
              backgroundColor: '#CCFBF1',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 30 }}>💊</Text>
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: '900',
              color: '#0F172A',
              letterSpacing: -0.5,
            }}
          >
            MedReminder
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#0D9488',
              marginTop: 4,
            }}
          >
            Portal Apoteker
          </Text>
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderRadius: 32,
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          {/* Nama */}
          <Text style={labelStyle}>Nama Apoteker</Text>
          <TextInput
            style={inputStyle}
            placeholder="Masukkan nama Anda"
            placeholderTextColor="#94A3B8"
            value={nama}
            onChangeText={setNama}
          />

          {/* Password */}
          <Text style={labelStyle}>Password</Text>
          <TextInput
            style={inputStyle}
            placeholder="Masukkan kata sandi"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => ({
              backgroundColor: '#0D9488',
              opacity: pressed ? 0.9 : 1,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
              shadowColor: '#0D9488',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 3,
            })}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
            </Text>
          </Pressable>
        </View>

        {/* Demo Account */}
        <View
          style={{
            marginTop: 32,
            padding: 20,
            backgroundColor: '#F1F5F9',
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: '#CBD5E1',
          }}
        >
          <Text style={demoTitle}>Akun Demo (Apoteker):</Text>

          <View style={rowStyle}>
            <Text style={rowLabel}>Nama:</Text>
            <Text style={rowValue}>Siti Rahmawati</Text>
          </View>

          <View style={rowStyle}>
            <Text style={rowLabel}>Pass:</Text>
            <Text style={rowValue}>coba</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ================= STYLE HELPER =================
const labelStyle = {
  fontSize: 12,
  fontWeight: '700',
  color: '#64748B',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const inputStyle = {
  borderWidth: 2,
  borderColor: '#E2E8F0',
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginBottom: 16,
  backgroundColor: '#F8FAFC',
  color: '#0F172A',
  fontWeight: '500',
  fontSize: 15,
};

const demoTitle = {
  fontSize: 12,
  fontWeight: '700',
  color: '#64748B',
  marginBottom: 8,
};

const rowStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 4,
};

const rowLabel = {
  fontSize: 14,
  fontWeight: '500',
  color: '#64748B',
};

const rowValue = {
  fontSize: 14,
  fontWeight: '700',
  color: '#0F172A',
};