import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ClipboardList } from 'lucide-react-native';

export default function QuestionnaireListScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F3' }}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A2820', letterSpacing: -0.8 }}>Hasil Kuisioner</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>Evaluasi Kepatuhan Pasien</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 22, paddingBottom: 64, flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 32, padding: 40, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ClipboardList color="#CBD5E1" size={64} />
          <Text style={{ color: '#9DB0AA', fontSize: 20, fontWeight: '700', marginTop: 24, textAlign: 'center' }}>
            Daftar evaluasi kuisioner akan muncul di sini
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}