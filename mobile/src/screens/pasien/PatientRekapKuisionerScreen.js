import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { fetchKuisionerDetail } from '../../services/patientService';

const PatientRekapKuisionerScreen = ({ route, navigation }) => {
  const { rekapId } = route.params;
  const insets = useSafeAreaInsets();
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchKuisionerDetail(rekapId);
      setRekap(data);
    } catch (error) {
      console.error('Error loading rekap:', error);
      Alert.alert('Error', 'Tidak dapat memuat detail kuesioner.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Calculate majority vote
  const calculateMajorityVote = () => {
    if (!rekap || !rekap.jawabanKuisioner || rekap.jawabanKuisioner.length === 0) {
      return 'Tidak Ada Data';
    }

    const totalSkor = rekap.jawabanKuisioner.reduce((sum, j) => sum + j.skor, 0);
    const average = totalSkor / rekap.jawabanKuisioner.length;

    // Majority voting: if average > 0.5, result is "Ya"
    // Otherwise "Tidak"
    return average > 0.5 ? 'Ya' : 'Tidak';
  };

  // Calculate percentage
  const calculatePercentage = () => {
    if (!rekap || !rekap.jawabanKuisioner || rekap.jawabanKuisioner.length === 0) {
      return 0;
    }
    const totalSkor = rekap.jawabanKuisioner.reduce((sum, j) => sum + j.skor, 0);
    return Math.round((totalSkor / rekap.jawabanKuisioner.length) * 100);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!rekap) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Data tidak ditemukan</Text>
      </View>
    );
  }

  const majorityVote = calculateMajorityVote();
  const percentage = calculatePercentage();

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
          <Text className="text-xl font-bold text-gray-800">Detail Kuesioner</Text>
          <Text className="text-sm text-gray-600 mt-1">
            {new Date(rekap.tanggal).toLocaleDateString('id-ID')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Score Summary */}
        <View className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <Text className="text-sm text-gray-600 font-semibold mb-4 uppercase tracking-wide">
            Ringkasan Skor
          </Text>

          {/* Main Score */}
          <View className="items-center mb-6">
            <Text className="text-5xl font-bold text-blue-600">{percentage}%</Text>
            <Text className="text-lg text-gray-700 mt-2">
              Skor Total: {rekap.total_skor}
            </Text>
          </View>

          {/* Majority Vote */}
          <View className="bg-blue-50 rounded-lg p-4 items-center border-2 border-blue-200">
            <Text className="text-sm text-blue-600 font-semibold mb-2">
              HASIL AKHIR (RATA-RATA)
            </Text>
            <Text className={`
              text-2xl font-bold
              ${majorityVote === 'Ya' ? 'text-green-600' : 'text-red-600'}
            `}>
              {majorityVote}
            </Text>
            <Text className="text-xs text-gray-600 mt-2">
              {rekap.jawabanKuisioner.length} pertanyaan
            </Text>
          </View>
        </View>

        {/* Detailed Answers */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Jawaban Rinci</Text>

          {rekap.jawabanKuisioner.map((jawaban, index) => (
            <View key={jawaban.id} className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
              <View className="mb-3">
                <Text className="text-sm text-blue-600 font-semibold">
                  Soal {index + 1}
                </Text>
                <Text className="text-base text-gray-800 font-medium mt-1">
                  {jawaban.kuisioner?.pertanyaan}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-600">Jawaban:</Text>
                  <Text className="text-base text-gray-800 font-semibold mt-1">
                    {jawaban.jawaban}
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-full px-3 py-2">
                  <Text className="text-blue-700 font-bold text-sm">
                    Skor: {jawaban.skor}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Score Breakdown */}
        <View className="bg-gray-100 rounded-lg p-4 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Penjelasan Skor</Text>
          <Text className="text-xs text-gray-600 leading-5">
            • Setiap pertanyaan dijawab dengan opsi yang tersedia{'\n'}
            • Skor dihitung berdasarkan jawaban: Ya = 1, Tidak = 0{'\n'}
            • Hasil akhir = Rata-rata skor semua pertanyaan{'\n'}
            • Jika rata-rata lebih dari 50%, hasil = "Ya"{'\n'}
            • Jika rata-rata 50% ke bawah, hasil = "Tidak"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientRekapKuisionerScreen;
