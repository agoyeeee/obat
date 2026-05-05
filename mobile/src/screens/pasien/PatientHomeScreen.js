import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Platform, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, UserRound } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { publicRegisterPatient } from '../../services/patientService';


export default function PatientHomeScreen({ onBack, onSubmitSuccess, existingProfile }) {
  const [nama, setNama] = useState('');
  const [usia, setUsia] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [tanggalDiagnosa, setTanggalDiagnosa] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (existingProfile) {
      setNama(existingProfile.nama || '');
      setUsia(existingProfile.usia ? String(existingProfile.usia) : '');
      setJenisKelamin(existingProfile.jenis_kelamin || '');
      setBeratBadan(existingProfile.berat_badan ? String(existingProfile.berat_badan) : '');
      setTanggalDiagnosa(formatDisplayDate(existingProfile.tgl_diagnosa || '') ? String(existingProfile.tgl_diagnosa).slice(0, 10) : '');
    }
  }, [existingProfile]);

  const pad = (v) => String(v).padStart(2, '0');
  const formatDisplayDate = (iso) => {
    if (!iso) return '';
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    return `${m[3]}-${m[2]}-${m[1]}`;
  };

  const normalizeIsoDate = (value) => {
    if (!value) return '';
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : '';
  };

  const parseDisplayToIso = (display) => {
    if (!display) return '';
    const m = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!m) return '';
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return '';
    return `${yyyy}-${pad(mm)}-${pad(dd)}`;
  };
    
  const canSubmit = useMemo(() => {
    return Boolean(
      nama.trim() &&
      usia.trim() &&
      jenisKelamin &&
      beratBadan.trim() &&
      tanggalDiagnosa.trim()
    );
  }, [nama, usia, jenisKelamin, beratBadan, tanggalDiagnosa]);

  const handleSave = async () => {
    if (!canSubmit) {
      Alert.alert('Data belum lengkap', 'Mohon isi semua field biodata pasien terlebih dahulu.');
      return;
    }

    const parsedUsia = Number(usia);
    const parsedBeratBadan = Number(beratBadan);

    if (!Number.isFinite(parsedUsia) || parsedUsia < 0) {
      Alert.alert('Usia tidak valid', 'Usia harus berupa angka yang benar.');
      return;
    }

    if (!Number.isFinite(parsedBeratBadan) || parsedBeratBadan <= 0) {
      Alert.alert('Berat badan tidak valid', 'Berat badan harus berupa angka lebih dari 0.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const normalizedTanggalDiagnosa = normalizeIsoDate(tanggalDiagnosa);

    if (!dateRegex.test(normalizedTanggalDiagnosa)) {
      Alert.alert('Tanggal diagnosa tidak valid', 'Gunakan format dd-mm-yyyy, contoh 24-04-2026.');
      return;
    }

    try {
      setIsSubmitting(true);
      const profile = {
        nama: nama.trim(),
        usia: parsedUsia,
        jenis_kelamin: jenisKelamin,
        berat_badan: parsedBeratBadan,
        tgl_diagnosa: normalizedTanggalDiagnosa,
      };

      // Call backend to register patient and get ID
      console.log('[PatientHomeScreen] Registering patient with:', profile);
      const apiResponse = await publicRegisterPatient(profile);
      console.log('[PatientHomeScreen] API response:', apiResponse);

      // Extract patient data from API response (includes ID) and merge with local data
      const patientData = apiResponse?.data || apiResponse;
      const profileWithId = {
        ...profile,
        ...patientData,
      };
      console.log('[PatientHomeScreen] Profile with ID:', profileWithId);

      if (onSubmitSuccess) {
        await onSubmitSuccess(profileWithId);
      }

      Alert.alert('Berhasil', 'Biodata pasien berhasil disimpan di device.');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Gagal menyimpan biodata pasien.';
      Alert.alert('Gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 48, paddingBottom: 48 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        nestedScrollEnabled={true}
      >
        <Pressable onPress={onBack} className="self-start mb-6 px-3 py-2 rounded-full bg-slate-100 active:bg-slate-200 flex-row items-center">
          <ArrowLeft color="#334155" size={16} />
          <Text className="text-sm font-bold text-slate-700 ml-2">Kembali</Text>
        </Pressable>

        <View className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg shadow-slate-900/5">
          <View className="w-16 h-16 rounded-3xl bg-blue-100 items-center justify-center mb-4">
            <UserRound color="#2563EB" size={28} />
          </View>

          <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">Biodata Pasien</Text>
          <Text className="text-slate-500 mt-2 leading-6">
            Isi data diri terlebih dahulu sebelum menggunakan portal pasien.
          </Text>

          <View className="mt-6">
            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama</Text>
            <TextInput
              className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Masukkan nama pasien"
              placeholderTextColor="#94A3B8"
              value={nama}
              onChangeText={setNama}
            />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Usia</Text>
            <TextInput
  className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
  placeholder="Masukkan usia"
  keyboardType="numeric"
  value={usia}
  onChangeText={(text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setUsia(numeric);
  }}
/>

            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Jenis Kelamin</Text>
            <View className="flex-row mb-4">
              <Pressable
                onPress={() => setJenisKelamin('L')}
                className={`flex-row items-center px-4 py-3 rounded-2xl border mr-3 ${
                  jenisKelamin === 'L' ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-2 ${jenisKelamin === 'L' ? 'border-blue-500' : 'border-slate-400'} items-center justify-center`}>
                  {jenisKelamin === 'L' ? <View className="w-2 h-2 rounded-full bg-blue-500" /> : null}
                </View>
                <Text className={`font-semibold ${jenisKelamin === 'L' ? 'text-blue-700' : 'text-slate-700'}`}>Laki-laki</Text>
              </Pressable>

              <Pressable
                onPress={() => setJenisKelamin('P')}
                className={`flex-row items-center px-4 py-3 rounded-2xl border ${
                  jenisKelamin === 'P' ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <View className={`w-4 h-4 rounded-full border-2 mr-2 ${jenisKelamin === 'P' ? 'border-blue-500' : 'border-slate-400'} items-center justify-center`}>
                  {jenisKelamin === 'P' ? <View className="w-2 h-2 rounded-full bg-blue-500" /> : null}
                </View>
                <Text className={`font-semibold ${jenisKelamin === 'P' ? 'text-blue-700' : 'text-slate-700'}`}>Perempuan</Text>
              </Pressable>
            </View>

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Berat Badan (kg)</Text>
            <TextInput
              className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-4 bg-slate-50 text-slate-900 font-medium text-[15px]"
              placeholder="Contoh: 58"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={beratBadan}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9.]/g, '');
                setBeratBadan(numeric);
              }}
            />

            <Text className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal Diagnosa</Text>
            {Platform.OS === 'web' ? (
            <input
              type="text"
              value={formatDisplayDate(tanggalDiagnosa)}
              onChange={(e) => {
                const iso = parseDisplayToIso(e.target.value);
                setTanggalDiagnosa(iso || '');
              }}
              placeholder="dd-mm-yyyy"
              style={{
                padding: 10,
                borderRadius: 10,
                border: '1px solid #ccc',
                marginBottom: 10
              }}
            />
          ) : (
          <>
            <Pressable
              onPress={() => setShowDate(true)}
              className="border-2 border-slate-200 rounded-2xl px-4 py-3.5 mb-2 bg-slate-50"
            >
              <Text>
                {formatDisplayDate(tanggalDiagnosa) || 'Pilih tanggal diagnosa'}
              </Text>
            </Pressable>

            {showDate && (
              <DateTimePicker
                value={tanggalDiagnosa ? new Date(tanggalDiagnosa) : new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (event.type === 'dismissed') {
                    setShowDate(false);
                    return;
                  }

                  setShowDate(false);

                  if (selectedDate) {
                    const formatted = selectedDate.toISOString().split('T')[0];
                    setTanggalDiagnosa(formatted);
                  }
                }}
              />
            )}
          </>
        )}
            <Text className="text-xs text-slate-400 mb-5">Format tanggal: dd-mm-yyyy. Contoh 24-04-2026</Text>

            <Pressable
              onPress={handleSave}
              className={`rounded-2xl py-4 items-center ${canSubmit && !isSubmitting ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-300'}`}
              disabled={!canSubmit || isSubmitting}
            >
              <Text className="text-white font-bold text-base">{isSubmitting ? 'Menyimpan...' : 'Submit Biodata'}</Text>
            </Pressable>
            {!canSubmit ? (
              <Text className="text-xs text-slate-400 text-center mt-2">Lengkapi semua field untuk mengaktifkan tombol submit.</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}