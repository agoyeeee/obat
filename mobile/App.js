import { StatusBar } from 'expo-status-bar';
// import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
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

// Temporary disabled for Expo Go debugging.
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStartDateString(date = new Date()) {
  const selectedDate = new Date(date);
  const day = selectedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  selectedDate.setDate(selectedDate.getDate() + diff);
  return selectedDate.toISOString().slice(0, 10);
}

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [schedules, setSchedules] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [createScheduleForm, setCreateScheduleForm] = useState({
    patient_id: '',
    medicine_id: '',
    dosage: '',
    medicine_type: '',
    intake_time: '08:00',
    quantity_given: '1',
    start_date: getTodayDateString(),
    end_date: '',
  });

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  useEffect(() => {
    if (!token || !user || user.role !== 'PASIEN') {
      return;
    }

    // Temporary disabled for Expo Go debugging.
    // requestNotificationPermission()
    //   .then(() => scheduleDailyNotifications(schedules))
    //   .catch(() => {
    //     // Ignore notification errors in MVP mode.
    //   });
  }, [token, user, schedules]);

  // async function requestNotificationPermission() {
  //   const { status } = await Notifications.getPermissionsAsync();
  //   if (status !== 'granted') {
  //     await Notifications.requestPermissionsAsync();
  //   }
  // }

  // async function scheduleDailyNotifications(scheduleItems) {
  //   await Notifications.cancelAllScheduledNotificationsAsync();

  //   for (const schedule of scheduleItems) {
  //     const [hour, minute] = (schedule.intake_time || '08:00:00')
  //       .split(':')
  //       .map((value) => Number(value));

  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: 'Pengingat Minum Obat',
  //         body: `Waktunya minum ${schedule.medicine?.name || 'obat Anda'}`,
  //       },
  //       trigger: {
  //         hour: Number.isNaN(hour) ? 8 : hour,
  //         minute: Number.isNaN(minute) ? 0 : minute,
  //         repeats: true,
  //       },
  //     });
  //   }
  // }

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

    const today = getTodayDateString();
    const weekStart = getWeekStartDateString();

    const paramsForApoteker =
      sessionUser.role === 'APOTEKER' && selectedPatientId
        ? { patient_id: Number(selectedPatientId) }
        : {};

    const scheduleResponse = await apiSession.get('/schedules', {
      params: {
        date: today,
        ...paramsForApoteker,
      },
    });

    const medicineResponse = await apiSession.get('/medicines');

    let adherenceResponse = { data: null };
    if (sessionUser.role === 'PASIEN') {
      adherenceResponse = await apiSession.get('/adherence/weekly', {
        params: { week_start: weekStart },
      });
    }

    if (sessionUser.role === 'APOTEKER' && selectedPatientId) {
      adherenceResponse = await apiSession.get('/adherence/weekly', {
        params: { week_start: weekStart, patient_id: Number(selectedPatientId) },
      });
    }

    setSchedules(scheduleResponse.data || []);
    setMedicines(medicineResponse.data || []);
    setAdherence(adherenceResponse.data);
  }

  async function markIntake(scheduleId, status) {
    try {
      const now = new Date();
      const intakeTime = now.toTimeString().slice(0, 5);

      await api.post('/intake-logs', {
        schedule_id: scheduleId,
        intake_date: getTodayDateString(),
        intake_time: intakeTime,
        status,
      });

      Alert.alert('Berhasil', 'Status konsumsi berhasil disimpan.');
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal menyimpan status konsumsi.');
    }
  }

  async function createSchedule() {
    try {
      await api.post('/schedules', {
        ...createScheduleForm,
        patient_id: Number(createScheduleForm.patient_id),
        medicine_id: Number(createScheduleForm.medicine_id),
        quantity_given: Number(createScheduleForm.quantity_given),
        end_date: createScheduleForm.end_date || null,
      });

      Alert.alert('Berhasil', 'Jadwal obat berhasil dibuat.');
      setCreateScheduleForm((previous) => ({
        ...previous,
        dosage: '',
        medicine_type: '',
        quantity_given: '1',
      }));
      await loadDashboard();
    } catch (error) {
      Alert.alert('Gagal', error?.response?.data?.message || 'Gagal membuat jadwal obat.');
    }
  }

  function openWhatsApp() {
    const patientName = user?.name || 'Pasien';
    const medicineName = selectedMedicine?.name || 'obat';
    const message = encodeURIComponent(
      `Halo, saya pasien atas nama ${patientName}. Saya ingin bertanya terkait obat ${medicineName}.`
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
          <Text style={styles.subtitle}>Login Apoteker atau Pasien</Text>

          <TextInput
            placeholder="Nama"
            value={loginForm.name}
            onChangeText={(value) => setLoginForm((previous) => ({ ...previous, name: value }))}
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

          <Text style={styles.hintText}>Akun demo backend seed:</Text>
          <Text style={styles.hintText}>Apoteker Demo / 19960422</Text>
          <Text style={styles.hintText}>Pasien Demo / 19810422</Text>
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
            <Text style={styles.title}>Halo, {user.name}</Text>
            <Text style={styles.subtitle}>Role: {user.role}</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Logout</Text>
          </Pressable>
        </View>

        {user.role === 'APOTEKER' && (
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
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evaluasi Kepatuhan Mingguan</Text>
          <Text style={styles.metricText}>
            {adherence ? `${adherence.adherence_percent}%` : 'Belum ada data'}
          </Text>
          {adherence && (
            <Text style={styles.hintText}>
              Diminum {adherence.taken_count} dari {adherence.total_schedules} jadwal.
            </Text>
          )}
        </View>

        {user.role === 'APOTEKER' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tambah Jadwal Obat</Text>
            <TextInput
              placeholder="ID Pasien"
              keyboardType="number-pad"
              value={createScheduleForm.patient_id}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, patient_id: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="ID Obat"
              keyboardType="number-pad"
              value={createScheduleForm.medicine_id}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, medicine_id: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Dosis"
              value={createScheduleForm.dosage}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, dosage: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Jenis Obat"
              value={createScheduleForm.medicine_type}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, medicine_type: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Jam Minum (HH:MM)"
              value={createScheduleForm.intake_time}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, intake_time: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Jumlah Diberikan"
              keyboardType="number-pad"
              value={createScheduleForm.quantity_given}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, quantity_given: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Tanggal Mulai (YYYY-MM-DD)"
              value={createScheduleForm.start_date}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, start_date: value }))
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Tanggal Selesai (opsional)"
              value={createScheduleForm.end_date}
              onChangeText={(value) =>
                setCreateScheduleForm((previous) => ({ ...previous, end_date: value }))
              }
              style={styles.input}
            />
            <Pressable style={styles.primaryButton} onPress={createSchedule}>
              <Text style={styles.buttonText}>Simpan Jadwal</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Jadwal Hari Ini</Text>
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listTitle}>{item.medicine?.name || 'Obat'}</Text>
                <Text style={styles.listText}>Jam: {item.intake_time}</Text>
                <Text style={styles.listText}>Dosis: {item.dosage}</Text>
                <Text style={styles.listText}>Jumlah: {item.quantity_given}</Text>

                <View style={styles.listActions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setSelectedMedicine(item.medicine || null)}
                  >
                    <Text style={styles.secondaryButtonText}>Detail Obat</Text>
                  </Pressable>

                  {user.role === 'PASIEN' && (
                    <>
                      <Pressable
                        style={styles.successButton}
                        onPress={() => markIntake(item.id, 'SUDAH_MINUM')}
                      >
                        <Text style={styles.buttonText}>Sudah Minum</Text>
                      </Pressable>
                      <Pressable
                        style={styles.warningButton}
                        onPress={() => markIntake(item.id, 'TIDAK_MINUM')}
                      >
                        <Text style={styles.buttonText}>Tidak Minum</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.hintText}>Belum ada jadwal.</Text>}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Obat Statis</Text>
          {medicines.map((medicine) => (
            <Pressable key={medicine.id} onPress={() => setSelectedMedicine(medicine)} style={styles.medicineRow}>
              <Text style={styles.listTitle}>{medicine.name}</Text>
              <Text style={styles.listText}>{medicine.brand}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selectedMedicine)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>{selectedMedicine?.name}</Text>
            <Text style={styles.listText}>Merk: {selectedMedicine?.brand}</Text>
            <Text style={styles.listText}>Kegunaan: {selectedMedicine?.usage_text}</Text>
            <Text style={styles.listText}>Cara penggunaan: {selectedMedicine?.how_to_use}</Text>
            <Text style={styles.listText}>Perhatian: {selectedMedicine?.warning_text}</Text>
            <Text style={styles.listText}>Efek samping: {selectedMedicine?.side_effects_text}</Text>

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
