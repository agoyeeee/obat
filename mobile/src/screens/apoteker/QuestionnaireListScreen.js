import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ClipboardList, MessageSquareText, FileText, Clock3, UserRound, ChevronRight, Search, X } from 'lucide-react-native';
import { fetchApotekerKuisionerRekaps } from '../../services/patientService';
import { formatDateDDMMYY } from '../../utils/date';

const formatDate = (value) => {
  return formatDateDDMMYY(value);
};

const formatDateDDMMYYYY = (value) => {
  return formatDateDDMMYY(value);
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? value.map((item) => formatValue(item)).join(', ') : '-';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  return String(value);
};

const prettyLabel = (key) => {
  const cleaned = String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return cleaned || '-';
};

const isDiagnosisField = (key) => /diagnosis|tgl_diagnosa/i.test(String(key || ''));

const listLabels = {
  obat_herbal_list: 'Obat Herbal',
  obat_jantung_list: 'Obat Jantung',
};

const listCardAccent = {
  obat_herbal_list: '#0D7A6A',
  obat_jantung_list: '#4338CA',
};

const renderMedicationCard = (item, accentColor) => {
  if (!item || typeof item !== 'object') {
    return (
      <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, padding: 14, marginBottom: 10 }}>
        <Text style={{ color: '#9DB0AA', fontWeight: '700' }}>{formatValue(item)}</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: '#1A2820', fontSize: 16, fontWeight: '900', lineHeight: 22 }} numberOfLines={2}>
            {item.nama_obat || item.nama || 'Nama obat tidak tersedia'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {item.dosis ? (
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 6 }}>
                <Text style={{ color: accentColor, fontWeight: '800', fontSize: 12 }}>Dosis: {formatValue(item.dosis)}</Text>
              </View>
            ) : null}
            {item.frekuensi ? (
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 6 }}>
                <Text style={{ color: accentColor, fontWeight: '800', fontSize: 12 }}>Frekuensi: {formatValue(item.frekuensi)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {item.keterangan ? (
        <View style={{ backgroundColor: '#F8FAFA', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#EEF0EF' }}>
          <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', marginBottom: 4 }}>Keterangan</Text>
          <Text style={{ color: '#1A2820', fontSize: 14, fontWeight: '600', lineHeight: 20 }}>
            {formatValue(item.keterangan)}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const renderListSection = (key, items) => {
  const accentColor = listCardAccent[key] || '#0D7A6A';
  const label = listLabels[key] || prettyLabel(key);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#1A2820', fontSize: 16, fontWeight: '900', marginBottom: 10 }}>{label}</Text>
      {Array.isArray(items) && items.length > 0 ? (
        items.map((item, index) => (
          <View key={`${key}-${index}`}>
            {renderMedicationCard(item, accentColor)}
          </View>
        ))
      ) : (
        <View style={{ backgroundColor: '#F8FAFA', borderRadius: 18, padding: 16 }}>
          <Text style={{ color: '#9DB0AA', fontWeight: '700' }}>Tidak ada data.</Text>
        </View>
      )}
    </View>
  );
};

const renderObjectRows = (data) => {
  if (!data || typeof data !== 'object') {
    return (
      <View style={{ backgroundColor: '#F8FAFA', borderRadius: 18, padding: 16 }}>
        <Text style={{ color: '#9DB0AA', fontWeight: '700' }}>Data tidak tersedia.</Text>
      </View>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <View style={{ backgroundColor: '#F8FAFA', borderRadius: 18, padding: 16 }}>
        <Text style={{ color: '#9DB0AA', fontWeight: '700' }}>Data kosong.</Text>
      </View>
    );
  }

  return entries.map(([key, value]) => {
    if (Array.isArray(value) && (key === 'obat_herbal_list' || key === 'obat_jantung_list')) {
      return (
        <View key={key} style={{ marginBottom: 10 }}>
          {renderListSection(key, value)}
        </View>
      );
    }

    if (Array.isArray(value)) {
      return (
        <View key={key} style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 10 }}>
          <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }}>
            {prettyLabel(key)}
          </Text>
          <Text style={{ color: '#1A2820', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
            {value.length ? value.map((item) => formatValue(item)).join(', ') : '-'}
          </Text>
        </View>
      );
    }

    if (value && typeof value === 'object') {
      return (
        <View key={key} style={{ marginBottom: 10 }}>
          <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }}>
            {prettyLabel(key)}
          </Text>
          {renderObjectRows(value)}
        </View>
      );
    }

    return (
      <View key={key} style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 10 }}>
        <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }}>
          {prettyLabel(key)}
        </Text>
        <Text style={{ color: '#1A2820', fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
          {isDiagnosisField(key) ? formatDateDDMMYYYY(value) : formatValue(value)}
        </Text>
      </View>
    );
  });
};

const renderSection = (title, data) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ color: '#1A2820', fontSize: 16, fontWeight: '900', marginBottom: 10 }}>{title}</Text>
    {renderObjectRows(data)}
  </View>
);

export default function QuestionnaireListScreen() {
  const [loading, setLoading] = useState(true);
  const [rekaps, setRekaps] = useState([]);
  const [selectedRekap, setSelectedRekap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const jawabanData = await fetchApotekerKuisionerRekaps();
      setRekaps(Array.isArray(jawabanData) ? jawabanData : []);
    } catch (error) {
      console.error('[QuestionnaireListScreen] loadData failed:', error);
      setRekaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const uniquePatients = new Set(rekaps.map((item) => item?.pasien_id).filter(Boolean)).size;
    const latestDate = rekaps.length > 0 ? rekaps[0].tanggal : null;
    return {
      total: rekaps.length,
      patients: uniquePatients,
      latestDate,
    };
  }, [rekaps]);

  const filteredRekaps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rekaps;
    return rekaps.filter((rekap) => {
      const name = String(rekap.pasien?.nama || rekap.pasien?.nama_lengkap || '').toLowerCase();
      return name.includes(query);
    });
  }, [rekaps, searchQuery]);

  const renderHeader = () => (
    <View style={{ backgroundColor: '#FFFFFF', paddingTop: 64, paddingBottom: 20, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
      <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A2820', letterSpacing: -0.6 }}>Menu Kuisioner</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>Langsung dari tabel rekap_kuisioner</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 18 }}>
        <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Total: {summary.total}</Text>
        </View>
        <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Pasien: {summary.patients}</Text>
        </View>
        <View style={{ backgroundColor: '#F8FAFA', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748B' }}>Terbaru: {formatDate(summary.latestDate)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EEF0EF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 }}>
        <Search color="#9DB0AA" size={18} />
        <TextInput
          style={{ flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#1A2820' }}
          placeholder="Cari nama pasien..."
          placeholderTextColor="#9DB0AA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <X color="#94A3B8" size={16} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const renderRekapList = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <ClipboardList color="#0D7A6A" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1A2820' }}>Rekap Kuisioner</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#9DB0AA', marginTop: 2 }}>Data pasien, tanggal, dan isi tiga tahap rekap</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ActivityIndicator size="large" color="#0D7A6A" />
          <Text style={{ marginTop: 12, color: '#9DB0AA', fontWeight: '700' }}>Memuat rekap kuisioner...</Text>
        </View>
      ) : filteredRekaps.length > 0 ? (
        filteredRekaps.map((rekap) => (
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
                  <Text style={{ color: '#1A2820', fontSize: 16, fontWeight: '900' }}>
                    {rekap.pasien?.nama || rekap.pasien?.nama_lengkap || 'Pasien'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Clock3 color="#9DB0AA" size={14} />
                    <Text style={{ color: '#9DB0AA', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>{formatDate(rekap.tanggal)}</Text>
                  </View>
                </View>
              </View>
              <View style={{ backgroundColor: '#E8F8F3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: '#0D7A6A', fontWeight: '900', fontSize: 12 }}>Detail</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: '#EEF2FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text style={{ color: '#4338CA', fontWeight: '800', fontSize: 12 }}>Usia: {rekap.pasien?.usia ?? '-'}</Text>
              </View>
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 }}>
                <Text style={{ color: '#64748B', fontWeight: '800', fontSize: 12 }}>Tahap 1 / 2 / 3</Text>
              </View>
            </View>

            <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 12 }}>
              Ketuk untuk melihat detail semua field rekap kuisioner
            </Text>
          </Pressable>
        ))
      ) : (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
          <ClipboardList color="#CBD5E1" size={56} />
          <Text style={{ color: '#9DB0AA', fontSize: 16, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
            {searchQuery ? 'Data pasien tidak ditemukan.' : 'Belum ada data rekap kuisioner.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDetailModal = () => {
    if (!selectedRekap) return null;

    return (
      <Modal
        visible={selectedRekap !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRekap(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(26,40,32,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '88%' }}>
            <View style={{ padding: 20, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: '#1A2820', fontSize: 18, fontWeight: '900' }}>
                  {selectedRekap.pasien?.nama || selectedRekap.pasien?.nama_lengkap || 'Pasien'}
                </Text>
                <Text style={{ color: '#9DB0AA', fontSize: 12, fontWeight: '700', marginTop: 4 }}>{formatDate(selectedRekap.tanggal)}</Text>
              </View>
              <Pressable onPress={() => setSelectedRekap(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F6F5', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#64748B', fontSize: 18, fontWeight: '900' }}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
              <View style={{ backgroundColor: '#F8FAFA', borderRadius: 20, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>Ringkasan</Text>
                <Text style={{ color: '#0D7A6A', fontSize: 16, fontWeight: '900', marginTop: 8 }}>
                  Rekap kuisioner pasien
                </Text>
                <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                  Data diambil langsung dari tabel rekap_kuisioner
                </Text>
              </View>

              {renderSection('Tahap 1 - Identitas Pasien', selectedRekap.tahap_1_identitas)}
              {renderSection('Tahap 2 - Riwayat', selectedRekap.tahap_2_riwayat)}
              {renderSection('Tahap 3 - Efek Samping', selectedRekap.tahap_3_efek_samping)}
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
      {renderRekapList()}
      {renderDetailModal()}
    </View>
  );
}
