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
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, ClipboardList } from 'lucide-react-native';
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
    if (kuisioner.tipe === 'ya_tidak') return ['Ya', 'Tidak'];
    return kuisioner.opsi || [];
  };

  const calculateSkor = (kuisioner, selectedOpsi) => {
    if (kuisioner.tipe === 'ya_tidak') return selectedOpsi === 'Ya' ? 1 : 0;
    return getOpsi(kuisioner).indexOf(selectedOpsi);
  };

  const handleSelectAnswer = (kuisionerId, opsi) => {
    setAnswers({ ...answers, [kuisionerId]: opsi });
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

  const answeredCount = Object.keys(answers).length;
  const progressPercent = kuisioners.length > 0 ? (answeredCount / kuisioners.length) * 100 : 0;
  const isComplete = kuisioners.length > 0 && answeredCount === kuisioners.length;

  if (loading && kuisioners.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF', paddingTop: insets.top }}>

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#F59E0B', '#FCD34D', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 20,
          paddingBottom: 30,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        {/* Decorative circles */}
        <View style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: 90,
          backgroundColor: '#ffffff18',
        }} />
        <View style={{
          position: 'absolute', top: 30, right: 60,
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: '#ffffff10',
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <TouchableOpacity
              onPress={handleBackPress}
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
              <Text style={{
                color: '#FAE8B6', fontSize: 10, letterSpacing: 1.5,
                textTransform: 'uppercase', fontWeight: '700',
              }}>
                Evaluasi Pasien
              </Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
                Kuesioner
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

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PROGRESS CARD (floating) ── */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 25,
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: 20,
          shadowColor: '#F59E0B',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                Progress
              </Text>
              <Text style={{ color: '#1E293B', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                {answeredCount} dari {kuisioners.length}
              </Text>
            </View>
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: '#FEF3C7',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#92400E', fontSize: 16, fontWeight: '900' }}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
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

          <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 10 }}>
            Selesaikan semua soal untuk melanjutkan
          </Text>
        </View>

        {/* ── QUESTIONS ── */}
        {kuisioners.length > 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            {kuisioners.map((kuisioner, index) => {
              const opsiList = getOpsi(kuisioner);

              return (
                <View key={kuisioner.id} style={{ marginBottom: 24 }}>
                  {/* Question header */}
                  <View style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={{
                        width: 28, height: 28, borderRadius: 50,
                        backgroundColor: '#FEF3C7',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ color: '#92400E', fontWeight: '900', fontSize: 12 }}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={{
                        color: '#94A3B8', fontSize: 11, fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: 1,
                      }}>
                        Soal {index + 1} dari {kuisioners.length}
                      </Text>
                    </View>
                    <Text style={{
                      color: '#1E293B', fontWeight: '800', fontSize: 15, lineHeight: 22,
                    }}>
                      {kuisioner.pertanyaan}
                    </Text>
                  </View>

                  {/* Answer options */}
                  <View style={{ gap: 10 }}>
                    {opsiList.map((opsi, opsiIndex) => {
                      const isSelected = answers[kuisioner.id] === opsi;
                      return (
                        <TouchableOpacity
                          key={opsiIndex}
                          onPress={() => handleSelectAnswer(kuisioner.id, opsi)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={isSelected ? ['#FEF3C7', '#FDE68A'] : ['#fff', '#fff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderRadius: 16,
                              borderWidth: 2,
                              borderColor: isSelected ? '#F59E0B' : '#E2E8F0',
                              shadowColor: isSelected ? '#F59E0B' : '#64748B',
                              shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                              shadowOpacity: isSelected ? 0.25 : 0.06,
                              shadowRadius: isSelected ? 12 : 8,
                              elevation: isSelected ? 6 : 2,
                            }}
                          >
                            {/* Radio button */}
                            <View style={{
                              width: 20, height: 20, borderRadius: 10,
                              borderWidth: 2,
                              borderColor: isSelected ? '#F59E0B' : '#CBD5E1',
                              backgroundColor: isSelected ? '#F59E0B' : 'transparent',
                              alignItems: 'center', justifyContent: 'center',
                              marginRight: 12,
                            }}>
                              {isSelected && <Check color="#fff" size={12} strokeWidth={3} />}
                            </View>

                            {/* Option text */}
                            <Text style={{
                              flex: 1,
                              fontSize: 14,
                              fontWeight: isSelected ? '800' : '600',
                              color: isSelected ? '#92400E' : '#475569',
                            }}>
                              {opsi}
                            </Text>

                            {isSelected && (
                              <View style={{
                                width: 24, height: 24, borderRadius: 50,
                                backgroundColor: '#F59E0B',
                                alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Check color="#fff" size={14} strokeWidth={3} />
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Divider */}
                  {index < kuisioners.length - 1 && (
                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginTop: 24 }} />
                  )}
                </View>
              );
            })}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isComplete || loading}
              activeOpacity={0.85}
              style={{ marginTop: 12, marginBottom: 20 }}
            >
              <LinearGradient
                colors={isComplete && !loading ? ['#F59E0B', '#FCD34D'] : ['#E2E8F0', '#E2E8F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  borderRadius: 18,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isComplete && !loading ? 0.4 : 0,
                  shadowRadius: 16,
                  elevation: isComplete && !loading ? 8 : 0,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color={isComplete ? '#92400E' : '#94A3B8'} />
                    <Text style={{
                      color: isComplete ? '#92400E' : '#94A3B8',
                      fontWeight: '800', fontSize: 15, letterSpacing: 0.3,
                    }}>
                      Menyimpan...
                    </Text>
                  </>
                ) : (
                  <Text style={{
                    color: isComplete ? '#92400E' : '#94A3B8',
                    fontWeight: '800', fontSize: 15, letterSpacing: 0.3,
                  }}>
                    Simpan Jawaban Kuesioner
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Incomplete warning */}
            {!isComplete && (
              <View style={{
                backgroundColor: '#FEF3C7', borderRadius: 14,
                paddingHorizontal: 14, paddingVertical: 10,
                marginBottom: 20,
                flexDirection: 'row', gap: 8,
                alignItems: 'center',
              }}>
                <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '600', flex: 1 }}>
                  Jawab {kuisioners.length - answeredCount} pertanyaan lagi untuk melanjutkan
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
              Tidak ada kuesioner tersedia saat ini
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PatientKuisionerListScreen;