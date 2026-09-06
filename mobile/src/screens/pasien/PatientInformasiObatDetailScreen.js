import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Pill, CircleHelp, BadgeInfo, Sparkles,
  ShieldAlert, AlertTriangle, Clock3, Activity,
} from 'lucide-react-native';

const normalizeDoseLine = (value) => String(value || '').replace(/\s*mg\s*$/i, '').trim();

const parseDoseLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDoseLine(item)).filter(Boolean);
  }
  return String(value || '')
    .split(/\n|,|;/)
    .map((item) => normalizeDoseLine(item))
    .filter(Boolean);
};

const toDoseText = (value) => {
  const doses = parseDoseLines(value);
  if (doses.length === 0) return '-';
  if (doses.length === 1) return `${doses[0]} mg`;
  return `${doses[0]} mg - ${doses[doses.length - 1]} mg`;
};

const formatMerkList = (merks) => {
  if (!Array.isArray(merks) || merks.length === 0) return 'Tidak ada merek terdaftar';
  return merks.map((item) => item?.nama_merk).filter(Boolean).join(', ');
};

const InfoRow = ({ label, sublabel, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
    <View style={{ flex: 1, paddingRight: 10 }}>
      <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700' }}>{label}</Text>
      {Boolean(sublabel) && (
        <Text style={{ color: '#94A3B8', fontSize: 10.5, marginTop: 2, lineHeight: 14, fontWeight: '500' }}>
          ({sublabel})
        </Text>
      )}
    </View>
    <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '600', textAlign: 'right' }}>{value || '-'}</Text>
  </View>
);

export default function PatientInformasiObatDetailScreen({ obat, onBack }) {
  const dosisInisiasiText = useMemo(() => toDoseText(obat?.dosis_inisiasi), [obat]);
  const dosisTargetText = useMemo(() => toDoseText(obat?.dosis_target), [obat]);
  const merkText = useMemo(() => formatMerkList(obat?.merks), [obat]);

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
                Detail Obat
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
                {obat?.nama_obat || '-'}
              </Text>
            </View>
          </View>

          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff25', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff40' }}>
            <Pill color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Ringkasan Obat */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, shadowColor: '#0D9488', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8, marginTop: -8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles color="#0D9488" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>{obat?.nama_obat || '-'}</Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Informasi lengkap obat</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 }}>
            {obat?.klasifikasi ? <InfoRow label="Klasifikasi" value={obat.klasifikasi} /> : null}
            <InfoRow
              label="Dosis Inisiasi"
              sublabel="takaran obat pd awal pengobatan"
              value={dosisInisiasiText}
            />
            <InfoRow
              label="Dosis Target"
              sublabel="takaran obat yg mencapai manfaat optimal"
              value={dosisTargetText}
            />
            {obat?.dosis_lazim ? <InfoRow label="Dosis Lazim" value={obat.dosis_lazim} /> : null}
            <InfoRow label="Frekuensi" value={obat?.frekuensi_keterangan || (obat?.frekuensi_default ? `${obat.frekuensi_default}x / hari` : '-')} />
            <InfoRow label="Merek Dagang" value={merkText} />
          </View>
        </View>

        {/* Indikasi */}
        {Boolean(obat?.indikasi) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                <BadgeInfo color="#2563EB" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Indikasi</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>
              {obat.indikasi}
            </Text>
          </View>
        )}

        {/* Cara Pemakaian / Penggunaan */}
        {Boolean(obat?.cara_pemakaian) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#CCFBF1' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center' }}>
                <Clock3 color="#0D9488" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Cara Penggunaan</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>
              {obat.cara_pemakaian}
            </Text>
          </View>
        )}

        {/* Kontraindikasi */}
        {Boolean(obat?.kontraindikasi) && (
          <View style={{ backgroundColor: '#FFF5F5', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1.5, borderColor: '#FECDD3' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert color="#DC2626" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#991B1B', fontWeight: '900', fontSize: 16 }}>Kontraindikasi</Text>
                <Text style={{ color: '#B91C1C', fontSize: 11, fontWeight: '600' }}>Kondisi yang dilarang mengonsumsi obat ini</Text>
              </View>
            </View>
            <Text style={{ color: '#7F1D1D', lineHeight: 22, fontSize: 13.5, fontWeight: '500' }}>
              {obat.kontraindikasi}
            </Text>
          </View>
        )}

        {/* Efek Samping & Cara Penanganan */}
        {Boolean(obat?.efek_samping) && (
          <View style={{ backgroundColor: '#FFFBEB', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1.5, borderColor: '#FDE68A' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle color="#D97706" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#92400E', fontWeight: '900', fontSize: 16 }}>Efek Samping & Penanganan</Text>
                <Text style={{ color: '#B45309', fontSize: 11, fontWeight: '600' }}>Gejala umum & tindakan yang perlu dilakukan</Text>
              </View>
            </View>
            <Text style={{ color: '#78350F', lineHeight: 22, fontSize: 13.5, fontWeight: '500' }}>
              {obat.efek_samping}
            </Text>
          </View>
        )}

        {/* Monitoring */}
        {Boolean(obat?.monitoring) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#E0E7FF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                <Activity color="#4F46E5" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Monitoring & Pemeriksaan</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>
              {obat.monitoring}
            </Text>
          </View>
        )}

        {/* Catatan Edukasi */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
              <CircleHelp color="#16A34A" size={18} />
            </View>
            <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Catatan Penting</Text>
          </View>
          <Text style={{ color: '#64748B', lineHeight: 22, fontSize: 13 }}>
            Informasi ini dirangkum berdasarkan panduan medis dan data obat resmi. Selalu konsultasikan dengan dokter atau apoteker Anda sebelum mengubah dosis atau jadwal konsumsi obat.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
