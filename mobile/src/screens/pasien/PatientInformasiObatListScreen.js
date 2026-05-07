import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, ChevronRight, Pill, Layers3, Sparkles } from 'lucide-react-native';
import { fetchPublicObatList } from '../../services/patientService';

const normalizeDoseLine = (value) => String(value || '').replace(/\s*mg\s*$/i, '').trim();

const formatDosePreview = (obat) => {
  const target = String(obat?.dosis_target || '').trim();
  if (target) return target;
  const init = String(obat?.dosis_inisiasi || '').trim();
  if (!init) return '-';
  const parts = init
    .split(/\n|,|;/)
    .map((item) => normalizeDoseLine(item))
    .filter(Boolean);
  if (parts.length === 0) return '-';
  if (parts.length === 1) return `${parts[0]} mg`;
  return `${parts[0]} mg - ${parts[parts.length - 1]} mg`;
};

const formatMerkList = (merks) => {
  if (!Array.isArray(merks) || merks.length === 0) return 'Tanpa merek';
  return merks.map((item) => item?.nama_merk).filter(Boolean).slice(0, 3).join(', ');
};

export default function PatientInformasiObatListScreen({ onBack, onOpenDetail }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [obatList, setObatList] = useState([]);
  const [query, setQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPublicObatList();
      setObatList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const filteredList = useMemo(() => {
    if (!query.trim()) return obatList;
    const lower = query.toLowerCase();
    return obatList.filter((item) => {
      const nama = String(item.nama_obat || '').toLowerCase();
      const indikasi = String(item.indikasi || '').toLowerCase();
      return nama.includes(lower) || indikasi.includes(lower);
    });
  }, [obatList, query]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4F3', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F3' }}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={['#0D7A6A', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: '#ffffff25',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#ffffff40',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <ArrowLeft color="#fff" size={18} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#D1FAE5', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '700' }}>
                Menu Informasi
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 }}>
                Informasi Obat
              </Text>
            </View>
          </View>

          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff25', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff40' }}>
            <Pill color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, shadowColor: '#0D9488', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles color="#0D9488" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Daftar Obat</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{filteredList.length} obat tersedia</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 14, marginBottom: 8 }}>
              <Search color="#94A3B8" size={18} />
              <TextInput
                placeholder="Cari nama obat atau indikasi"
                placeholderTextColor="#94A3B8"
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, paddingVertical: 12, paddingLeft: 10, color: '#1E293B' }}
              />
            </View>
          </View>
        </View>

        <View style={{ marginTop: 18, paddingHorizontal: 20 }}>
          {filteredList.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Layers3 color="#94A3B8" size={28} />
              <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15, marginTop: 10 }}>Tidak ada obat ditemukan</Text>
              <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                Coba kata kunci lain untuk mencari obat.
              </Text>
            </View>
          ) : (
            filteredList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onOpenDetail?.(item)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.86 : 1,
                  marginBottom: 12,
                })}
              >
                <View style={{ marginTop: 5, backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }} numberOfLines={1}>
                        {item.nama_obat}
                      </Text>
                      <Text style={{ color: '#0D9488', fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                        Dosis: {formatDosePreview(item)}
                      </Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6, lineHeight: 18 }} numberOfLines={2}>
                        {item.indikasi || '-'}
                      </Text>
                    </View>
                    <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight color="#0D9488" size={18} />
                    </View>
                  </View>

                  <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>
                      Merek: {formatMerkList(item.merks)}
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>
                      Frekuensi: {item.frekuensi_default || '-'}x/hari
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
