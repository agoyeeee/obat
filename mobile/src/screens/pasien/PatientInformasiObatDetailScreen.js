import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Pill,
  CircleHelp,
  BadgeInfo,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Clock3,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';

const CONTRA_FALLBACKS = {
  carvedilol:
    'Asma bronkial, alergi terhadap obat carvedilol, Blok jantung (AV block) derajat dua atau tiga tanpa pacu jantung, sick sinus syndrome, Hipotensi berat, Gagal jantung kongestif berat yang tidak stabil atau membutuhkan inotropik intravena.',
  bisoprolol:
    'Denyut jantung lambat di bawah 50 kali per menit, tekanan darah sangat rendah atau hipotensi, syok kardiogenik, gagal jantung akut, asma berat, serta blok jantung derajat dua atau tiga.',
  metoprolol:
    'Kondisi denyut jantung sangat lambat (bradikardia berat), syok kardiogenik, gagal jantung tak terkontrol, serta gangguan konduksi jantung seperti blok jantung derajat tinggi.',
  nebivolol:
    'Hipersensitivitas terhadap nebivolol, Bradikardia berat, Riwayat bronkospasme atau asma bronkial, Hipotensi berat.',
};

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

const cleanKontraindikasi = (raw, drugName = '') => {
  let text = String(raw || '').replace(/^Kontraindikasi\s*:\s*/i, '').trim();
  if (!text) {
    const key = String(drugName || '').toLowerCase().trim();
    text = CONTRA_FALLBACKS[key] || '';
  }
  return text || null;
};

const cleanDosisLazim = (text) => {
  if (!text) return null;
  const str = String(text).trim();
  if (/DOCX|Sumber rincian|Dosis Inisiasi|Dosis Target|Tabel 4\.3/i.test(str)) {
    return null;
  }
  return str;
};

const cleanGolongan = (raw) => {
  if (!raw) return null;
  const str = String(raw).trim();
  if (/converting enzim|ace\s*inhibitor|ace-inhibitor|acei\b/i.test(str)) {
    return 'Penghambat Enzim Pengubah Angiotensin';
  }
  if (/reseptor block|arb\b/i.test(str)) {
    return 'Penyekat Reseptor Angiotensin';
  }
  if (/nephrysillin|arni\b/i.test(str)) {
    return 'Penghambat Nephrysillin di Reseptor Angiotensin';
  }
  return str;
};

const cleanDegree = (deg) => {
  const degreeStr = String(deg?.degree || '').trim();
  const caraStr = String(deg?.cara || '').trim();

  const degMatch = degreeStr.match(/^(Derajat\s*(?:I{1,3}|IV|V|\d+))/i);
  let label = degMatch ? degMatch[1].replace(/derajat\s*/i, 'Derajat ') : 'Tingkat Gejala';
  let detail = degreeStr;
  if (degMatch) {
    detail = degreeStr.slice(degMatch[0].length).replace(/^[\s:]+/, '').trim();
  }

  label = label
    .replace(/Derajat I\b/, 'Derajat 1')
    .replace(/Derajat II\b/, 'Derajat 2')
    .replace(/Derajat III\b/, 'Derajat 3')
    .replace(/Derajat IV\b/, 'Derajat 4');

  let severity = 'mild';
  if (/derajat\s*[34]|rujuk|darurat|berat/i.test(label) || /rujuk|rumah sakit|igd/i.test(caraStr)) {
    severity = 'severe';
  } else if (/derajat\s*2|sedang/i.test(label)) {
    severity = 'moderate';
  }

  return { label, detail, cara: caraStr, severity };
};

const parseEfekSampingData = (text) => {
  if (!text || typeof text !== 'string') {
    return { summary: '', chips: [], items: [] };
  }

  const trimmed = text.trim();
  let summary = '';
  const items = [];

  // 1. Raw docx scraper dump format
  if (trimmed.includes('Ringkasan efek samping dari DOCX:') || trimmed.includes('Baris tabel')) {
    const sumMatch = trimmed.match(/Ringkasan efek samping dari DOCX:\s*([\s\S]*?)(?=Header tabel sumber|$)/i);
    if (sumMatch) {
      summary = sumMatch[1].trim();
    }

    const blockRegex =
      /Baris tabel\s*(\d+)\s*\|\s*No sumber:\s*([^\n\r]*)\r?\nJenis efek samping\/derajat:\s*([\s\S]*?)\r?\nCara penanganan:\s*([\s\S]*?)(?=(?:Baris tabel\s*\d+|$))/gi;
    let match;
    let currentGroup = null;

    while ((match = blockRegex.exec(trimmed)) !== null) {
      const noSumber = (match[2] || '').trim();
      let jenis = (match[3] || '').trim().replace(/\r?\n/g, ' ');
      let cara = (match[4] || '').trim().replace(/\r?\n/g, ' ');

      const isMain = noSumber && noSumber !== '(kosong pada sumber)';
      const isDegree = /^(?:Derajat|Tingkat|\d+[\.\)])/i.test(jenis);

      if (isMain || (!isDegree && !currentGroup)) {
        const titleParts = jenis.split(/:(.+)/);
        const title = titleParts[0].trim();
        const desc = titleParts[1] ? titleParts[1].trim() : '';

        const isDuplicateCara =
          !cara ||
          cara.toLowerCase() === jenis.toLowerCase() ||
          cara.toLowerCase() === desc.toLowerCase() ||
          cara.toLowerCase() === title.toLowerCase();

        currentGroup = {
          no: items.length + 1,
          title: title,
          desc: desc,
          directCara: isDuplicateCara ? '' : cara,
          degrees: [],
        };
        items.push(currentGroup);
      } else if (currentGroup) {
        if (jenis.toLowerCase().includes('derajat 5')) {
          continue; // Skip degree 5 (kematian)
        }
        currentGroup.degrees.push({
          degree: jenis,
          cara: cara && cara.toLowerCase() !== jenis.toLowerCase() ? cara : '',
        });
      }
    }
  } else if (trimmed.includes('Cara Penanganan Efek Samping:')) {
    // 2. Clean formatted text
    const parts = trimmed.split('Cara Penanganan Efek Samping:');
    summary = (parts[0] || '').trim();
    const penangananText = (parts[1] || '').trim();

    const sectionRegex = /(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=(?:\n\s*\d+\.\s+|$))/g;
    let match;
    while ((match = sectionRegex.exec(penangananText)) !== null) {
      const fullSection = match[2].trim();
      const lines = fullSection.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const firstLine = lines[0];
      const titleParts = firstLine.split(/:(.+)/);
      const title = titleParts[0].trim();
      const desc = titleParts[1] ? titleParts[1].trim() : '';

      const degrees = [];
      let directCara = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('•') || line.startsWith('-')) {
          const cleanLine = line.replace(/^[•\-]\s*/, '');
          const degParts = cleanLine.split(/:\s*(.+)/);
          degrees.push({
            degree: degParts[0].trim(),
            cara: degParts[1] ? degParts[1].trim() : '',
          });
        } else if (line.toLowerCase().startsWith('penanganan:')) {
          directCara = line.replace(/^penanganan:\s*/i, '').trim();
        }
      }

      items.push({
        no: items.length + 1,
        title,
        desc,
        directCara,
        degrees,
      });
    }
  } else {
    // 3. Simple text or paragraph
    summary = trimmed;
  }

  let chips = [];
  if (summary) {
    chips = summary
      .split(/[,;\n]/)
      .map((c) => c.replace(/\bseperti\b.*$/i, '').trim())
      .filter((c) => c.length > 2 && c.length < 35 && !c.includes('DOCX'))
      .slice(0, 8);
  }

  return { summary, chips, items };
};

const cleanDoseTarget = (value) => {
  if (!value) return '-';
  const str = String(value).trim();
  const cleaned = str
    .replace(/\)\s*mg$/i, ')')
    .replace(/\s*mg\s*mg$/i, ' mg')
    .trim();
  const doseMatch = cleaned.match(/^([\d.,\s\-]+(?:mg)?)/i);
  const tabMatch = cleaned.match(/(\d+\s*tablet)/i);
  if (doseMatch && tabMatch) {
    let d = doseMatch[1].trim();
    if (!/mg$/i.test(d)) d += ' mg';
    return `${d} (${tabMatch[1]})`;
  }
  if (!/mg$/i.test(cleaned) && !isNaN(Number(cleaned))) {
    return `${cleaned} mg`;
  }
  return cleaned;
};

const InfoRow = ({ label, sublabel, value, children }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    }}
  >
    <View style={{ width: '40%', paddingRight: 10 }}>
      <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700' }}>{label}</Text>
      {Boolean(sublabel) && (
        <Text style={{ color: '#94A3B8', fontSize: 10.5, marginTop: 2, lineHeight: 14, fontWeight: '500' }}>
          ({sublabel})
        </Text>
      )}
    </View>
    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
      {children ? (
        children
      ) : (
        <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '600', textAlign: 'right' }}>
          {value || '-'}
        </Text>
      )}
    </View>
  </View>
);

export default function PatientInformasiObatDetailScreen({ obat, onBack }) {
  const dosisInisiasiText = useMemo(() => toDoseText(obat?.dosis_inisiasi), [obat]);
  const dosisTargetText = useMemo(() => cleanDoseTarget(obat?.dosis_target), [obat]);
  const dosisLazimText = useMemo(() => cleanDosisLazim(obat?.dosis_lazim), [obat]);
  const merkText = useMemo(() => formatMerkList(obat?.merks), [obat]);

  const kontraindikasiText = useMemo(
    () => cleanKontraindikasi(obat?.kontraindikasi, obat?.nama_obat),
    [obat]
  );

  const contraPoints = useMemo(() => {
    if (!kontraindikasiText) return [];
    return kontraindikasiText
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2);
  }, [kontraindikasiText]);

  const { summary: efekSampingSummary, chips: efekSampingChips, items: symptomItems } = useMemo(
    () => parseEfekSampingData(obat?.efek_samping),
    [obat]
  );

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
              <Text
                style={{
                  color: '#D1FAE5',
                  fontSize: 10,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                Detail Obat
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
                {obat?.nama_obat || '-'}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#ffffff25',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#ffffff40',
            }}
          >
            <Pill color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Ringkasan Obat */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 18,
            shadowColor: '#0D9488',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 18,
            elevation: 8,
            marginTop: -8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: '#ECFDF5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles color="#0D9488" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>{obat?.nama_obat || '-'}</Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Informasi lengkap obat</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 }}>
            {obat?.klasifikasi ? <InfoRow label="Golongan" value={cleanGolongan(obat.klasifikasi)} /> : null}
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
            {dosisLazimText ? <InfoRow label="Sediaan" value={dosisLazimText} /> : null}
            <InfoRow
              label="Frekuensi"
              value={
                obat?.frekuensi_keterangan ||
                (obat?.frekuensi_default ? `${obat.frekuensi_default}x / hari` : '-')
              }
            />
            <InfoRow label="Merek Dagang">
              {obat?.merks && obat.merks.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}>
                  {obat.merks.map((item, idx) => {
                    const brandName = item?.nama_merk || String(item || '');
                    if (!brandName) return null;
                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: '#F1F5F9',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#E2E8F0',
                        }}
                      >
                        <Text style={{ color: '#334155', fontSize: 12, fontWeight: '600' }}>
                          {brandName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>
                  Tidak ada merek terdaftar
                </Text>
              )}
            </InfoRow>
          </View>
        </View>

        {/* Indikasi */}
        {Boolean(obat?.indikasi) && (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 18,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BadgeInfo color="#2563EB" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Indikasi</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>{obat.indikasi}</Text>
          </View>
        )}

        {/* Cara Pemakaian / Penggunaan */}
        {Boolean(obat?.cara_pemakaian) && (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 18,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#CCFBF1',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  backgroundColor: '#F0FDFA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock3 color="#0D9488" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Cara Penggunaan</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>{obat.cara_pemakaian}</Text>
          </View>
        )}

        {/* Kontraindikasi (Dibersihkan dari prefix mentah) */}
        {Boolean(kontraindikasiText) && (
          <View
            style={{
              backgroundColor: '#FFF5F5',
              borderRadius: 24,
              padding: 18,
              marginTop: 16,
              borderWidth: 1.5,
              borderColor: '#FECDD3',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  backgroundColor: '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldAlert color="#DC2626" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#991B1B', fontWeight: '900', fontSize: 16 }}>Kontraindikasi</Text>
                <Text style={{ color: '#B91C1C', fontSize: 11, fontWeight: '600' }}>
                  Kondisi yang dilarang mengonsumsi obat ini
                </Text>
              </View>
            </View>

            {contraPoints.length > 1 ? (
              <View style={{ gap: 8 }}>
                {contraPoints.map((point, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#DC2626',
                        marginTop: 7,
                      }}
                    />
                    <Text style={{ flex: 1, color: '#7F1D1D', lineHeight: 20, fontSize: 13.5, fontWeight: '500' }}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#7F1D1D', lineHeight: 22, fontSize: 13.5, fontWeight: '500' }}>
                {kontraindikasiText}
              </Text>
            )}
          </View>
        )}

        {/* Efek Samping & Cara Penanganan (Tersusun Rapi & Informatif) */}
        {(Boolean(efekSampingSummary) || symptomItems.length > 0) && (
          <View
            style={{
              backgroundColor: '#FFFBEB',
              borderRadius: 24,
              padding: 18,
              marginTop: 16,
              borderWidth: 1.5,
              borderColor: '#FDE68A',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle color="#D97706" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#92400E', fontWeight: '900', fontSize: 16 }}>
                  Efek Samping & Penanganan
                </Text>
                <Text style={{ color: '#B45309', fontSize: 11, fontWeight: '600' }}>
                  Gejala umum & tindakan yang perlu dilakukan
                </Text>
              </View>
            </View>

            {/* Gejala Umum Tags */}
            {efekSampingChips.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#78350F', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
                  Gejala Umum yang Mungkin Terjadi:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {efekSampingChips.map((chip, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: '#FEF3C7',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                      }}
                    >
                      <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '600' }}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ringkasan Paragraf */}
            {Boolean(efekSampingSummary) && (
              <Text
                style={{
                  color: '#78350F',
                  lineHeight: 21,
                  fontSize: 13.5,
                  fontWeight: '500',
                  marginBottom: symptomItems.length > 0 ? 16 : 0,
                }}
              >
                {efekSampingSummary}
              </Text>
            )}

            {/* Panduan Rinci per Gejala */}
            {symptomItems.length > 0 && (
              <View style={{ gap: 14 }}>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#FDE68A',
                    marginVertical: 4,
                  }}
                />
                <Text style={{ color: '#92400E', fontSize: 13.5, fontWeight: '800' }}>
                  Panduan Penanganan per Gejala:
                </Text>

                {symptomItems.map((item) => (
                  <View
                    key={item.no}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 18,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    {/* Header Gejala */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: '#0D9488',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>{item.no}</Text>
                      </View>
                      <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '800', flex: 1 }}>
                        {item.title}
                      </Text>
                    </View>

                    {/* Deskripsi Gejala */}
                    {Boolean(item.desc) && (
                      <Text
                        style={{
                          color: '#64748B',
                          fontSize: 12.5,
                          lineHeight: 18,
                          marginBottom: item.degrees.length > 0 || item.directCara ? 10 : 0,
                        }}
                      >
                        {item.desc}
                      </Text>
                    )}

                    {/* Direct Cara (Jika tanpa derajat) */}
                    {Boolean(item.directCara) && (
                      <View
                        style={{
                          backgroundColor: '#F0FDFA',
                          borderRadius: 12,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: '#CCFBF1',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <CheckCircle2 color="#0D9488" size={16} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#0F766E', fontSize: 11, fontWeight: '700' }}>TINDAKAN</Text>
                          <Text style={{ color: '#134E4A', fontSize: 12.5, lineHeight: 18, marginTop: 2 }}>
                            {item.directCara}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Derajat Tingkat Gejala */}
                    {item.degrees.length > 0 && (
                      <View style={{ gap: 8, marginTop: item.desc ? 4 : 8 }}>
                        {item.degrees.map((deg, dIdx) => {
                          const cleaned = cleanDegree(deg);
                          const isSevere = cleaned.severity === 'severe';
                          const isModerate = cleaned.severity === 'moderate';

                          const cardBg = isSevere ? '#FFF1F2' : isModerate ? '#FFFBEB' : '#F0FDF4';
                          const cardBorder = isSevere ? '#FECDD3' : isModerate ? '#FDE68A' : '#BBF7D0';
                          const badgeBg = isSevere ? '#FFE4E6' : isModerate ? '#FEF3C7' : '#DCFCE7';
                          const badgeText = isSevere ? '#BE123C' : isModerate ? '#B45309' : '#15803D';
                          const textColor = isSevere ? '#881337' : isModerate ? '#78350F' : '#14532D';

                          return (
                            <View
                              key={dIdx}
                              style={{
                                backgroundColor: cardBg,
                                borderRadius: 12,
                                padding: 10,
                                borderWidth: 1,
                                borderColor: cardBorder,
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <View
                                  style={{
                                    backgroundColor: badgeBg,
                                    paddingHorizontal: 7,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                  }}
                                >
                                  <Text style={{ color: badgeText, fontSize: 10.5, fontWeight: '800' }}>
                                    {cleaned.label}
                                    {isSevere ? ' (Perlu Rujukan)' : isModerate ? ' (Sedang)' : ' (Ringan)'}
                                  </Text>
                                </View>
                              </View>

                              {Boolean(cleaned.detail) && (
                                <Text style={{ color: textColor, fontSize: 12, lineHeight: 17, marginBottom: cleaned.cara ? 6 : 0 }}>
                                  {cleaned.detail}
                                </Text>
                              )}

                              {Boolean(cleaned.cara) && (
                                <View
                                  style={{
                                    backgroundColor: '#ffffff80',
                                    borderRadius: 8,
                                    paddingHorizontal: 8,
                                    paddingVertical: 6,
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    gap: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: isSevere ? '#BE123C' : '#0D9488',
                                      fontSize: 11,
                                      fontWeight: '700',
                                    }}
                                  >
                                    Tindakan:
                                  </Text>
                                  <Text style={{ flex: 1, color: textColor, fontSize: 11.5, lineHeight: 16 }}>
                                    {cleaned.cara}
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Peringatan Darurat */}
            <View
              style={{
                marginTop: 14,
                backgroundColor: '#FEF2F2',
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FCA5A5',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <AlertCircle color="#DC2626" size={18} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, color: '#991B1B', fontSize: 11.5, lineHeight: 17 }}>
                <Text style={{ fontWeight: '800' }}>Peringatan Medis: </Text>
                Jika Anda mengalami gejala berat seperti sesak napas akut, nyeri dada mendadak, pusing parah hingga pingsan, segera cari pertolongan medis ke IGD / Rumah Sakit terdekat.
              </Text>
            </View>
          </View>
        )}

        {/* Monitoring */}
        {Boolean(obat?.monitoring) && (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 18,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#E0E7FF',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  backgroundColor: '#EEF2FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity color="#4F46E5" size={18} />
              </View>
              <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 16 }}>Monitoring & Pemeriksaan</Text>
            </View>
            <Text style={{ color: '#475569', lineHeight: 22, fontSize: 14 }}>{obat.monitoring}</Text>
          </View>
        )}

        {/* Catatan Edukasi */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            padding: 18,
            marginTop: 16,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                backgroundColor: '#F0FDF4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
