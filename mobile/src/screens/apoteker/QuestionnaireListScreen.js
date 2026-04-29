import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ClipboardList, MessageSquareText, FileText, Clock3, UserRound } from 'lucide-react-native';
import { fetchAllKuisioner, fetchApotekerKuisionerRekaps } from '../../services/patientService';

const TABS = [
  { key: 'soal', label: 'Soal', icon: FileText },
  { key: 'jawaban', label: 'Jawaban', icon: MessageSquareText },
];

const resolveJawabanList = (rekap) => rekap?.jawabanKuisioner || rekap?.jawaban_kuisioner || [];

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(value);
  }
};

const typeLabel = (type) => {
  switch (type) {
    case 'ya_tidak':
      return 'Ya / Tidak';
    case 'skala':
      return 'Skala';
    case 'pilihan':
      return 'Pilihan';
    default:
      return type || '-';
  }
};

// Majority vote untuk skor biner 0/1 dengan kasus imbang.
const resolveCategory = (averageScore) => {
  if (Math.abs(averageScore - 0.5) < Number.EPSILON) return 'Netral';
  return averageScore > 0.5 ? 'Ya' : 'Tidak';
};

export default function QuestionnaireListScreen() {
  const [activeTab, setActiveTab] = useState('soal');
  const [loading, setLoading] = useState(true);
  const [kuisioners, setKuisioners] = useState([]);
  const [rekaps, setRekaps] = useState([]);
  const [selectedRekap, setSelectedRekap] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [soalData, jawabanData] = await Promise.all([
          fetchAllKuisioner(),
          fetchApotekerKuisionerRekaps(),
        ]);

        setKuisioners(Array.isArray(soalData) ? soalData : []);
        setRekaps(Array.isArray(jawabanData) ? jawabanData : []);
      } catch (error) {
        console.error('[QuestionnaireListScreen] loadData failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const soalSummary = useMemo(() => {
    const yaTidak = kuisioners.filter((item) => item.tipe === 'ya_tidak').length;
    const pilihan = kuisioners.filter((item) => item.tipe === 'pilihan').length;
    const skala = kuisioners.filter((item) => item.tipe === 'skala').length;
    return { total: kuisioners.length, yaTidak, pilihan, skala };
  }, [kuisioners]);

  const answerCards = useMemo(() => {
    return rekaps.map((rekap) => ({
      ...rekap,
      jawabanList: resolveJawabanList(rekap),
      pasienNama: rekap?.pasien?.nama || rekap?.pasien?.nama_lengkap || 'Pasien',
      averageScore: (() => {
        const jawabanList = resolveJawabanList(rekap);
        if (!jawabanList.length) return 0;
        const totalSkor = jawabanList.reduce((sum, item) => sum + Number(item.skor || 0), 0);
        return totalSkor / jawabanList.length;
      })(),
    }));
  }, [rekaps]);

  const renderHeader = () => {
    return (
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: 64, paddingBottom: 20, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A2820', letterSpacing: -0.8 }}>Menu Kuisioner</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>Data soal dan jawaban dari database</Text>

        <View style={{ flexDirection: 'row', marginTop: 18, backgroundColor: '#F4F6F5', padding: 6, borderRadius: 18 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: isActive ? '#0D7A6A' : 'transparent',
                }}
              >
                <Icon color={isActive ? '#FFFFFF' : '#64748B'} size={16} />
                <Text style={{ color: isActive ? '#FFFFFF' : '#64748B', fontWeight: '800', marginLeft: 8 }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSoalTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <ClipboardList color="#0D7A6A" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A2820' }}>Daftar Soal</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#9DB0AA', marginTop: 2 }}>Diambil langsung dari tabel kuisioner</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }}>
          <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Total: {soalSummary.total}</Text>
          </View>
          <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Ya/Tidak: {soalSummary.yaTidak}</Text>
          </View>
          <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Pilihan: {soalSummary.pilihan}</Text>
          </View>
          <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Skala: {soalSummary.skala}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ActivityIndicator size="large" color="#0D7A6A" />
          <Text style={{ marginTop: 12, color: '#9DB0AA', fontWeight: '700' }}>Memuat soal...</Text>
        </View>
      ) : kuisioners.length > 0 ? (
        kuisioners.map((item, index) => (
          <View key={item.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ backgroundColor: '#E8F8F3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#0D7A6A', fontWeight: '900', fontSize: 12 }}>Soal {index + 1}</Text>
              </View>
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#64748B', fontWeight: '800', fontSize: 12 }}>{typeLabel(item.tipe)}</Text>
              </View>
            </View>

            <Text style={{ color: '#1A2820', fontSize: 18, fontWeight: '800', lineHeight: 26 }}>{item.pertanyaan}</Text>

            {Array.isArray(item.opsi) && item.opsi.length > 0 ? (
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: '#9DB0AA', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>Opsi</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {item.opsi.map((opsi, opsiIndex) => (
                    <View key={`${item.id}-${opsiIndex}`} style={{ backgroundColor: '#F4F6F5', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 }}>
                      <Text style={{ color: '#334155', fontWeight: '700' }}>{String(opsi)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ))
      ) : (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ClipboardList color="#CBD5E1" size={56} />
          <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>Belum ada data soal kuisioner.</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderJawabanTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MessageSquareText color="#4F46E5" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A2820' }}>Jawaban Kuisioner</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#9DB0AA', marginTop: 2 }}>Diambil dari tabel rekap_kuisioner dan jawaban_kuisioner</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ActivityIndicator size="large" color="#0D7A6A" />
          <Text style={{ marginTop: 12, color: '#9DB0AA', fontWeight: '700' }}>Memuat jawaban...</Text>
        </View>
      ) : answerCards.length > 0 ? (
        answerCards.map((rekap) => (
          <Pressable
            key={rekap.id}
            onPress={() => setSelectedRekap(rekap)}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 14 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <UserRound color="#16A34A" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1A2820', fontSize: 16, fontWeight: '900' }}>{rekap.pasienNama}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Clock3 color="#9DB0AA" size={14} />
                    <Text style={{ color: '#9DB0AA', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{formatDate(rekap.tanggal)}</Text>
                  </View>
                </View>
              </View>
              <View style={{ backgroundColor: '#E8F8F3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: '#0D7A6A', fontWeight: '900', fontSize: 12 }}>{(rekap.averageScore * 100).toFixed(0)}%</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={{ backgroundColor: '#EEF2FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
                <Text style={{ color: '#4338CA', fontWeight: '800', fontSize: 12 }}>Kategori: {resolveCategory(rekap.averageScore)}</Text>
              </View>
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#64748B', fontWeight: '800', fontSize: 12 }}>Rata-rata: {rekap.averageScore.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 12 }}>
              Ketuk untuk melihat detail jawaban per pasien
            </Text>
          </Pressable>
        ))
      ) : (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <MessageSquareText color="#CBD5E1" size={56} />
          <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>Belum ada jawaban kuisioner.</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDetailModal = () => {
    if (!selectedRekap) return null;

    const jawabanList = selectedRekap.jawabanList || [];

    return (
      <Modal
        visible={selectedRekap !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRekap(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(26,40,32,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%' }}>
            <View style={{ padding: 20, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: '#1A2820', fontSize: 22, fontWeight: '900' }}>{selectedRekap.pasienNama}</Text>
                <Text style={{ color: '#9DB0AA', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{formatDate(selectedRekap.tanggal)}</Text>
              </View>
              <Pressable onPress={() => setSelectedRekap(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F6F5', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#64748B', fontSize: 18, fontWeight: '900' }}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 20, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>Rata-rata jawaban</Text>
                <Text style={{ color: '#0D7A6A', fontSize: 28, fontWeight: '900', marginTop: 8 }}>{(selectedRekap.averageScore * 100).toFixed(0)}%</Text>
                <Text style={{ color: '#4338CA', fontSize: 14, fontWeight: '800', marginTop: 4 }}>Kategori: {resolveCategory(selectedRekap.averageScore)}</Text>
                <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700', marginTop: 4 }}>{jawabanList.length} jawaban</Text>
              </View>

              {jawabanList.length > 0 ? jawabanList.map((jawaban, index) => (
                <View key={jawaban.id || `${selectedRekap.id}-${index}`} style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 12 }}>
                  <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', marginBottom: 8 }}>Jawaban {index + 1}</Text>
                  <Text style={{ color: '#1A2820', fontSize: 15, fontWeight: '800', lineHeight: 22 }}>
                    {jawaban.kuisioner?.pertanyaan || 'Pertanyaan tidak tersedia'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <Text style={{ color: '#334155', fontWeight: '800' }}>{jawaban.jawaban}</Text>
                    <View style={{ backgroundColor: '#E8F8F3', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text style={{ color: '#0D7A6A', fontWeight: '900', fontSize: 12 }}>Skor {jawaban.skor}</Text>
                    </View>
                  </View>
                </View>
              )) : (
                <View style={{ backgroundColor: '#F8FAFA', borderRadius: 18, padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#9DB0AA', fontWeight: '700' }}>Tidak ada detail jawaban.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F3' }}>
      <StatusBar style="dark" />
      {renderHeader()}
      {activeTab === 'soal' ? renderSoalTab() : renderJawabanTab()}
      {renderDetailModal()}
    </View>
  );
}
