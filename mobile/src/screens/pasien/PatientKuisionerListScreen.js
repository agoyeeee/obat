import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { fetchAllKuisioner, submitKuisionerAnswers } from '../../services/patientService';
import { getPatientProfile } from '../../storage/patientStorage';

const PatientKuisionerListScreen = ({ route, navigation, onBack }) => {
  const { patientProfile } = route.params;
  const insets = useSafeAreaInsets();
  const [kuisioners, setKuisioners] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[PatientKuisionerList] Profile:', patientProfile);
    console.log('[PatientKuisionerList] Patient ID:', patientProfile?.id);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const kuisionerData = await fetchAllKuisioner();

      setKuisioners(kuisionerData);
      const storedProfile = patientProfile?.id ? patientProfile : await getPatientProfile();

      if (!storedProfile?.id) {
        console.warn('[PatientKuisionerList] Missing patient ID, questionnaire can still be answered but submission will be blocked');
      }
    } catch (error) {
      console.error('Error loading kuisioner:', error);
      setKuisioners([]);
    } finally {
      setLoading(false);
    }
  };

  const getOpsi = (kuisioner) => {
    if (kuisioner.tipe === 'ya_tidak') {
      return ['Ya', 'Tidak'];
    }

    return kuisioner.opsi || [];
  };

  const calculateSkor = (kuisioner, selectedOpsi) => {
    if (kuisioner.tipe === 'ya_tidak') {
      return selectedOpsi === 'Ya' ? 1 : 0;
    }

    return getOpsi(kuisioner).indexOf(selectedOpsi);
  };

  const handleSelectAnswer = (kuisionerId, opsi) => {
    setAnswers({
      ...answers,
      [kuisionerId]: opsi,
    });
  };

  const handleSubmit = async () => {
    const storedProfile = patientProfile?.id ? patientProfile : await getPatientProfile();

    if (!storedProfile?.id) {
      Alert.alert(
        'Profil pasien belum lengkap',
        'Simpan ulang biodata pasien terlebih dahulu agar sistem memiliki ID pasien.'
      );
      return;
    }

    const unansweredCount = kuisioners.filter((kuisioner) => !answers[kuisioner.id]).length;

    if (unansweredCount > 0) {
      Alert.alert('Perhatian', `Silakan jawab semua pertanyaan (${unansweredCount} belum dijawab)`);
      return;
    }

    try {
      setLoading(true);

      const jawabanArray = kuisioners.map((kuisioner) => ({
        kuisioner_id: kuisioner.id,
        jawaban: answers[kuisioner.id],
        skor: calculateSkor(kuisioner, answers[kuisioner.id]),
      }));

      await submitKuisionerAnswers(
        storedProfile.id,
        new Date().toISOString().split('T')[0],
        jawabanArray
      );

      Alert.alert('Sukses', 'Kuesioner berhasil disimpan!', [
        {
          text: 'OK',
          onPress: () => {
            if (onBack) {
              onBack();
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error submitting kuisioner:', error);
      Alert.alert('Error', 'Gagal menyimpan kuesioner. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header with Back Button */}
      <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={handleBackPress} className="mr-3">
          <ChevronLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">Kuesioner</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Jawab semua pertanyaan lalu tekan submit
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        className="flex-1 px-4 py-4"
      >
        {kuisioners.length > 0 ? (
          <View>
            {kuisioners.map((kuisioner, index) => {
              const opsiList = getOpsi(kuisioner);

              return (
                <View key={kuisioner.id} className="mb-6 bg-white rounded-3xl p-4 border border-gray-200">
                  <Text className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    Soal {index + 1}
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold mt-2">
                    {kuisioner.pertanyaan}
                  </Text>

                  <View className="mt-4 gap-2">
                    {opsiList.map((opsi, opsiIndex) => {
                      const isSelected = answers[kuisioner.id] === opsi;

                      return (
                        <TouchableOpacity
                          key={opsiIndex}
                          onPress={() => handleSelectAnswer(kuisioner.id, opsi)}
                          className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                            isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
                          }`}
                        >
                          <View
                            className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                            }`}
                          >
                            {isSelected && <Check color="white" size={14} />}
                          </View>
                          <Text className={`flex-1 text-base ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>
                            {opsi}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={Object.keys(answers).length < kuisioners.length || loading}
              className={`py-4 px-4 rounded-2xl mt-2 mb-6 ${
                Object.keys(answers).length === kuisioners.length ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-center text-base">Submit Jawaban</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-center">
              Tidak ada kuesioner tersedia saat ini
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PatientKuisionerListScreen;
