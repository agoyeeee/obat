import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, Droplets, Pill, Calendar, X, Info } from 'lucide-react-native';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function PatientDetailScreen({ route, navigation }) {
  const { pasien_id } = route.params;
  
  const [pasien, setPasien] = useState(null);
  const [rekapanObat, setRekapanObat] = useState([]);
  const [rekapanCairan, setRekapanCairan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Detail Modal State
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setIsLoading(true);
        const [pasienRes, monitoringRes] = await Promise.all([
          api.get(`/pasien/${pasien_id}`),
          api.get(`/monitoring/bulanan?pasien_id=${pasien_id}&month=${selectedMonth}&year=${selectedYear}`)
        ]);

        setPasien(pasienRes.data);
        // Map backend response to separate states for backward compatibility if needed, 
        // or just use monitoringRes.data.weeks
        setRekapanObat(monitoringRes.data.weeks.map(w => ({ ...w, ...w.obat })));
        setRekapanCairan(monitoringRes.data.weeks.map(w => ({ ...w, ...w.cairan })));
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (pasien_id) {
      fetchMonitoringData();
    }
  }, [pasien_id, selectedMonth, selectedYear]);

  const handleShowDetail = async (type, startDate) => {
    try {
      setIsDetailLoading(true);
      setShowModal(true);
      const res = await api.get(`/monitoring/mingguan?pasien_id=${pasien_id}&start_date=${startDate}`);
      
      // Adapt detailData to what the modal expects
      const logs = type === 'obat' ? res.data.obat.logs : res.data.cairan.logs;
      setDetailData({ 
        detail_harian: logs,
        minggu_mulai: startDate,
        type 
      });
    } catch (error) {
      console.error('Error fetching detail:', error);
      setShowModal(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getWeekOfMonth = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    return Math.ceil(day / 7);
  };

  const filteredData = useMemo(() => {
    return {
      obat: rekapanObat,
      cairan: rekapanCairan
    };
  }, [rekapanObat, rekapanCairan]);

  // Generate last 6 months for filter
  const filterOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }
    return options;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F3' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#FFFFFF', paddingTop: 64, paddingBottom: 24, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={({ pressed }) => ({
              width: 52, height: 52, borderRadius: 18, 
              backgroundColor: pressed ? '#EEF0EF' : '#F4F6F5', 
              alignItems: 'center', justifyContent: 'center', marginRight: 18
            })}
          >
            <ArrowLeft color="#1A2820" size={28} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#1A2820', letterSpacing: -0.8 }}>Pantau Pasien</Text>
            {pasien && <Text style={{ fontSize: 18, fontWeight: '700', color: '#0D7A6A' }}>{pasien.nama}</Text>}
          </View>
        </View>

        {/* Month Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((opt, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                setSelectedMonth(opt.month);
                setSelectedYear(opt.year);
              }}
              style={{
                paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 2,
                backgroundColor: selectedMonth === opt.month && selectedYear === opt.year ? '#0D7A6A' : '#FFFFFF',
                borderColor: selectedMonth === opt.month && selectedYear === opt.year ? '#0D7A6A' : '#EEF0EF'
              }}
            >
              <Text style={{ 
                fontSize: 15, fontWeight: '800', 
                color: selectedMonth === opt.month && selectedYear === opt.year ? '#FFFFFF' : '#9DB0AA' 
              }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <View style={{ width: 12 }} />
        </ScrollView>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0D7A6A" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Rekap Obat Section */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#E8F8F3', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Pill color="#0D7A6A" size={24} />
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A2820' }}>Obat</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#9DB0AA', textTransform: 'uppercase' }}>{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.obat.length > 0 ? (
                filteredData.obat.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('obat', rekap.minggu_mulai)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? '#F8FAFA' : '#FFFFFF',
                        borderRadius: 28, padding: 22, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 14,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
                      })}
                    >
                      <View>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A2820' }}>Minggu ke-{weekNum}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>{rekap.minggu_mulai}</Text>
                        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 10, backgroundColor: isPatuh ? '#E8F8F3' : '#FFF0F2' }}>
                          <Text style={{ fontSize: 13, fontWeight: '900', color: isPatuh ? '#0D7A6A' : '#F43F5E', textTransform: 'uppercase' }}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: isPatuh ? '#E8F8F3' : '#FFF0F2' }}>
                        {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 40, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
                  <Calendar color="#CBD5E1" size={56} />
                  <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Tidak ada data obat</Text>
                </View>
              )}
            </View>

            {/* Rekap Cairan Section */}
            <View style={{ marginTop: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#EFF4FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Droplets color="#3B82F6" size={24} />
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#1A2820' }}>Cairan</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#9DB0AA', textTransform: 'uppercase' }}>{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.cairan.length > 0 ? (
                filteredData.cairan.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('cairan', rekap.minggu_mulai)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? '#F8FAFA' : '#FFFFFF',
                        borderRadius: 28, padding: 22, borderWidth: 1.5, borderColor: '#EEF0EF', marginBottom: 14,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
                      })}
                    >
                      <View>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A2820' }}>Minggu ke-{weekNum}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>{rekap.minggu_mulai}</Text>
                        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 10, backgroundColor: isPatuh ? '#E8F8F3' : '#FFF0F2' }}>
                          <Text style={{ fontSize: 13, fontWeight: '900', color: isPatuh ? '#0D7A6A' : '#F43F5E', textTransform: 'uppercase' }}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: isPatuh ? '#E8F8F3' : '#FFF0F2' }}>
                        {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 40, alignItems: 'center', borderWidth: 1.5, borderColor: '#EEF0EF' }}>
                  <Calendar color="#CBD5E1" size={56} />
                  <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Tidak ada data cairan</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showModal === true} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(26,40,32,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', height: '85%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 28, borderBottomWidth: 1.5, borderBottomColor: '#EEF0EF' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: '#1A2820' }}>Detail Harian</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#9DB0AA', marginTop: 4 }}>
                  {detailData?.minggu_mulai ? `Mulai ${detailData.minggu_mulai}` : 'Memuat...'}
                </Text>
              </View>
              <Pressable 
                onPress={() => setShowModal(false)} 
                style={({ pressed }) => ({
                  width: 56, height: 56, borderRadius: 28, 
                  backgroundColor: pressed ? '#F4F6F5' : '#F0F4F3', 
                  alignItems: 'center', justifyContent: 'center'
                })}
              >
                <X color="#1A2820" size={28} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: 22 }} contentContainerStyle={{ paddingBottom: 60 }}>
              {isDetailLoading ? (
                <ActivityIndicator size="large" color="#0D7A6A" style={{ marginTop: 40 }} />
              ) : (detailData?.detail_harian && Object.keys(detailData.detail_harian).length > 0) ? (
                Object.entries(detailData.detail_harian).sort((a, b) => a[0].localeCompare(b[0])).map(([date, logs], dayIdx) => (
                  <View key={dayIdx} style={{ marginBottom: 32 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0D7A6A', marginRight: 12 }} />
                      <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A2820', textTransform: 'uppercase' }}>
                        {date}
                      </Text>
                    </View>
                    
                    {logs.map((item, idx) => (
                      <View key={idx} style={{ backgroundColor: '#F8FAFA', borderRadius: 24, padding: 22, marginBottom: 12, borderWidth: 1.5, borderColor: '#EEF0EF', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 18, backgroundColor: detailData.type === 'obat' ? '#E8F8F3' : '#EFF4FF' }}>
                          {detailData.type === 'obat' ? <Pill color="#0D7A6A" size={28} /> : <Droplets color="#3B82F6" size={28} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A2820' }}>
                            {detailData.type === 'obat' ? item.reminder_obat?.obat?.nama : `${item.reminder_cairan?.jumlah_ml} ml`}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#9DB0AA', marginTop: 4, textTransform: 'uppercase' }}>
                            {item.waktu} {item.reminder_obat?.merk ? `• ${item.reminder_obat.merk.nama}` : ''}
                          </Text>
                        </View>
                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: item.status === 'diminum' ? '#E8F8F3' : '#FFF0F2' }}>
                            {item.status === 'diminum' ? 'PATUH' : 'TIDAK PATUH'}
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <Info color="#CBD5E1" size={64} />
                  <Text style={{ color: '#9DB0AA', fontSize: 18, fontWeight: '700', marginTop: 20 }}>Data tidak ditemukan</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}