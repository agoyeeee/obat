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
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-slate-100 shadow-sm z-10">
        <View className="flex-row items-center mt-2 mb-4">
          <Pressable onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3 active:bg-slate-100">
            <ArrowLeft color="#0F172A" size={20} />
          </Pressable>
          <View>
            <Text className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pantau Kepatuhan
            </Text>
            {pasien && <Text className="text-sm font-semibold text-slate-500">{pasien.nama}</Text>}
          </View>
        </View>

        {/* Month Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {filterOptions.map((opt, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                setSelectedMonth(opt.month);
                setSelectedYear(opt.year);
              }}
              className={`mr-2 px-4 py-2 rounded-full border ${
                selectedMonth === opt.month && selectedYear === opt.year
                  ? 'bg-teal-600 border-teal-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedMonth === opt.month && selectedYear === opt.year ? 'text-white' : 'text-slate-500'
              }`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
        ) : (
          <>
            {/* Rekap Obat Section */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-teal-100 items-center justify-center mr-2">
                    <Pill color="#0D9488" size={16} />
                  </View>
                  <Text className="text-lg font-extrabold text-slate-900">Obat</Text>
                </View>
                <Text className="text-xs font-bold text-slate-400 uppercase">{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.obat.length > 0 ? (
                filteredData.obat.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('obat', rekap.minggu_mulai)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex-row items-center justify-between active:bg-slate-50"
                    >
                      <View>
                        <Text className="text-base font-black text-slate-900">Minggu ke-{weekNum}</Text>
                        <Text className="text-[10px] font-bold text-slate-400 mb-1">{rekap.minggu_mulai}</Text>
                        <View className={`self-start px-2 py-0.5 rounded-full ${isPatuh ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                          <Text className={`text-[10px] font-black ${isPatuh ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {rekap.status_kepatuhan}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${isPatuh ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {isPatuh ? <CheckCircle color="#10B981" size={20} /> : <XCircle color="#F43F5E" size={20} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center border border-dashed border-slate-200">
                  <Calendar color="#CBD5E1" size={32} />
                  <Text className="text-slate-400 font-bold mt-2">Tidak ada data obat</Text>
                </View>
              )}
            </View>

            {/* Rekap Cairan Section */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                    <Droplets color="#3B82F6" size={16} />
                  </View>
                  <Text className="text-lg font-extrabold text-slate-900">Cairan</Text>
                </View>
                <Text className="text-xs font-bold text-slate-400 uppercase">{MONTHS[selectedMonth]}</Text>
              </View>

              {filteredData.cairan.length > 0 ? (
                filteredData.cairan.map((rekap) => {
                  const isPatuh = rekap.status_kepatuhan === 'PATUH';
                  const weekNum = getWeekOfMonth(rekap.minggu_mulai);
                  return (
                    <Pressable 
                      key={rekap.minggu_mulai} 
                      onPress={() => handleShowDetail('cairan', rekap.minggu_mulai)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex-row items-center justify-between active:bg-slate-50"
                    >
                      <View>
                        <Text className="text-base font-black text-slate-900">Minggu ke-{weekNum}</Text>
                        <Text className="text-[10px] font-bold text-slate-400 mb-1">{rekap.minggu_mulai}</Text>
                        <View className={`self-start px-2 py-0.5 rounded-full ${isPatuh ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                          <Text className={`text-[10px] font-black ${isPatuh ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {rekap.status_kepatuhan}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${isPatuh ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {isPatuh ? <CheckCircle color="#10B981" size={20} /> : <XCircle color="#F43F5E" size={20} />}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center border border-dashed border-slate-200">
                  <Calendar color="#CBD5E1" size={32} />
                  <Text className="text-slate-400 font-bold mt-2">Tidak ada data cairan</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 bg-slate-900/60 justify-center p-6">
          <View className="bg-white rounded-[32px] overflow-hidden max-h-[80%]">
            <View className="flex-row items-center justify-between p-6 border-b border-slate-100">
              <View>
                <Text className="text-xl font-black text-slate-900">Detail Kepatuhan</Text>
                <Text className="text-xs font-bold text-slate-400">
                  {detailData?.minggu_mulai ? `Minggu ${detailData.minggu_mulai}` : 'Memuat...'}
                </Text>
              </View>
              <Pressable onPress={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                <X color="#64748B" size={20} />
              </Pressable>
            </View>

            <ScrollView className="p-4">
              {isDetailLoading ? (
                <ActivityIndicator size="large" color="#0D9488" className="my-10" />
              ) : (detailData?.detail_harian && Object.keys(detailData.detail_harian).length > 0) ? (
                Object.entries(detailData.detail_harian).sort((a, b) => a[0].localeCompare(b[0])).map(([date, logs], dayIdx) => (
                  <View key={dayIdx} className="mb-6">
                    <View className="flex-row items-center mb-2 px-2">
                      <View className="w-2 h-2 rounded-full bg-teal-500 mr-2" />
                      <Text className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                        {date}
                      </Text>
                    </View>
                    
                    {logs.map((item, idx) => (
                      <View key={idx} className="bg-slate-50 rounded-2xl p-4 mb-2 border border-slate-100 flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                          detailData.type === 'obat' ? 'bg-teal-100' : 'bg-blue-100'
                        }`}>
                          {detailData.type === 'obat' ? <Pill color="#0D9488" size={20} /> : <Droplets color="#3B82F6" size={20} />}
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-black text-slate-900">
                            {detailData.type === 'obat' ? item.reminder_obat?.obat?.nama : `${item.reminder_cairan?.jumlah_ml} ml`}
                          </Text>
                          <View className="flex-row items-center">
                            <Text className="text-[10px] font-bold text-slate-500 uppercase">
                              {item.waktu} {item.reminder_obat?.merk ? `• ${item.reminder_obat.merk.nama}` : ''}
                            </Text>
                          </View>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${
                          item.status === 'diminum' ? 'bg-emerald-100' : 'bg-rose-100'
                        }`}>
                          <Text className={`text-[10px] font-black ${
                            item.status === 'diminum' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {item.status === 'diminum' ? 'PATUH' : 'TERLEWAT'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <View className="items-center py-10">
                  <Info color="#CBD5E1" size={48} />
                  <Text className="text-slate-400 font-bold mt-4">Data harian tidak ditemukan</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
