import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ nama: '', password: '' });
  const [schedules, setSchedules] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [createScheduleForm, setCreateScheduleForm] = useState({
    pasien_id: '',
    obat_id: '',
    dosis: '',
    sediaan: '',
    waktu_konsumsi_id: '1',
    jumlah_obat: '1',
    cara_pemakaian: '',
  });

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  async function handleLogin() {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', loginForm);
      setToken(response.data.token);
      setUser(response.data.user);
      await loadDashboard(response.data.token, response.data.user);
    } catch (error) {
      Alert.alert('Login gagal', error?.response?.data?.message || 'Periksa nama dan password.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Allow force logout on client side.
    }

    setToken('');
    setUser(null);
    setSchedules([]);
    setAdherence(null);
    setSelectedMedicine(null);
  }

  async function loadDashboard(sessionToken = token, sessionUser = user) {
    if (!sessionToken || !sessionUser) {
      return;
    }

    const apiSession = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${sessionToken}` },
    });

    const paramsForPasien = selectedPatientId ? { pasien_id: Number(selectedPatientId) } : {};

    const scheduleResponse = await apiSession.get('/reminder-obat', {
      params: { ...paramsForPasien },
    });

    const medicineResponse = await apiSession.get('/obat');

    let adherenceResponse = { data: null };
    if (selectedPatientId) {
      adherenceResponse = await apiSession.get('/rekapan-obat', {
        params: { pasien_id: Number(selectedPatientId) },
      });
    }

    setSchedules(scheduleResponse.data || []);
    setMedicines(medicineResponse.data || []);
    setAdherence(adherenceResponse.data && adherenceResponse.data.length > 0 ? adherenceResponse.data[0] : null);
  }

  async function markIntake(scheduleId, status) {
    try {
      await api.put(`/reminder-obat/${scheduleId}`, {
        skor_kepatuhan: status,
      });

      Alert.alert('Berhasil', 'Status kepatuhan berhasil diubah.');
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal mengubah status kepatuhan.');
    }
  }

  async function createSchedule() {
    try {
      await api.post('/reminder-obat', {
        pasien_id: Number(createScheduleForm.pasien_id),
        obat_id: Number(createScheduleForm.obat_id),
        waktu_konsumsi_id: Number(createScheduleForm.waktu_konsumsi_id),
        dosis: createScheduleForm.dosis,
        sediaan: createScheduleForm.sediaan,
        jumlah_obat: Number(createScheduleForm.jumlah_obat),
        cara_pemakaian: createScheduleForm.cara_pemakaian,
      });

      Alert.alert('Berhasil', 'Jadwal obat berhasil dibuat.');
      setCreateScheduleForm((previous) => ({
        ...previous,
        dosis: '',
        sediaan: '',
        cara_pemakaian: '',
        jumlah_obat: '1',
      }));
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal membuat jadwal obat.');
    }
  }

  function openWhatsApp() {
    const medicineName = selectedMedicine?.nama_obat || 'obat';
    const message = encodeURIComponent(
      `Halo, saya ingin bertanya terkait obat ${medicineName}.`
    );
    const phone = '6281234567890';
    const url = `https://wa.me/${phone}?text=${message}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Tidak dapat membuka WhatsApp.');
    });
  }

  if (!token || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Aplikasi Pengingat Obat</Text>
          <Text style={styles.subtitle}>Login Apoteker</Text>

          <TextInput
            placeholder="Nama Apoteker"
            value={loginForm.nama}
            onChangeText={(value) => setLoginForm((previous) => ({ ...previous, nama: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={loginForm.password}
            onChangeText={(value) => setLoginForm((previous) => ({ ...previous, password: value }))}
            style={styles.input}
          />

          <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Memproses...' : 'Masuk'}</Text>
          </Pressable>

          <Text style={styles.hintText}>Akun demo backend seed (Apoteker):</Text>
          <Text style={styles.hintText}>Siti Rahmawati / coba</Text>
          <Text style={styles.hintText}>Budi Santoso / coba</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.dashboardContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Halo, {user.nama}</Text>
            <Text style={styles.subtitle}>Apoteker</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filter Pasien (untuk evaluasi)</Text>
          <TextInput
            placeholder="Masukkan ID Pasien"
            keyboardType="number-pad"
            value={selectedPatientId}
            onChangeText={setSelectedPatientId}
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={() => loadDashboard()}>
            <Text style={styles.buttonText}>Muat Data Pasien</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evaluasi Kepatuhan Mingguan</Text>
          <Text style={styles.metricText}>
            {adherence ? adherence.status_kepatuhan : 'Belum ada data rekapan'}
          </Text>
          {adherence && (
            <Text style={styles.hintText}>
              Minggu mulai: {adherence.minggu_mulai}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tambah Jadwal Obat</Text>
          <TextInput
            placeholder="ID Pasien"
            keyboardType="number-pad"
            value={createScheduleForm.pasien_id}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, pasien_id: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="ID Obat"
            keyboardType="number-pad"
            value={createScheduleForm.obat_id}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, obat_id: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="ID Waktu Konsumsi (1=Pagi, dst)"
            keyboardType="number-pad"
            value={createScheduleForm.waktu_konsumsi_id}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, waktu_konsumsi_id: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Dosis (Contoh: 1 tablet)"
            value={createScheduleForm.dosis}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, dosis: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Sediaan (Contoh: Tablet/Sirup)"
            value={createScheduleForm.sediaan}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, sediaan: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Jumlah Obat Diberikan"
            keyboardType="number-pad"
            value={createScheduleForm.jumlah_obat}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, jumlah_obat: value }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Cara Pemakaian"
            value={createScheduleForm.cara_pemakaian}
            onChangeText={(value) =>
              setCreateScheduleForm((previous) => ({ ...previous, cara_pemakaian: value }))
            }
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={createSchedule}>
            <Text style={styles.buttonText}>Simpan Jadwal</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Reminder Obat</Text>
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listTitle}>{item.obat?.nama_obat || 'Obat'}</Text>
                <Text style={styles.listText}>Dosis: {item.dosis}</Text>
                <Text style={styles.listText}>Cara: {item.cara_pemakaian}</Text>
                <Text style={styles.listText}>Waktu: {item.waktu_konsumsi?.label_waktu}</Text>
                <Text style={styles.listText}>Status: {item.skor_kepatuhan}</Text>

                <View style={styles.listActions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setSelectedMedicine(item.obat || null)}
                  >
                    <Text style={styles.secondaryButtonText}>Detail Obat</Text>
                  </Pressable>

                  <Pressable
                    style={styles.successButton}
                    onPress={() => markIntake(item.id, 'PATUH')}
                  >
                    <Text style={styles.buttonText}>Tandai Patuh</Text>
                  </Pressable>
                  <Pressable
                    style={styles.warningButton}
                    onPress={() => markIntake(item.id, 'TIDAK_PATUH')}
                  >
                    <Text style={styles.buttonText}>Tdk Patuh</Text>
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.hintText}>Belum ada reminder.</Text>}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Obat Tersedia</Text>
          {medicines.map((medicine) => (
            <Pressable key={medicine.id} onPress={() => setSelectedMedicine(medicine)} style={styles.medicineRow}>
              <Text style={styles.listTitle}>{medicine.nama_obat}</Text>
              <Text style={styles.listText}>{medicine.indikasi}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedMedicine)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>{selectedMedicine?.nama_obat}</Text>
            <Text style={styles.listText}>Indikasi: {selectedMedicine?.indikasi}</Text>
            <Text style={styles.listText}>Kontraindikasi: {selectedMedicine?.kontraindikasi}</Text>
            <Text style={styles.listText}>Efek samping: {selectedMedicine?.efek_samping}</Text>
            <Text style={styles.listText}>Monitoring: {selectedMedicine?.monitoring}</Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.primaryButton} onPress={openWhatsApp}>
                <Text style={styles.buttonText}>Tanya via WhatsApp</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setSelectedMedicine(null)}>
                <Text style={styles.secondaryButtonText}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  dashboardContainer: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f2d52',
  },
  subtitle: {
    fontSize: 14,
    color: '#4f6175',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#1f2f46',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a3b66',
  },
  metricText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0a8f65',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c5d1df',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#f9fbfd',
  },
  primaryButton: {
    backgroundColor: '#0f6bbb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: '#e4edf8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#11a474',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#d46b2d',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1e4b7b',
    fontWeight: '600',
  },
  hintText: {
    color: '#55687c',
    fontSize: 13,
    marginTop: 4,
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#dce5ef',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fbfdff',
  },
  listTitle: {
    fontWeight: '700',
    color: '#143a63',
    marginBottom: 2,
  },
  listText: {
    color: '#3e5369',
    marginBottom: 2,
    fontSize: 13,
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  medicineRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ebf0f6',
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    minHeight: 320,
  },
  modalActions: {
    marginTop: 12,
    gap: 8,
  },
});
