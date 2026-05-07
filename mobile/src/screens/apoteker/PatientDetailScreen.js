import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, Droplets, Pill, Calendar, X, Info } from 'lucide-react-native';
import { formatDateDDMMYY } from '../../utils/date';

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
    return { obat: rekapanObat, cairan: rekapanCairan };
  }, [rekapanObat, rekapanCairan]);

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
    <View className="flex-1 bg-[#F0F4F3]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-16 pb-6 px-6 border-b-[1.5px] border-[#EEF0EF]">
        <View className="flex-row items-center mb-5">
          <Pressable 
            onPress={() => navigation.goBack()} 
            className="w-14 h-14 rounded-[18px] bg-[#F4F6F5] items-center justify-center mr-4 active:bg-[#EEF0EF]"
          >
            <ArrowLeft color="#1A2820" size={28} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-black text-[#1A2820] tracking-tight">Pantau Pasien</Text>
            {pasien && <Text className="text-base font-bold text-[#0D7A6A] mt-1">{pasien.nama}</Text>}
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
              className={`px-5 py-3 rounded-full border-2 mr-3 ${selectedMonth === opt.month && selectedYear === opt.year ? 'bg-[#0D7A6A] border-[#0D7A6A]' : 'bg-white border-[#EEF0EF]'}`}
            >
              <Text className={`text-sm font-extrabold ${selectedMonth === opt.month && selectedYear === opt.year ? 'text-white' : 'text-[#9DB0AA]'}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <View className="w-3" />
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0D7A6A" className="mt-10" />
        ) : (
          <>
            {/* Rekap Obat Section */}
            <View>
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-[#E8F8F3] items-center justify-center mr-3">
                    <Pill color="#0D7A6A" size={24} />
                  </View>
                  <Text className="text-xl font-black text-[#1A2820]">Obat</Text>
                </View>
                <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-widest">{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.obat.length > 0 ? (
                filteredData.obat.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('obat', rekap.minggu_mulai)}
                      className="bg-white rounded-[28px] p-6 border-[1.5px] border-[#EEF0EF] mb-4 flex-row items-center justify-between shadow-sm shadow-black/5 active:bg-[#F8FAFA]"
                    >
                      <View>
                        <Text className="text-lg font-black text-[#1A2820]">Minggu ke-{weekNum}</Text>
                        <Text className="text-xs font-bold text-[#9DB0AA] mt-1">{formatDateDDMMYY(rekap.minggu_mulai)}</Text>
                        <View className={`self-start px-3 py-1.5 rounded-full mt-3 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          <Text className={`text-xs font-black uppercase tracking-wider ${isPatuh ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-14 h-14 rounded-full items-center justify-center ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                        {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View className="bg-white rounded-[28px] p-10 items-center border-[1.5px] border-[#EEF0EF]">
                  <Calendar color="#CBD5E1" size={56} />
                  <Text className="text-[#9DB0AA] text-base font-bold mt-4">Tidak ada data obat</Text>
                </View>
              )}
            </View>

            {/* Rekap Cairan Section */}
            <View className="mt-8">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-3">
                    <Droplets color="#3B82F6" size={24} />
                  </View>
                  <Text className="text-xl font-black text-[#1A2820]">Cairan</Text>
                </View>
                <Text className="text-xs font-extrabold text-[#9DB0AA] uppercase tracking-widest">{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.cairan.length > 0 ? (
                filteredData.cairan.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('cairan', rekap.minggu_mulai)}
                      className="bg-white rounded-[28px] p-6 border-[1.5px] border-[#EEF0EF] mb-4 flex-row items-center justify-between shadow-sm shadow-black/5 active:bg-[#F8FAFA]"
                    >
                      <View>
                        <Text className="text-lg font-black text-[#1A2820]">Minggu ke-{weekNum}</Text>
                        <Text className="text-xs font-bold text-[#9DB0AA] mt-1">{formatDateDDMMYY(rekap.minggu_mulai)}</Text>
                        <View className={`self-start px-3 py-1.5 rounded-full mt-3 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          <Text className={`text-xs font-black uppercase tracking-wider ${isPatuh ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-14 h-14 rounded-full items-center justify-center ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                        {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View className="bg-white rounded-[28px] p-10 items-center border-[1.5px] border-[#EEF0EF]">
                  <Calendar color="#CBD5E1" size={56} />
                  <Text className="text-[#9DB0AA] text-base font-bold mt-4">Tidak ada data cairan</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showModal === true} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 bg-[#1A2820]/80 justify-end">
          <View className="bg-white rounded-t-[40px] overflow-hidden h-[85%]">
            <View className="flex-row items-center justify-between p-7 border-b-[1.5px] border-[#EEF0EF]">
              <View className="flex-1">
                <Text className="text-xl font-black text-[#1A2820]">Detail Harian</Text>
                <Text className="text-sm font-bold text-[#9DB0AA] mt-1">
                  {detailData?.minggu_mulai ? `Mulai ${formatDateDDMMYY(detailData.minggu_mulai)}` : 'Memuat...'}
                </Text>
              </View>
              <Pressable 
                onPress={() => setShowModal(false)} 
                className="w-14 h-14 rounded-full bg-[#F0F4F3] items-center justify-center active:bg-[#E8F8F3]"
              >
                <X color="#1A2820" size={28} />
              </Pressable>
            </View>

            <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 60 }}>
              {isDetailLoading ? (
                <ActivityIndicator size="large" color="#0D7A6A" className="mt-10" />
              ) : (detailData?.detail_harian && Object.keys(detailData.detail_harian).length > 0) ? (
                Object.entries(detailData.detail_harian).sort((a, b) => a[0].localeCompare(b[0])).map(([date, logs], dayIdx) => (
                  <View key={dayIdx} className="mb-8">
                    <View className="flex-row items-center mb-4 px-2">
                      <View className="w-2.5 h-2.5 rounded-full bg-[#0D7A6A] mr-3" />
                      <Text className="text-lg font-black text-[#1A2820] uppercase tracking-wide">
                        {formatDateDDMMYY(date)}
                      </Text>
                    </View>
                    
                    {logs.map((item, idx) => (
                      <View key={idx} className="bg-[#F8FAFA] rounded-[24px] p-5 mb-3 border-[1.5px] border-[#EEF0EF] flex-row items-center">
                        <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${detailData.type === 'obat' ? 'bg-[#E8F8F3]' : 'bg-blue-50'}`}>
                          {detailData.type === 'obat' ? <Pill color="#0D7A6A" size={28} /> : <Droplets color="#3B82F6" size={28} />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-extrabold text-[#1A2820]">
                            {detailData.type === 'obat' ? item.reminder_obat?.obat?.nama : `${item.reminder_cairan?.jumlah_ml} ml`}
                          </Text>
                          <Text className="text-xs font-bold text-[#9DB0AA] mt-1 uppercase tracking-wider">
                            {item.waktu} {item.reminder_obat?.merk ? `• ${item.reminder_obat.merk.nama}` : ''}
                          </Text>
                        </View>
                        <View className={`px-3 py-1.5 rounded-xl ml-2 ${item.status === 'diminum' ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          <Text className={`text-xs font-black tracking-wider ${item.status === 'diminum' ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                            {item.status === 'diminum' ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View className="items-center py-16">
                  <Info color="#CBD5E1" size={64} />
                  <Text className="text-[#9DB0AA] text-base font-bold mt-5">Data tidak ditemukan</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}