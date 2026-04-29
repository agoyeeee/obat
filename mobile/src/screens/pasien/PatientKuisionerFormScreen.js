import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Check, ChevronLeft } from 'lucide-react-native';
import { submitKuisionerAnswers } from '../../services/patientService';
import { getPatientProfile } from '../../storage/patientStorage';

const PatientKuisionerFormScreen = ({ route, navigation }) => {
  const { patientProfile, kuisioners, onAnswered } = route.params;
  const insets = useSafeAreaInsets();

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  // Helper function to get default opsi based on tipe
  const getOpsi = (kuisioner) => {
    if (kuisioner.tipe === 'ya_tidak') {
      return ['Ya', 'Tidak'];
    }
    return kuisioner.opsi || [];
  };

  // Helper function to calculate skor based on tipe and opsi
  const calculateSkor = (kuisioner, selectedOpsi) => {
    if (kuisioner.tipe === 'ya_tidak') {
      return selectedOpsi === 'Ya' ? 1 : 0;
    }
    // For skala and pilihan, skor is the index
    const opsi = getOpsi(kuisioner);
    return opsi.indexOf(selectedOpsi);
  };

  // Handle answer selection
  const handleSelectAnswer = (kuisionerId, opsi) => {
    setAnswers({
      ...answers,
      [kuisionerId]: opsi,
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    const storedProfile = patientProfile?.id ? patientProfile : await getPatientProfile();

    if (!storedProfile?.id) {
      Alert.alert(
        'Profil pasien belum lengkap',
        'Simpan ulang biodata pasien terlebih dahulu agar sistem memiliki ID pasien.'
      );
      return;
    }

    // Check if all questions answered
    const unansweredCount = kuisioners.filter(
      (k) => !answers[k.id]
    ).length;

    if (unansweredCount > 0) {
      Alert.alert('Perhatian', `Silakan jawab semua pertanyaan (${unansweredCount} belum dijawab)`);
      return;
    }

    try {
      setLoading(true);

      // Prepare jawaban array
      const jawabanArray = kuisioners.map((kuisioner) => ({
        kuisioner_id: kuisioner.id,
        jawaban: answers[kuisioner.id],
        skor: calculateSkor(kuisioner, answers[kuisioner.id]),
      }));

      // Submit to backend
      await submitKuisionerAnswers(
        storedProfile.id,
        new Date().toISOString().split('T')[0],
        jawabanArray
      );

      Alert.alert('Sukses', 'Kuesioner berhasil disimpan!', [
        {
          text: 'OK',
          onPress: () => {
            if (onAnswered) {
              onAnswered();
            }
            navigation.goBack();
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

  const answeredCount = Object.keys(answers).length;

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header with Back Button */}
      <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">Isi Kuesioner</Text>
          <Text className="text-sm text-gray-600 mt-1">
            {answeredCount} dari {kuisioners.length} soal dijawab
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <View
            className="bg-blue-500 h-full"
            style={{
              width: `${(answeredCount / kuisioners.length) * 100}%`,
            }}
          />
        </View>
      </View>

      {/* Questions */}
      <ScrollView className="flex-1 px-4 py-4">
        {kuisioners.map((kuisioner, index) => (
          <View key={kuisioner.id} className="mb-6">
            {/* Question Number and Text */}
            <View className="mb-3">
              <Text className="text-sm text-blue-600 font-semibold">
                Soal {index + 1}
              </Text>
              <Text className="text-base text-gray-800 font-medium mt-1">
                {kuisioner.pertanyaan}
              </Text>
            </View>

            {/* Answer Options */}
            <View className="space-y-2">
              {getOpsi(kuisioner).map((opsi, opsiIndex) => {
                const isSelected = answers[kuisioner.id] === opsi;
                return (
                  <TouchableOpacity
                    key={opsiIndex}
                    onPress={() => handleSelectAnswer(kuisioner.id, opsi)}
                    className={`
                      flex-row items-center px-4 py-3 rounded-lg border-2
                      ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200'
                      }
                    `}
                  >
                    {/* Radio Button */}
                    <View
                      className={`
                        w-5 h-5 rounded-full border-2 mr-3 items-center justify-center
                        ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                        }
                      `}
                    >
                      {isSelected && <Check color="white" size={14} />}
                    </View>

                    {/* Option Text */}
                    <Text
                      className={`
                        flex-1 text-base
                        ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-700'}
                      `}
                    >
                      {opsi}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Divider */}
            {index < kuisioners.length - 1 && (
              <View className="border-b border-gray-200 mt-6" />
            )}
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={answeredCount < kuisioners.length || loading}
          className={`
            py-4 px-4 rounded-lg mt-6 mb-6
            ${
              answeredCount === kuisioners.length
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }
          `}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-center text-base">
              Simpan Jawaban
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PatientKuisionerFormScreen;
