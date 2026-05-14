import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Info, Plus, X, ClipboardList } from 'lucide-react-native';
import { submitKuisionerAnswers } from '../../services/patientService';
import { getPatientProfile } from '../../storage/patientStorage';

const TAHAP_1_FIELDS = {
  nama: { label: 'Nama', type: 'text', required: true, readonly: true },
  jenis_kelamin: { label: 'Jenis Kelamin', type: 'text', required: true, readonly: true },
  tanggal_lahir: { label: 'Tanggal Lahir', type: 'date', required: true },
  usia: { label: 'Usia', type: 'number', required: true, readonly: true },
  status: { label: 'Status Pernikahan', type: 'select', required: true, options: ['Belum menikah', 'Menikah', 'Pernah menikah'] },
  suku: { label: 'Suku', type: 'text', required: true },
  pendidikan: { label: 'Pendidikan Terakhir', type: 'select', required: true, options: ['Tidak sekolah', 'SMP', 'S1', 'Tidak tamat SD', 'SMA', 'S2', 'SD', 'D3', 'S3'] },
  pekerjaan: { label: 'Pekerjaan', type: 'select', required: true, options: ['Pelajar / mahasiswa', 'Bekerja: PNS / Karyawan BUMN / Swasta / Wirausaha', 'Ibu rumah tangga / pensiunan', 'Lain-lain'] },
  nomor_hp: { label: 'Nomor HP', type: 'text', required: true },
  pendapatan: { label: 'Pendapatan', type: 'select', required: true, options: ['<1.000.000', '1.000.000 – 5.000.000', '>5.000.000'] },
};

const TAHAP_2_FIELDS = {
  diagnosis: { label: 'Diagnosis Gagal Jantung', type: 'text', required: true, readonly: true },
  penyakit_penyerta: { label: 'Penyakit Penyerta', type: 'select', required: true, options: ['Tidak', 'Ya'], subfield: 'alasan_penyakit' },
  herbal: { label: 'Menggunakan Obat Herbal', type: 'select', required: true, options: ['Tidak', 'Ya'], subfield: 'detail_herbal' },
  obat_jantung: { label: 'Obat Gagal Jantung yang Digunakan', type: 'repeat', fields: ['nama_obat', 'dosis', 'frekuensi', 'keterangan'] },
  obat_lain: { label: 'Ada Obat Lain yang Digunakan', type: 'select', required: true, options: ['Tidak', 'Ya'], subfield: 'detail_obat_lain' },
};

const TAHAP_3_FIELDS = {
  pelaporan: { label: 'Pelaporan Efek Samping', type: 'select', required: true, options: ['Dokter', 'Perawat', 'Apoteker', 'Lainnya'], subfield: 'pelaporan_lainnya' },
  efek_samping: { label: 'Efek Samping yang Dirasakan', type: 'checkbox', required: true, options: ['Batuk', 'Pusing', 'Bradikardia', 'Hipotensi', 'Hiperkalemia', 'Gangguan ginjal', 'Gejala lainnya'] },
  tindakan: { label: 'Tindakan yang Dilakukan', type: 'select', required: true, options: ['Membiarkan', 'Mengobati', 'Melaporkan kepada tenaga kesehatan', 'Pergi ke dokter', 'Lainnya'], subfield: 'tindakan_lainnya' },
};

const EFFECT_INFO = {
  Hiperkalemia: 'Hiperkalemia adalah kondisi kadar kalium dalam darah terlalu tinggi. Pada pasien jantung, ini bisa berbahaya karena dapat memengaruhi irama jantung.',
  'Gangguan ginjal': 'Gangguan ginjal adalah kondisi saat fungsi ginjal menurun sehingga ginjal tidak dapat menyaring darah dan membuang sisa zat dengan baik.',
};

const TAHAP_LABELS = ['Identitas Pasien', 'Riwayat Penyakit', 'Efek Samping', 'Kepatuhan Pengobatan', 'Efikasi Diri', 'Kualitas Hidup', 'Validasi KCCQ'];

const KEPATUHAN_QUESTIONS = [
  'Saya lupa minum obat',
  'Saya mengubah dosis minum obat?',
  'Saya berhenti meminum obat sementara',
  'Saya memutuskan untuk minum obat dengan dosis lebih kecil',
  'Saya minum obat kurang dari petunjuk sebenarnya',
];

const SCALE_OPTIONS = ['Selalu', 'Sering', 'Kadang-kadang', 'Jarang', 'Tidak pernah'];

const SCALE_MAP = {
  'Selalu': 1,
  'Sering': 2,
  'Kadang-kadang': 3,
  'Kadang kadang': 3,
  'Jarang': 4,
  'Tidak pernah': 5,
};

const EFIKASI_QUESTIONS = [
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda minum beberapa jenis obat yang berbeda setiap hari?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda menghadapi hari yang sibuk (banyak kegiatan/aktivitas)?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda tidak berada di rumah?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika tidak ada orang yang mengingatkan Anda untuk minum obat?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda minum obat lebih dari satu kali sehari?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika jadwal minum obat Anda tidak cocok bagi Anda?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika rutinitas normal Anda terganggu?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda menebus ulang obat Anda dan beberapa obat terlihat berbeda dari yang biasanya?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda tidak yakin bagaimana cara minum obatnya?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda tidak yakin jam berapa Anda harus minum obat?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika dokter mengganti obat Anda?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika obat menyebabkan beberapa efek samping?',
  'Seberapa yakin Anda dapat minum obat dengan benar ketika Anda juga sedang merasa sakit yang lain, seperti sakit pilek atau flu?',
];

const EFIKASI_SCALE = ['Tidak yakin', 'Agak yakin', 'Sangat yakin'];

const EFIKASI_MAP = {
  'Tidak yakin': 1,
  'Agak yakin': 2,
  'Sangat yakin': 3,
};



const QUALITY_OF_LIFE_QUESTIONS = [
  {
    key: 'berjalan',
    question: 'Kemampuan Berjalan',
    options: [
      { label: 'Tidak Kesulitan', value: 1 },
      { label: 'Sedikit Kesulitan', value: 2 },
      { label: 'Cukup Kesulitan', value: 3 },
      { label: 'Sangat Kesulitan', value: 4 },
      { label: 'Tidak Bisa', value: 5 },
    ],
  },
  {
    key: 'perawatan_diri',
    question: 'Perawatan Diri',
    options: [
      { label: 'Tidak Kesulitan', value: 1 },
      { label: 'Sedikit Kesulitan', value: 2 },
      { label: 'Cukup Kesulitan', value: 3 },
      { label: 'Sangat Kesulitan', value: 4 },
      { label: 'Tidak Bisa', value: 5 },
    ],
  },
  {
    key: 'kegiatan_biasa',
    question: 'Kegiatan yang Biasa Dilakukan',
    options: [
      { label: 'Tidak Kesulitan', value: 1 },
      { label: 'Sedikit Kesulitan', value: 2 },
      { label: 'Cukup Kesulitan', value: 3 },
      { label: 'Sangat Kesulitan', value: 4 },
      { label: 'Tidak Bisa', value: 5 },
    ],
  },
  {
    key: 'nyeri_tidak_nyaman',
    question: 'Rasa Nyeri/Tidak Nyaman',
    options: [
      { label: 'Tidak Kesulitan', value: 1 },
      { label: 'Sedikit Kesulitan', value: 2 },
      { label: 'Cukup Kesulitan', value: 3 },
      { label: 'Sangat Kesulitan', value: 4 },
      { label: 'Tidak Bisa', value: 5 },
    ],
  },
  {
    key: 'cemas_depresi',
    question: 'Rasa Cemas/Depresi (Sedih)',
    options: [
      { label: 'Tidak Kesulitan', value: 1 },
      { label: 'Sedikit Kesulitan', value: 2 },
      { label: 'Cukup Kesulitan', value: 3 },
      { label: 'Sangat Kesulitan', value: 4 },
      { label: 'Tidak Bisa', value: 5 },
    ],
  },
];

const RULER_QUESTION = {
  key: 'skala_kesehatan',
  label: 'Skala Kesehatan Keseluruhan',
  helper: 'Geser/pilih nilai 0 (sangat buruk) sampai 100 (sangat baik).',
};

const KCCQ_QUESTIONS = [
  {
    key: 'q1_activities',
    question: 'Seberapa gagal jantung membatasi aktivitas Anda (2 minggu terakhir)?',
    subitems: [
      { key: 'berpakaian', label: 'Berpakaian' },
      { key: 'mandi', label: 'Mandi' },
      { key: 'jalan_80m', label: 'Jalan 80 meter datar' },
      { key: 'berkebun', label: 'Berkebun, tugas rumah tangga, berbelanja' },
      { key: 'naik_tangga', label: 'Naik tangga tanpa berhenti' },
      { key: 'jalan_cepat', label: 'Jalan cepat (seperti mengejar bus)' },
    ],
    options: [
      'Sangat Terbatas',
      'Agak Terbatas',
      'Tidak Terlalu Terbatas',
      'Sedikit Terbatas',
      'Tidak Terbatas Sama Sekali',
      'Terbatas akibat kondisi lain atau tidak melakukan aktivitas tersebut',
    ],
  },
  { key: 'q2_change', question: 'Perubahan gejala dibanding 2 minggu lalu', options: ['Lebih berat', 'Agak berat', 'Tidak berubah', 'Agak membaik', 'Lebih membaik', 'Tidak memiliki gejala selama 2 minggu'] },
  { key: 'q3_swelling_freq', question: 'Seberapa sering bengkak di kedua kaki saat bangun pagi?', options: ['Tiap pagi', '3 kali atau lebih dalam seminggu tapi tidak tiap hari', '1-2 kali dalam seminggu', 'Kurang dari sekali dalam seminggu', 'Tidak pernah'] },
  { key: 'q4_swelling_severity', question: 'Seberapa berat bengkak di kaki mengganggu Anda?', options: ['Sangat mengganggu', 'Agak mengganggu', 'Tidak terlalu mengganggu', 'Sedikit mengganggu', 'Tidak mengganggu sama sekali', 'Tidak bengkak sama sekali'] },
  { key: 'q5_fatigue_freq', question: 'Seberapa sering kelelahan membatasi aktivitas Anda?', options: ['Setiap saat', 'Beberapa kali sehari', 'Setidaknya sekali sehari', '3 atau lebih dalam seminggu, tapi tidak tiap hari', '1-2 kali seminggu', 'Kurang dari sekali seminggu', 'Tidak lelah sama sekali'] },
  { key: 'q6_fatigue_severity', question: 'Seberapa berat kelelahan ini mengganggu Anda?', options: ['Sangat mengganggu', 'Agak mengganggu', 'Tidak terlalu mengganggu', 'Sedikit mengganggu', 'Tidak mengganggu sama sekali', 'Tidak lelah sama sekali'] },
  { key: 'q7_dyspnea_freq', question: 'Seberapa sering sesak napas membatasi aktivitas Anda?', options: ['Setiap saat', 'Beberapa kali sehari', 'Setidaknya sekali sehari', '3 atau lebih dalam seminggu, tapi tidak tiap hari', '1-2 kali seminggu', 'Kurang dari sekali seminggu', 'Tidak sesak sama sekali'] },
  { key: 'q8_dyspnea_severity', question: 'Seberapa berat sesak napas mengganggu Anda?', options: ['Sangat mengganggu', 'Agak mengganggu', 'Tidak terlalu mengganggu', 'Sedikit mengganggu', 'Tidak mengganggu sama sekali', 'Tidak sesak napas sama sekali'] },
  { key: 'q9_sleep_pos', question: 'Berapa kali Anda terpaksa tidur duduk atau pakai bantal lebih (2 minggu terakhir)?', options: ['Tiap malam', '3 kali atau lebih dalam seminggu tapi tidak tiap hari', '1-2 kali dalam seminggu', 'Kurang dari sekali dalam seminggu', 'Tidak pernah'] },
  { key: 'q10_confidence', question: 'Seberapa yakin Anda tahu apa yang harus dilakukan jika gejala memburuk?', options: ['Tidak yakin sama sekali', 'Tidak terlalu yakin', 'Sedikit yakin', 'Cukup yakin', 'Yakin sekali'] },
  { key: 'q11_knowledge', question: 'Apakah Anda tahu hal-hal yang dapat mencegah gejala bertambah parah?', options: ['Tidak yakin sama sekali', 'Tidak terlalu yakin', 'Sedikit yakin', 'Cukup yakin', 'Yakin sekali'] },
  { key: 'q12_happiness', question: 'Seberapa besar gagal jantung membatasi kebahagiaan hidup Anda?', options: ['Sangat terbatas', 'Agak terbatas', 'Tidak terlalu terbatas', 'Sedikit terbatas', 'Tidak terbatas'] },
  { key: 'q13_satisfaction', question: 'Bagaimana pendapat Anda jika harus menjalani sisa hidup dengan kondisi ini?', options: ['Sangat tidak puas', 'Tidak puas', 'Sedikit puas', 'Puas', 'Sangat puas'] },
  { key: 'q14_despondent', question: 'Seberapa sering merasa tidak bersemangat/putus asa (2 minggu terakhir)?', options: ['Setiap hari', 'Sering kali', 'Kadang-kadang', 'Jarang', 'Tidak pernah'] },
  {
    key: 'q15_activities',
    question: 'Seberapa gagal jantung membatasi gaya hidup Anda (2 minggu terakhir)?',
    subitems: [
      { key: 'hobi', label: 'Hobi / berekreasi' },
      { key: 'bekerja', label: 'Bekerja atau melakukan pekerjaan rumah' },
      { key: 'kunjungan', label: 'Mengunjungi keluarga atau teman' },
      { key: 'hubungan', label: 'Hubungan suami/istri' },
    ],
    options: [
      'Sangat Terbatas',
      'Agak Terbatas',
      'Tidak Terlalu Terbatas',
      'Sedikit Terbatas',
      'Tidak Terbatas Sama Sekali',
      'Terbatas akibat kondisi lain atau tidak melakukan aktivitas tersebut',
    ],
  },
];

export default function PatientKuisionerTahapScreen({ route, navigation, onBack }) {
  const { patientProfile } = route.params;
  const insets = useSafeAreaInsets();

  const [currentTahap, setCurrentTahap] = useState(1);
  const [tahap1Data, setTahap1Data] = useState({
    nama: patientProfile?.nama || '',
    jenis_kelamin: patientProfile?.jenis_kelamin || '',
    usia: String(patientProfile?.usia || ''),
    diagnosis: patientProfile?.tgl_diagnosa || '',
    tanggal_lahir: patientProfile?.tanggal_lahir || patientProfile?.tgl_lahir || '',
  });

  const [tahap2Data, setTahap2Data] = useState({});
  const [tahap3Data, setTahap3Data] = useState({});
  const [tahap4Data, setTahap4Data] = useState({});
  const [tahap5Data, setTahap5Data] = useState({});
  const [tahap6Data, setTahap6Data] = useState({});
  const [tahap7Data, setTahap7Data] = useState({});
  const [loading, setLoading] = useState(false);
  const [obatList, setObatList] = useState([]);
  const [isAddObatModalOpen, setIsAddObatModalOpen] = useState(false);
  const [newObat, setNewObat] = useState({ nama_obat: '', dosis: '', frekuensi: '', keterangan: '' });
  const [selectModal, setSelectModal] = useState({ visible: false, label: '', options: [], onSelect: null });
  const [herbalList, setHerbalList] = useState([]);
  const [isAddHerbalModalOpen, setIsAddHerbalModalOpen] = useState(false);
  const [newHerbal, setNewHerbal] = useState({ nama_obat: '', dosis: '', frekuensi: '', keterangan: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRulerDragging, setIsRulerDragging] = useState(false);
  const [rulerDragValue, setRulerDragValue] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pad = (v) => String(v).padStart(2, '0');
  const formatDisplayDate = (iso) => {
    if (!iso) return '';
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    return `${m[3]}-${m[2]}-${m[1]}`;
  };

  const parseDisplayToIso = (display) => {
    if (!display) return '';
    const m = String(display).match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!m) return '';
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return '';
    return `${yyyy}-${pad(mm)}-${pad(dd)}`;
  };

  const handleUpdateTahap1 = (field, value) => setTahap1Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap2 = (field, value) => setTahap2Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap3 = (field, value) => setTahap3Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap4 = (field, value) => setTahap4Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap5 = (field, value) => setTahap5Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap6 = (field, value) => setTahap6Data(prev => ({ ...prev, [field]: value }));
  const handleUpdateTahap7 = (field, value) => setTahap7Data(prev => ({ ...prev, [field]: value }));

  const handleAddObat = () => {
    if (!newObat.nama_obat.trim() || !newObat.dosis.trim() || !newObat.frekuensi.trim()) {
      Alert.alert('Validasi', 'Nama obat, dosis, dan frekuensi harus diisi.');
      return;
    }
    setObatList([...obatList, { ...newObat, id: Date.now() }]);
    setNewObat({ nama_obat: '', dosis: '', frekuensi: '', keterangan: '' });
    setIsAddObatModalOpen(false);
  };

  const handleAddHerbal = () => {
    if (!newHerbal.nama_obat.trim() || !newHerbal.dosis.trim() || !newHerbal.frekuensi.trim()) {
      Alert.alert('Validasi', 'Nama herbal, dosis, dan frekuensi harus diisi.');
      return;
    }
    setHerbalList([...herbalList, { ...newHerbal, id: Date.now() }]);
    setNewHerbal({ nama_obat: '', dosis: '', frekuensi: '', keterangan: '' });
    setIsAddHerbalModalOpen(false);
  };

  const handleRemoveObat = (id) => setObatList(obatList.filter(o => o.id !== id));
  const handleRemoveHerbal = (id) => setHerbalList(herbalList.filter(h => h.id !== id));

  const canProceed = () => {
    if (currentTahap === 1) {
      return Boolean(
        tahap1Data.tanggal_lahir && tahap1Data.suku && tahap1Data.status &&
        tahap1Data.pendidikan && tahap1Data.pekerjaan && tahap1Data.nomor_hp && tahap1Data.pendapatan
      );
    }
    if (currentTahap === 2) {
      const penyakitOk = tahap2Data.penyakit_penyerta !== undefined && tahap2Data.penyakit_penyerta !== '';
      const herbalOk = tahap2Data.herbal !== undefined && tahap2Data.herbal !== '';
      return penyakitOk && herbalOk && obatList.length > 0;
    }
    if (currentTahap === 4) {
      // require all kepatuhan questions answered
      return KEPATUHAN_QUESTIONS.every((q, idx) => {
        const key = `q_${idx + 1}`;
        return tahap4Data[key] !== undefined && tahap4Data[key] !== '';
      });
    }
    if (currentTahap === 5) {
      // require all efikasi questions answered
      return EFIKASI_QUESTIONS.every((q, idx) => {
        const key = `e_${idx + 1}`;
        return tahap5Data[key] !== undefined && tahap5Data[key] !== '';
      });
    }
    if (currentTahap === 6) {
      const qolOk = QUALITY_OF_LIFE_QUESTIONS.every((item) => {
        return tahap6Data[item.key] !== undefined && tahap6Data[item.key] !== '';
      });
      const rulerOk = tahap6Data[RULER_QUESTION.key] !== undefined && tahap6Data[RULER_QUESTION.key] !== '' && tahap6Data[RULER_QUESTION.key] !== null;
      return qolOk && rulerOk;
    }
    if (currentTahap === 7) {
      // require all KCCQ questions answered (including subitems)
      return KCCQ_QUESTIONS.every((item) => {
        if (item.subitems && Array.isArray(item.subitems)) {
          return item.subitems.every(si => (tahap7Data[si.key] !== undefined && tahap7Data[si.key] !== '' && tahap7Data[si.key] !== null));
        }
        return tahap7Data[item.key] !== undefined && tahap7Data[item.key] !== '' && tahap7Data[item.key] !== null;
      });
    }
    return true;
  };

  const handleSubmit = async () => {
    const storedProfile = patientProfile?.id ? patientProfile : await getPatientProfile();
    if (!storedProfile?.id) {
      Alert.alert('Profil pasien belum lengkap', 'Simpan ulang biodata pasien terlebih dahulu.');
      return;
    }
    try {
      setLoading(true);
      const allResponses = {
        tahap_1_identitas: tahap1Data,
        tahap_2_riwayat: { ...tahap2Data, obat_jantung_list: obatList, obat_herbal_list: herbalList },
        tahap_3_efek_samping: tahap3Data,
      };
      // convert tahap4 scale labels to numeric values if present
      const tahap4_numeric = {};
      if (tahap4Data && Object.keys(tahap4Data).length > 0) {
        Object.keys(tahap4Data).forEach((k) => {
          const v = tahap4Data[k];
          tahap4_numeric[k] = SCALE_MAP[v] ?? (typeof v === 'number' ? v : null);
        });
      }

      // convert tahap5 efikasi labels to numeric
      const tahap5_numeric = {};
      if (tahap5Data && Object.keys(tahap5Data).length > 0) {
        Object.keys(tahap5Data).forEach((k) => {
          const v = tahap5Data[k];
          tahap5_numeric[k] = EFIKASI_MAP[v] ?? (typeof v === 'number' ? v : null);
        });
      }

      // convert tahap6 knowledge labels to numeric
      const tahap6_numeric = {};
      if (tahap6Data && Object.keys(tahap6Data).length > 0) {
        Object.keys(tahap6Data).forEach((k) => {
          tahap6_numeric[k] = typeof tahap6Data[k] === 'number' ? tahap6Data[k] : Number(tahap6Data[k]);
        });
      }

      const tahap7_numeric = {};
      if (tahap7Data && Object.keys(tahap7Data).length > 0) {
        Object.keys(tahap7Data).forEach((k) => {
          const v = tahap7Data[k];
          tahap7_numeric[k] = v === null ? null : (typeof v === 'number' ? v : (Number(v) || null));
        });
      }

      const payload = { ...allResponses, tahap_4_kepatuhan: tahap4_numeric, tahap_5_efikasi: tahap5_numeric, tahap_6_kualitas_hidup: tahap6_numeric, tahap_7_kccq: tahap7_numeric };

      await submitKuisionerAnswers(storedProfile.id, new Date().toISOString().split('T')[0], payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting kuisioner:', error);
      Alert.alert('Error', 'Gagal menyimpan kuisioner. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const closeSelectModal = () => setSelectModal({ visible: false, label: '', options: [], onSelect: null });

  const handleToggleEfek = (efek) => {
    const arr = Array.isArray(tahap3Data.efek_samping) ? [...tahap3Data.efek_samping] : [];
    const idx = arr.indexOf(efek);
    if (idx === -1) arr.push(efek);
    else arr.splice(idx, 1);
    handleUpdateTahap3('efek_samping', arr);
  };

  const handleExit = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }

    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const showEffectInfo = (efek) => {
    Alert.alert(efek, EFFECT_INFO[efek] || 'Tidak ada penjelasan tambahan untuk pilihan ini.');
  };

  const fillDummyForTahap = () => {
    if (currentTahap === 1) {
      setTahap1Data((prev) => ({
        ...prev,
        tanggal_lahir: prev.tanggal_lahir || '2000-01-01',
        status: prev.status || 'Menikah',
        suku: prev.suku || 'Jawa',
        pendidikan: prev.pendidikan || 'SMA',
        pekerjaan: prev.pekerjaan || 'Bekerja: PNS / Karyawan BUMN / Swasta / Wirausaha',
        nomor_hp: prev.nomor_hp || '081234567890',
        pendapatan: prev.pendapatan || '1.000.000 – 5.000.000',
      }));
      return;
    }

    if (currentTahap === 2) {
      setTahap2Data({
        penyakit_penyerta: 'Tidak',
        herbal: 'Tidak',
        obat_lain: 'Tidak',
      });
      setObatList([
        { id: Date.now(), nama_obat: 'Furosemide', dosis: '40 mg', frekuensi: '1x sehari', keterangan: '' },
      ]);
      setHerbalList([]);
      return;
    }

    if (currentTahap === 3) {
      setTahap3Data({
        pelaporan: 'Dokter',
        efek_samping: ['Batuk'],
        tindakan: 'Membiarkan',
      });
      return;
    }

    if (currentTahap === 4) {
      const data = {};
      KEPATUHAN_QUESTIONS.forEach((_, idx) => {
        data[`q_${idx + 1}`] = 'Jarang';
      });
      setTahap4Data(data);
      return;
    }

    if (currentTahap === 5) {
      const data = {};
      EFIKASI_QUESTIONS.forEach((_, idx) => {
        data[`e_${idx + 1}`] = 'Agak yakin';
      });
      setTahap5Data(data);
      return;
    }

    if (currentTahap === 6) {
      const data = {};
      QUALITY_OF_LIFE_QUESTIONS.forEach((item) => {
        data[item.key] = 2;
      });
      data[RULER_QUESTION.key] = 75;
      setTahap6Data(data);
      return;
    }

    if (currentTahap === 7) {
      const data = {};
      KCCQ_QUESTIONS.forEach((item) => {
        if (item.subitems && Array.isArray(item.subitems)) {
          item.subitems.forEach((si) => {
            data[si.key] = 2;
          });
        } else {
          data[item.key] = 2;
        }
      });
      setTahap7Data(data);
    }
  };

  const currentRulerValue = typeof tahap6Data[RULER_QUESTION.key] === 'number' ? tahap6Data[RULER_QUESTION.key] : 0;

  // ── STYLED FIELD RENDERERS ──

  const renderLabel = (label) => (
    <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
      {label}
    </Text>
  );

  const renderTextField = (label, value, onChangeText, readonly = false, type = 'text') => (
    <View style={{ marginBottom: 16 }}>
      {renderLabel(label)}
      <TextInput
        style={{
          borderWidth: 2,
          borderColor: readonly ? '#E2E8F0' : '#FCD34D',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: readonly ? '#F8FAFC' : '#FFFBEB',
          color: '#1E293B',
          fontWeight: '600',
          fontSize: 14,
          opacity: readonly ? 0.6 : 1,
        }}
        placeholder={`Masukkan ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={(text) => {
          if (type === 'number') {
            onChangeText(String(text).replace(/[^0-9]/g, ''));
          } else {
            onChangeText(text);
          }
        }}
        editable={!readonly}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
      />
    </View>
  );

  const renderSelectField = (label, value, options, onChangeText) => (
    <View style={{ marginBottom: 16 }}>
      {renderLabel(label)}
      <TouchableOpacity
        onPress={() => setSelectModal({ visible: true, label, options, onSelect: onChangeText })}
        style={{
          borderWidth: 2,
          borderColor: value ? '#F59E0B' : '#FCD34D',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: value ? '#FFFBEB' : '#FEFCE8',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: value ? '#1E293B' : '#94A3B8', fontWeight: value ? '600' : '400', fontSize: 14, flex: 1 }}>
          {value || 'Pilih opsi...'}
        </Text>
        <ChevronRight color={value ? '#F59E0B' : '#CBD5E1'} size={18} />
      </TouchableOpacity>
    </View>
  );

  const renderObatCard = (item, onRemove) => (
    <View key={item.id} style={{
      backgroundColor: '#FFFBEB',
      borderRadius: 16,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1.5,
      borderColor: '#FDE68A',
      flexDirection: 'row',
      alignItems: 'flex-start',
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#92400E', fontSize: 14 }}>{item.nama_obat}</Text>
        <Text style={{ fontSize: 12, color: '#B45309', marginTop: 4 }}>Dosis: {item.dosis}</Text>
        <Text style={{ fontSize: 12, color: '#B45309' }}>Frekuensi: {item.frekuensi}</Text>
        {item.keterangan ? <Text style={{ fontSize: 12, color: '#B45309' }}>Keterangan: {item.keterangan}</Text> : null}
      </View>
      <TouchableOpacity onPress={onRemove} style={{ marginLeft: 8, padding: 4 }}>
        <X color="#EF4444" size={18} />
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = (label, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: '#F59E0B',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
      }}
    >
      <Plus color="#F59E0B" size={18} />
      <Text style={{ color: '#92400E', fontWeight: '700', marginLeft: 8, fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );

  const progressPercent = (currentTahap / 7) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF', paddingTop: insets.top }}>

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#F59E0B', '#FCD34D', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 20,
          paddingBottom: 60,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        {/* Decorative circles */}
        <View style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: '#ffffff18' }} />
        <View style={{ position: 'absolute', top: 30, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffffff10' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <TouchableOpacity
              onPress={handleExit}
              style={{
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: '#ffffff25',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#ffffff40',
              }}
            >
              <ChevronLeft color="#fff" size={18} />
            </TouchableOpacity>
            <View>
                <Text style={{ color: '#FAE8B6', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' }}>
                Evaluasi Pasien
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
                Kuisioner
              </Text>
            </View>
          </View>
          <View style={{
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: '#ffffff25',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: '#ffffff40',
          }}>
            <ClipboardList color="#fff" size={20} />
          </View>
        </View>
      </LinearGradient>

      {/* ── PROGRESS CARD (floating) ── */}
      <View style={{
        marginHorizontal: 20,
        marginTop: -32,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 16,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
              Tahap
            </Text>
            <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
              {currentTahap} dari 7 — {TAHAP_LABELS[currentTahap - 1]}
            </Text>
          </View>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#92400E', fontSize: 16, fontWeight: '900' }}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
        </View>

        {/* Step dots */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <View key={step} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: step <= currentTahap ? '#F59E0B' : '#FEF3C7',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 4,
              }}>
                <Text style={{ color: step <= currentTahap ? '#fff' : '#CBD5E1', fontWeight: '900', fontSize: 12 }}>
                  {step}
                </Text>
              </View>
              <Text style={{ color: step <= currentTahap ? '#92400E' : '#CBD5E1', fontSize: 9, fontWeight: '700', textAlign: 'center' }}>
                {TAHAP_LABELS[step - 1].split(' ')[0]}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View style={{ height: 8, borderRadius: 4, backgroundColor: '#FEF3C7', overflow: 'hidden' }}>
          <LinearGradient
            colors={['#F59E0B', '#FCD34D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${progressPercent}%` }}
          />
        </View>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section title */}
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{currentTahap}</Text>
          </View>
          <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 14 }}>
            Tahap {currentTahap}: {TAHAP_LABELS[currentTahap - 1]}
          </Text>
        </View>

        {currentTahap === 1 && (
          <View>
            {renderTextField('Nama', tahap1Data.nama, (v) => handleUpdateTahap1('nama', v), true)}
            {renderTextField('Jenis Kelamin', tahap1Data.jenis_kelamin, (v) => handleUpdateTahap1('jenis_kelamin', v), true)}

            {/* Date Picker */}
            <View style={{ marginBottom: 16 }}>
              {renderLabel('Tanggal Lahir')}
              {Platform.OS === 'web' ? (
                <input
                  type="text"
                  value={formatDisplayDate(tahap1Data.tanggal_lahir)}
                  onChange={(e) => {
                    const iso = parseDisplayToIso(e.target.value);
                    handleUpdateTahap1('tanggal_lahir', iso || '');
                  }}
                  placeholder="dd-mm-yyyy"
                  style={{
                    padding: 14, borderRadius: 16, border: '2px solid #FCD34D',
                    backgroundColor: '#FFFBEB', width: '100%', fontSize: 14,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      borderWidth: 2, borderColor: tahap1Data.tanggal_lahir ? '#F59E0B' : '#FCD34D',
                      borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                      backgroundColor: '#FFFBEB',
                    }}
                  >
                    <Text style={{ color: tahap1Data.tanggal_lahir ? '#1E293B' : '#94A3B8', fontWeight: '600', fontSize: 14 }}>
                      {formatDisplayDate(tahap1Data.tanggal_lahir) || 'Pilih tanggal lahir'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={tahap1Data.tanggal_lahir ? new Date(tahap1Data.tanggal_lahir) : new Date()}
                      mode="date"
                      maximumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (event?.type === 'dismissed') { setShowDatePicker(false); return; }
                        setShowDatePicker(false);
                        if (selectedDate) handleUpdateTahap1('tanggal_lahir', selectedDate.toISOString().split('T')[0]);
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {renderTextField('Usia', tahap1Data.usia, (v) => handleUpdateTahap1('usia', v), true)}
            {renderSelectField('Status Pernikahan', tahap1Data.status, ['Belum menikah', 'Menikah', 'Pernah menikah'], (v) => handleUpdateTahap1('status', v))}
            {renderTextField('Suku', tahap1Data.suku, (v) => handleUpdateTahap1('suku', v))}
            {renderSelectField('Pendidikan Terakhir', tahap1Data.pendidikan, TAHAP_1_FIELDS.pendidikan.options, (v) => handleUpdateTahap1('pendidikan', v))}
            {renderSelectField('Pekerjaan', tahap1Data.pekerjaan, TAHAP_1_FIELDS.pekerjaan.options, (v) => handleUpdateTahap1('pekerjaan', v))}
            {renderTextField('Nomor HP', tahap1Data.nomor_hp, (v) => handleUpdateTahap1('nomor_hp', v), false, 'number')}
            {renderSelectField('Pendapatan', tahap1Data.pendapatan, TAHAP_1_FIELDS.pendapatan.options, (v) => handleUpdateTahap1('pendapatan', v))}
          </View>
        )}

        {currentTahap === 6 && (
          <View>
            <View style={{ marginBottom: 16 }}>
              {renderLabel('KUESIONER KUALITAS HIDUP')}
              <Text style={{ color: '#475569', marginBottom: 8 }}>Pilih tingkat kondisi yang paling sesuai untuk setiap aspek.</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', overflow: 'hidden', padding: 12 }}>
                {QUALITY_OF_LIFE_QUESTIONS.map((item) => (
                  <View key={item.key} style={{ marginBottom: 14 }}>
                    {renderLabel(item.question)}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      {item.options.map((opt, optIdx) => {
                        const selected = tahap6Data[item.key] === opt.value;
                        return (
                          <TouchableOpacity
                            key={`${item.key}-${opt.value}`}
                            onPress={() => handleUpdateTahap6(item.key, opt.value)}
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              paddingVertical: 6,
                              marginRight: optIdx < item.options.length - 1 ? 8 : 0,
                              flexDirection: 'column',
                            }}
                          >
                            <View style={{
                              width: 26, height: 26, borderRadius: 13,
                              borderWidth: 2, borderColor: selected ? '#F59E0B' : '#CBD5E1',
                              alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                              backgroundColor: selected ? '#FFFBEB' : 'transparent'
                            }}>
                              {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' }} />}
                            </View>
                            <Text numberOfLines={2} ellipsizeMode="tail" style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '800' : '600', fontSize: 11, textAlign: 'center' }}>{opt.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              {renderLabel(RULER_QUESTION.label)}
              <Text style={{ color: '#475569', marginBottom: 8 }}>{RULER_QUESTION.helper}</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', padding: 12 }}>
                <View style={{ position: 'relative' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>0</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>100</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={currentRulerValue}
                    minimumTrackTintColor="#F59E0B"
                    maximumTrackTintColor="#E2E8F0"
                    thumbTintColor="#F59E0B"
                    onSlidingStart={() => {
                      setIsRulerDragging(true);
                      setRulerDragValue(currentRulerValue);
                    }}
                    onValueChange={(value) => {
                      const rounded = Math.round(value);
                      setRulerDragValue(rounded);
                      handleUpdateTahap6(RULER_QUESTION.key, rounded);
                    }}
                    onSlidingComplete={() => setIsRulerDragging(false)}
                  />
                  {isRulerDragging && rulerDragValue !== null && (
                    <View style={{ position: 'absolute', top: -28, right: 0, backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{rulerDragValue}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 13, textAlign: 'right' }}>
                  Nilai: {tahap6Data[RULER_QUESTION.key] ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {currentTahap === 7 && (
          <View>
            <View style={{ marginBottom: 16 }}>
              {renderLabel('VALIDASI KCCQ')}
              <Text style={{ color: '#475569', marginBottom: 8 }}>Jawab pertanyaan berikut sesuai instruksi pada tiap pertanyaan (2 minggu terakhir).</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', overflow: 'hidden' }}>
                {KCCQ_QUESTIONS.map((item, idx) => {
                  if (item.subitems && Array.isArray(item.subitems)) {
                    return (
                      <View key={item.key} style={{ borderBottomWidth: 1, borderBottomColor: '#FEF3C7' }}>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFBEB' }}>
                          {renderLabel(`${idx + 1}. ${item.question}`)}
                        </View>
                        {item.subitems.map((si, siIdx) => (
                          <View key={si.key}>
                            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
                              <Text style={{ color: '#475569', fontWeight: '600', fontSize: 13, marginBottom: 10 }}>{si.label}</Text>
                              {item.options.map((opt, optIdx) => {
                                const mapped = optIdx === item.options.length - 1 ? null : optIdx + 1;
                                const selected = tahap7Data[si.key] === mapped;
                                return (
                                  <TouchableOpacity
                                    key={`${si.key}-${optIdx}`}
                                    onPress={() => handleUpdateTahap7(si.key, mapped)}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: optIdx < item.options.length - 1 ? 1 : 0, borderBottomColor: '#FEF3C7' }}
                                  >
                                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? '#F59E0B' : '#CBD5E1', backgroundColor: selected ? '#F59E0B' : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                      {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                                    </View>
                                    <Text style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '700' : '500', fontSize: 13, flex: 1 }}>{opt}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                            {siIdx < item.subitems.length - 1 && <View style={{ height: 1, backgroundColor: '#FEF3C7' }} />}
                          </View>
                        ))}
                      </View>
                    );
                  }

                  // single question
                  const key = item.key;
                  return (
                    <View key={key} style={{ borderBottomWidth: 1, borderBottomColor: '#FEF3C7' }}>
                      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFBEB' }}>
                        {renderLabel(`${idx + 1}. ${item.question}`)}
                      </View>
                      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
                        {item.options.map((opt, optIdx) => {
                          const mapped = optIdx + 1;
                          const selected = tahap7Data[key] === mapped;
                          return (
                            <TouchableOpacity
                              key={`${key}-${optIdx}`}
                              onPress={() => handleUpdateTahap7(key, mapped)}
                              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: optIdx < item.options.length - 1 ? 1 : 0, borderBottomColor: '#FEF3C7' }}
                            >
                              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? '#F59E0B' : '#CBD5E1', backgroundColor: selected ? '#F59E0B' : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                              </View>
                              <Text style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '700' : '500', fontSize: 13, flex: 1 }}>{opt}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {currentTahap === 2 && (
          <View>
            {renderTextField('Diagnosis Gagal Jantung', formatDisplayDate(patientProfile?.tgl_diagnosa || ''), () => {}, true)}
            {renderSelectField('Penyakit Penyerta', tahap2Data.penyakit_penyerta, ['Tidak', 'Ya'], (v) => handleUpdateTahap2('penyakit_penyerta', v))}
            {tahap2Data.penyakit_penyerta === 'Ya' && renderTextField('Alasan Penyakit', tahap2Data.alasan_penyakit || '', (v) => handleUpdateTahap2('alasan_penyakit', v))}
            {renderSelectField('Menggunakan Obat Herbal', tahap2Data.herbal, ['Tidak', 'Ya'], (v) => handleUpdateTahap2('herbal', v))}

            {tahap2Data.herbal === 'Ya' && (
              <View style={{ marginBottom: 16 }}>
                {renderLabel('Obat Herbal yang Digunakan')}
                {herbalList.map(h => renderObatCard(h, () => handleRemoveHerbal(h.id)))}
                {renderAddButton('Tambah Obat Herbal', () => setIsAddHerbalModalOpen(true))}
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              {renderLabel('Obat Gagal Jantung yang Digunakan')}
              {obatList.map(obat => renderObatCard(obat, () => handleRemoveObat(obat.id)))}
              {renderAddButton('Tambah Obat', () => setIsAddObatModalOpen(true))}
            </View>

            {renderSelectField('Ada Obat Lain yang Digunakan', tahap2Data.obat_lain, ['Tidak', 'Ya'], (v) => handleUpdateTahap2('obat_lain', v))}
            {tahap2Data.obat_lain === 'Ya' && renderTextField('Detail Obat Lain', tahap2Data.detail_obat_lain || '', (v) => handleUpdateTahap2('detail_obat_lain', v))}
          </View>
        )}

        {currentTahap === 3 && (
          <View>
            {renderSelectField('Pelaporan Efek Samping', tahap3Data.pelaporan, ['Dokter', 'Perawat', 'Apoteker', 'Lainnya'], (v) => handleUpdateTahap3('pelaporan', v))}
            {tahap3Data.pelaporan === 'Lainnya' && renderTextField('Lainnya', tahap3Data.pelaporan_lainnya || '', (v) => handleUpdateTahap3('pelaporan_lainnya', v))}

            <View style={{ marginBottom: 16 }}>
              {renderLabel('Efek Samping yang Dirasakan')}
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', overflow: 'hidden' }}>
                {['Batuk', 'Pusing', 'Bradikardia', 'Hipotensi', 'Hiperkalemia', 'Gangguan ginjal', 'Gejala lainnya'].map((efek, idx, arr) => {
                  const selected = (tahap3Data.efek_samping || []).includes(efek);
                  const hasInfo = Boolean(EFFECT_INFO[efek]);
                  return (
                    <View key={efek}>
                      <View style={{
                        paddingHorizontal: 16, paddingVertical: 12,
                        backgroundColor: selected ? '#FFFBEB' : '#fff',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }} onPress={() => handleToggleEfek(efek)}>
                            <View style={{
                              width: 22, height: 22, borderRadius: 6,
                              borderWidth: 2,
                              borderColor: selected ? '#F59E0B' : '#CBD5E1',
                              backgroundColor: selected ? '#F59E0B' : 'transparent',
                              alignItems: 'center', justifyContent: 'center',
                              marginRight: 12,
                            }}>
                              {selected && <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#fff' }} />}
                            </View>
                            <Text style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '700' : '500', fontSize: 14, flex: 1 }}>
                              {efek}
                            </Text>
                          </TouchableOpacity>
                          {hasInfo ? (
                            <TouchableOpacity
                              onPress={() => showEffectInfo(efek)}
                              style={{
                                width: 30, height: 30, borderRadius: 15,
                                backgroundColor: '#FEF3C7',
                                alignItems: 'center', justifyContent: 'center',
                              }}
                              hitSlop={8}
                            >
                              <Info color="#92400E" size={15} />
                            </TouchableOpacity>
                          ) : (
                            <View style={{ width: 30 }} />
                          )}
                        </View>
                        {selected && (
                          <View style={{ marginTop: 10 }}>
                            {renderTextField(`Detail ${efek}`, tahap3Data[`detail_${efek}`] || '', (v) => handleUpdateTahap3(`detail_${efek}`, v))}
                          </View>
                        )}
                      </View>
                      {idx < arr.length - 1 && <View style={{ height: 1, backgroundColor: '#FEF3C7' }} />}
                    </View>
                  );
                })}
              </View>
            </View>

            {renderSelectField('Tindakan yang Dilakukan', tahap3Data.tindakan, ['Membiarkan', 'Mengobati', 'Melaporkan kepada tenaga kesehatan', 'Pergi ke dokter', 'Lainnya'], (v) => handleUpdateTahap3('tindakan', v))}
            {tahap3Data.tindakan === 'Lainnya' && renderTextField('Tindakan Lainnya', tahap3Data.tindakan_lainnya || '', (v) => handleUpdateTahap3('tindakan_lainnya', v))}
          </View>
        )}

        {currentTahap === 4 && (
          <View>
            <View style={{ marginBottom: 16 }}>
              {renderLabel('KUESIONER KEPATUHAN PENGOBATAN TERHADAP GAGAL JANTUNG')}
              <Text style={{ color: '#475569', marginBottom: 8 }}>Pilih salah satu skala untuk setiap pernyataan.</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', overflow: 'hidden', padding: 12 }}>
                {KEPATUHAN_QUESTIONS.map((q, idx) => {
                  const key = `q_${idx + 1}`;
                  return (
                    <View key={key} style={{ marginBottom: 12 }}>
                      {renderLabel(`${idx + 1}. ${q}`)}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        {SCALE_OPTIONS.map((opt, optIdx) => {
                          const selected = tahap4Data[key] === opt;
                          return (
                            <TouchableOpacity
                              key={opt}
                              onPress={() => handleUpdateTahap4(key, opt)}
                              style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 6,
                                marginRight: optIdx < SCALE_OPTIONS.length - 1 ? 8 : 0,
                                flexDirection: 'column',
                              }}
                            >
                              <View style={{
                                width: 26, height: 26, borderRadius: 13,
                                borderWidth: 2, borderColor: selected ? '#F59E0B' : '#CBD5E1',
                                alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                                backgroundColor: selected ? '#FFFBEB' : 'transparent'
                              }}>
                                {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' }} />}
                              </View>
                              <Text numberOfLines={2} ellipsizeMode="tail" style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '800' : '600', fontSize: 11, textAlign: 'center' }}>{opt}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {currentTahap === 5 && (
          <View>
            <View style={{ marginBottom: 16 }}>
              {renderLabel('KUESIONER EFIKASI DIRI TERHADAP PENGGUNAAN OBAT')}
              <Text style={{ color: '#475569', marginBottom: 8 }}>Pilih salah satu skala untuk setiap pernyataan.</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#FDE68A', overflow: 'hidden', padding: 12 }}>
                {EFIKASI_QUESTIONS.map((q, idx) => {
                  const key = `e_${idx + 1}`;
                  return (
                    <View key={key} style={{ marginBottom: 12 }}>
                      {renderLabel(`${idx + 1}. ${q}`)}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        {EFIKASI_SCALE.map((opt, optIdx) => {
                          const selected = tahap5Data[key] === opt;
                          return (
                            <TouchableOpacity
                              key={opt}
                              onPress={() => handleUpdateTahap5(key, opt)}
                              style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 6,
                                marginRight: optIdx < EFIKASI_SCALE.length - 1 ? 8 : 0,
                                flexDirection: 'column',
                              }}
                            >
                              <View style={{
                                width: 26, height: 26, borderRadius: 13,
                                borderWidth: 2, borderColor: selected ? '#F59E0B' : '#CBD5E1',
                                alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                                backgroundColor: selected ? '#FFFBEB' : 'transparent'
                              }}>
                                {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' }} />}
                              </View>
                              <Text numberOfLines={2} ellipsizeMode="tail" style={{ color: selected ? '#92400E' : '#475569', fontWeight: selected ? '800' : '600', fontSize: 11, textAlign: 'center' }}>{opt}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── NAVIGATION BUTTONS ── */}
      <View style={{
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: insets.bottom + 16,
        borderTopWidth: 1,
        borderTopColor: '#FEF3C7',
        gap: 12,
      }}>
        {__DEV__ && (
          <TouchableOpacity
            onPress={fillDummyForTahap}
            style={{
              borderWidth: 1,
              borderColor: '#F59E0B',
              borderRadius: 12,
              paddingVertical: 8,
              alignItems: 'center',
              backgroundColor: '#FFFBEB',
            }}
          >
            <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 12 }}>Debug: Isi Tahap</Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', gap: 12 }}>
        {currentTahap > 1 && (
          <TouchableOpacity
            onPress={() => setCurrentTahap(currentTahap - 1)}
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: '#FCD34D',
              borderRadius: 18,
              paddingVertical: 15,
              alignItems: 'center',
              backgroundColor: '#FFFBEB',
            }}
          >
            <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15 }}>Sebelumnya</Text>
          </TouchableOpacity>
        )}

        {currentTahap < 7 ? (
          <TouchableOpacity
            onPress={() => canProceed() && setCurrentTahap(currentTahap + 1)}
            disabled={!canProceed()}
            style={{ flex: 1 }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canProceed() ? ['#F59E0B', '#FCD34D'] : ['#E2E8F0', '#E2E8F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15,
                borderRadius: 18,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: canProceed() ? 0.35 : 0,
                shadowRadius: 14,
                elevation: canProceed() ? 6 : 0,
              }}
            >
              <Text style={{ color: canProceed() ? '#92400E' : '#94A3B8', fontWeight: '800', fontSize: 15 }}>
                Selanjutnya
              </Text>
              <ChevronRight color={canProceed() ? '#92400E' : '#94A3B8'} size={18} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{ flex: 1 }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={!loading ? ['#F59E0B', '#FCD34D'] : ['#E2E8F0', '#E2E8F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15,
                borderRadius: 18,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: !loading ? 0.35 : 0,
                shadowRadius: 14,
                elevation: !loading ? 6 : 0,
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#92400E" />
                  <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15 }}>Menyimpan...</Text>
                </>
              ) : (
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15 }}>Simpan & Selesai</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        </View>
      </View>

      {/* ── SELECT MODAL ── */}
      <Modal visible={selectModal.visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B' }}>{selectModal.label}</Text>
              <TouchableOpacity onPress={closeSelectModal} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <X color="#92400E" size={18} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {(selectModal.options || []).map((opt) => (
                <TouchableOpacity
                  key={String(opt)}
                  onPress={() => {
                    try { selectModal.onSelect && selectModal.onSelect(opt); } catch (e) { console.warn(e); }
                    closeSelectModal();
                  }}
                  style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#FEF3C7' }}
                >
                  <Text style={{ fontSize: 14, color: '#475569', fontWeight: '500' }}>{String(opt)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── ADD OBAT MODAL ── */}
      <Modal visible={isAddObatModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B' }}>Tambah Obat Gagal Jantung</Text>
              <TouchableOpacity onPress={() => setIsAddObatModalOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <X color="#92400E" size={18} />
              </TouchableOpacity>
            </View>
            {['nama_obat', 'dosis', 'frekuensi', 'keterangan'].map((field) => (
              <TextInput
                key={field}
                style={{ borderWidth: 2, borderColor: '#FCD34D', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, backgroundColor: '#FFFBEB', color: '#1E293B', fontSize: 14 }}
                placeholder={{ nama_obat: 'Nama Obat', dosis: 'Dosis', frekuensi: 'Frekuensi', keterangan: 'Keterangan (opsional)' }[field]}
                placeholderTextColor="#94A3B8"
                value={newObat[field]}
                onChangeText={(v) => setNewObat({ ...newObat, [field]: v })}
              />
            ))}
            <TouchableOpacity onPress={handleAddObat} activeOpacity={0.85}>
              <LinearGradient
                colors={['#F59E0B', '#FCD34D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15 }}>Simpan Obat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── ADD HERBAL MODAL ── */}
      <Modal visible={isAddHerbalModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B' }}>Tambah Obat Herbal</Text>
              <TouchableOpacity onPress={() => setIsAddHerbalModalOpen(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <X color="#92400E" size={18} />
              </TouchableOpacity>
            </View>
            {['nama_obat', 'dosis', 'frekuensi', 'keterangan'].map((field) => (
              <TextInput
                key={field}
                style={{ borderWidth: 2, borderColor: '#FCD34D', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, backgroundColor: '#FFFBEB', color: '#1E293B', fontSize: 14 }}
                placeholder={{ nama_obat: 'Nama Obat Herbal', dosis: 'Dosis', frekuensi: 'Frekuensi', keterangan: 'Keterangan (opsional)' }[field]}
                placeholderTextColor="#94A3B8"
                value={newHerbal[field]}
                onChangeText={(v) => setNewHerbal({ ...newHerbal, [field]: v })}
              />
            ))}
            <TouchableOpacity onPress={handleAddHerbal} activeOpacity={0.85}>
              <LinearGradient
                colors={['#F59E0B', '#FCD34D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 15 }}>Simpan Herbal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 6 }}>Sukses</Text>
            <Text style={{ color: '#475569', marginBottom: 16 }}>Kuisioner 7-tahap berhasil disimpan!</Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                handleExit();
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#F59E0B', '#FCD34D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 14 }}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}