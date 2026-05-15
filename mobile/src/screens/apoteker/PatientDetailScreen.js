import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, Droplets, Pill, Calendar, X, Info, ChevronRight } from 'lucide-react-native';
import { formatDateDDMMYY } from '../../utils/date';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const WEEKDAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
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
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setIsLoading(true);
        const [pasienRes, monitoringRes, cairanRes] = await Promise.all([
          api.get(`/pasien/${pasien_id}`),
          api.get(`/monitoring/bulanan?pasien_id=${pasien_id}&month=${selectedMonth}&year=${selectedYear}`),
          api.get(`/rekapan-cairan?pasien_id=${pasien_id}`)
        ]);

        setPasien(pasienRes.data);
        setRekapanObat(monitoringRes.data.weeks.map(w => ({ ...w, ...w.obat })));
        setRekapanCairan(cairanRes.data || []);
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
      setExpandedDate(null);
      if (type === 'cairan') {
        // Fetch rekapan cairan list
        const listRes = await api.get(`/rekapan-cairan?pasien_id=${pasien_id}`);
        const rekap = (listRes.data || []).find(r => r.minggu_mulai === startDate || r.minggu_mulai === formatDateDDMMYY(startDate) || r.minggu_mulai?.startsWith(startDate));

        if (rekap) {
          // Fetch detail logs
          const detailRes = await api.get(`/rekapan-cairan/${rekap.id}`);
          const logs = detailRes.data.detail_harian || [];
          const totalMl = detailRes.data.total_ml || 0;

          // Group logs by tanggal for accordion
          const logsByDate = {};
          logs.forEach(log => {
            const dateKey = log.tanggal;
            if (!logsByDate[dateKey]) {
              logsByDate[dateKey] = [];
            }
            logsByDate[dateKey].push({
              ...log,
              reminder_cairan: {
                jumlah_ml: log.jumlah_ml,
                minuman: log.minuman,
                waktu: log.waktu,
                catatan_asupan: log.catatan_asupan,
              }
            });
          });

          setDetailData({ 
            detail_harian: logsByDate, 
            minggu_mulai: startDate, 
            type,
            total_ml: totalMl,
            status_kepatuhan: detailRes.data.status_kepatuhan,
          });
        } else {
          setDetailData({ detail_harian: {}, minggu_mulai: startDate, type, total_ml: 0, status_kepatuhan: 'BELUM_ADA_DATA' });
        }
      } else {
        const res = await api.get(`/monitoring/mingguan?pasien_id=${pasien_id}&start_date=${startDate}`);
        const logs = res.data.obat.logs;
        setDetailData({ detail_harian: logs, minggu_mulai: startDate, type });
      }
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

  const dailyDetailEntries = useMemo(() => {
    if (!detailData?.detail_harian) return [];

    const sortedEntries = Object.entries(detailData.detail_harian)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

    const groupedLogs = sortedEntries.map(([date, logs]) => ({
      date,
      dayLabel: WEEKDAYS[new Date(date).getDay()] || '',
      logs: [...logs].sort((a, b) => String(a.waktu || '').localeCompare(String(b.waktu || ''))),
    }));

    if (detailData.type === 'cairan') {
      return groupedLogs.map((entry) => {
        const totalMl = entry.logs.reduce((sum, log) => sum + Number(log.jumlah_ml || 0), 0);

        return {
          ...entry,
          totalMl,
          status_kepatuhan: totalMl >= 900 ? 'PATUH' : 'TIDAK PATUH',
        };
      });
    }

    const consumedCountByReminder = new Map();

    groupedLogs.forEach((entry) => {
      entry.logs.forEach((log) => {
        if (log.status !== 'diminum') {
          return;
        }

        const reminderId = log.reminder_obat?.id ?? log.reminder_obat_id;
        if (!reminderId) {
          return;
        }

        const reminder = log.reminder_obat || {};
        const perDose = Math.max(1, Number(reminder.jumlah_per_minum ?? 1));
        const previousConsumed = consumedCountByReminder.get(reminderId) || 0;
        consumedCountByReminder.set(reminderId, previousConsumed + perDose);
      });
    });

    const startingStockByReminder = new Map();
    consumedCountByReminder.forEach((consumedAmount, reminderId) => {
      const reminder = groupedLogs
        .flatMap((entry) => entry.logs)
        .find((log) => (log.reminder_obat?.id ?? log.reminder_obat_id) === reminderId)?.reminder_obat;

      const currentStock = Number(reminder?.jumlah_obat ?? 0);
      startingStockByReminder.set(reminderId, currentStock + consumedAmount);
    });

    const runningConsumedByReminder = new Map();

    return groupedLogs.map((entry) => ({
      ...entry,
      logs: entry.logs.map((log) => {
        const reminderId = log.reminder_obat?.id ?? log.reminder_obat_id;
        if (!reminderId) {
          return { ...log, stock_remaining: null };
        }

        const reminder = log.reminder_obat || {};
        const perDose = Math.max(1, Number(reminder.jumlah_per_minum ?? 1));
        const startingStock = startingStockByReminder.get(reminderId) ?? Number(reminder.jumlah_obat ?? 0);
        const consumedBeforeThisLog = runningConsumedByReminder.get(reminderId) || 0;
        const stockRemaining = Math.max(0, startingStock - consumedBeforeThisLog - (log.status === 'diminum' ? perDose : 0));

        if (log.status === 'diminum') {
          runningConsumedByReminder.set(reminderId, consumedBeforeThisLog + perDose);
        }

        return { ...log, stock_remaining: stockRemaining };
      }),
    }));
  }, [detailData]);

  const renderObatLogDetail = (item, index) => {
    const isTaken = item.status === 'diminum';
    const score = item.skor ?? (isTaken ? 1 : 0);
    const reminder = item.reminder_obat || {};
    const alarmTime = reminder.waktu_konsumsi?.jam || '-';
    const alarmLabel = reminder.waktu_konsumsi?.label_waktu || '';
    const recordedTime = item.waktu || '-';
    const stockRemaining = item.stock_remaining ?? reminder.jumlah_obat ?? '-';

    const DetailRow = ({ label, value }) => (
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-xs font-bold text-[#9DB0AA] flex-1">{label}</Text>
        <Text className="text-xs font-bold text-[#1A2820] flex-1 text-right">{value}</Text>
      </View>
    );

    return (
      <View key={`${item.id ?? item.waktu ?? index}-${index}`} className="bg-[#F8FAFA] rounded-[22px] p-4 mb-3 border-[1.5px] border-[#EEF0EF]">
        {/* Header dengan nama obat dan status */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#1A2820]">
              {reminder.obat?.nama_obat || reminder.obat?.nama || 'Obat'}
            </Text>
            {reminder.merk?.nama && (
              <Text className="text-xs font-bold text-[#9DB0AA] mt-1">
                {reminder.merk.nama}
              </Text>
            )}
          </View>
          <View className={`px-3 py-1.5 rounded-xl ${isTaken ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
            <Text className={`text-xs font-black tracking-wider ${isTaken ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
              {isTaken ? 'PATUH' : 'TIDAK PATUH'}
            </Text>
          </View>
        </View>

        {/* Detail informasi reminder */}
        <View className="bg-white rounded-lg p-3 mb-3">
          <DetailRow label="Dosis" value={reminder.dosis || '-'} />
          <DetailRow label="Sediaan" value={reminder.sediaan || '-'} />
          <DetailRow label="Jumlah/Minum" value={reminder.jumlah_per_minum ? `${reminder.jumlah_per_minum}` : '-'} />
          <DetailRow label="Sisa Stok" value={stockRemaining !== '-' ? `${stockRemaining}` : '-'} />
          {reminder.cara_pemakaian && (
            <DetailRow label="Cara Pakai" value={reminder.cara_pemakaian} />
          )}
        </View>

        {/* Jadwal dan waktu */}
        <View className="bg-white rounded-lg p-3 mb-3">
          <DetailRow label="🔔 Alarm" value={`${alarmTime}${alarmLabel ? ` (${alarmLabel})` : ''}`} />
          <DetailRow label="⏹️ Dicatat Jam" value={recordedTime} />
        </View>

        {/* Status badges */}
        <View className="flex-row items-center flex-wrap">
          <View className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${isTaken ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
            <Text className={`text-xs font-black uppercase tracking-wider ${isTaken ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
              {item.status === 'diminum' ? 'Diminum' : 'Terlewat'}
            </Text>
          </View>
          <View className="px-3 py-1.5 rounded-full bg-[#F4F6F5]">
            <Text className="text-xs font-black uppercase tracking-wider text-[#64748B]">
              Skor {score}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCairanLogDetail = (item, index) => {
    const reminder = item.reminder_cairan || {};
    const jumlahMl = item.jumlah_ml || reminder.jumlah_ml || '-';
    const minuman = item.minuman || reminder.minuman || '-';
    const waktu = item.waktu || reminder.waktu || '-';
    const catatanAsupan = item.catatan_asupan || reminder.catatan_asupan || '-';

    const DetailRow = ({ label, value }) => (
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-xs font-bold text-[#9DB0AA] flex-1">{label}</Text>
        <Text className="text-xs font-bold text-[#1A2820] flex-1 text-right">{value}</Text>
      </View>
    );

    return (
      <View key={`${item.id ?? item.waktu ?? index}-cairan-${index}`} className="bg-[#F8FAFA] rounded-[22px] p-4 mb-3 border-[1.5px] border-[#EEF0EF]">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#1A2820]">{minuman}</Text>
            <Text className="text-sm font-bold text-[#0D7A6A] mt-1">{jumlahMl} ml</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg p-3 mb-3">
          <DetailRow label="Waktu Asupan" value={waktu} />
          <DetailRow label="Jumlah" value={`${jumlahMl} ml`} />
          {catatanAsupan !== '-' && (
            <DetailRow label="Catatan" value={catatanAsupan} />
          )}
        </View>
      </View>
    );
  };

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
                      <View className="flex-1 pr-3">
                        <Text className="text-lg font-black text-[#1A2820]">Minggu ke-{weekNum}</Text>
                        <Text className="text-xs font-bold text-[#9DB0AA] mt-1">{formatDateDDMMYY(rekap.minggu_mulai)}</Text>
                        <View className={`self-start px-3 py-1.5 rounded-full mt-3 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          <Text className={`text-xs font-black uppercase tracking-wider ${isPatuh ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`w-14 h-14 rounded-full items-center justify-center mr-2 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                        </View>
                        <ChevronRight color="#CBD5E1" size={24} />
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
                      <View className="flex-1 pr-3">
                        <Text className="text-lg font-black text-[#1A2820]">Minggu ke-{weekNum}</Text>
                        <Text className="text-xs font-bold text-[#9DB0AA] mt-1">{formatDateDDMMYY(rekap.minggu_mulai)}</Text>
                        <View className={`self-start px-3 py-1.5 rounded-full mt-3 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          <Text className={`text-xs font-black uppercase tracking-wider ${isPatuh ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                            {isPatuh ? 'PATUH' : 'TIDAK PATUH'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`w-14 h-14 rounded-full items-center justify-center mr-2 ${isPatuh ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                          {isPatuh ? <CheckCircle color="#10B981" size={32} /> : <XCircle color="#F43F5E" size={32} />}
                        </View>
                        <ChevronRight color="#CBD5E1" size={24} />
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
                {detailData?.type === 'cairan' && (
                  <View className="flex-row items-center mt-3 gap-3">
                    <View className={`px-3 py-1.5 rounded-full ${detailData.status_kepatuhan === 'PATUH' ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                      <Text className={`text-xs font-black uppercase tracking-wider ${detailData.status_kepatuhan === 'PATUH' ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                        {detailData.status_kepatuhan === 'PATUH' ? 'PATUH' : 'TIDAK PATUH'}
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-[#0D7A6A]">{detailData.total_ml ?? 0} / 900 ml</Text>
                  </View>
                )}
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
              ) : detailData?.type === 'obat' ? (
                dailyDetailEntries.length > 0 ? (
                  dailyDetailEntries.map((day) => {
                    const isExpanded = expandedDate === day.date;

                    return (
                      <View key={day.date} className="mb-4 bg-white rounded-[28px] border-[1.5px] border-[#EEF0EF] overflow-hidden">
                        <Pressable
                          onPress={() => setExpandedDate(isExpanded ? null : day.date)}
                          className="flex-row items-center justify-between p-5 active:bg-[#F8FAFA]"
                        >
                          <View className="flex-row items-center flex-1 pr-3">
                            <View className="w-12 h-12 rounded-2xl bg-[#E8F8F3] items-center justify-center mr-4">
                              <Pill color="#0D7A6A" size={24} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-lg font-black text-[#1A2820]">
                                {day.dayLabel}
                              </Text>
                              <Text className="text-xs font-bold text-[#9DB0AA] mt-1 uppercase tracking-wider">
                                {formatDateDDMMYY(day.date)}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center">
                            <Text className="text-xs font-black uppercase tracking-widest text-[#0D7A6A] mr-3">
                              {day.logs.length} data
                            </Text>
                            <ChevronRight color="#CBD5E1" size={22} style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} />
                          </View>
                        </Pressable>

                        {isExpanded && (
                          <View className="px-5 pb-5">
                            {day.logs.length > 0 ? (
                              day.logs.map(renderObatLogDetail)
                            ) : (
                              <View className="bg-[#F8FAFA] rounded-[22px] p-5 border-[1.5px] border-[#EEF0EF] items-center">
                                <Text className="text-sm font-bold text-[#9DB0AA]">
                                  Tidak ada log obat di hari ini
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View className="items-center py-16">
                    <Info color="#CBD5E1" size={64} />
                    <Text className="text-[#9DB0AA] text-base font-bold mt-5">Data obat tidak ditemukan</Text>
                  </View>
                )
              ) : detailData?.detail_harian && Object.keys(detailData.detail_harian).length > 0 ? (
                dailyDetailEntries.length > 0 ? (
                  dailyDetailEntries.map((day) => {
                    const isExpanded = expandedDate === day.date;
                    const dayTotalMl = detailData.type === 'cairan'
                      ? (day.totalMl || 0)
                      : day.logs.reduce((sum, log) => sum + (log.jumlah_ml || 0), 0);
                    const dayStatus = detailData.type === 'cairan' ? day.status_kepatuhan : null;

                    return (
                      <View key={day.date} className="mb-4 bg-white rounded-[28px] border-[1.5px] border-[#EEF0EF] overflow-hidden">
                        <Pressable
                          onPress={() => setExpandedDate(isExpanded ? null : day.date)}
                          className="flex-row items-center justify-between p-5 active:bg-[#F8FAFA]"
                        >
                          <View className="flex-row items-center flex-1 pr-3">
                            <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                              <Droplets color="#0D7A6F" size={24} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-lg font-black text-[#1A2820]">{day.dayLabel}</Text>
                              <Text className="text-xs font-bold text-[#9DB0AA] mt-1 uppercase tracking-wider">{formatDateDDMMYY(day.date)}</Text>
                              <Text className="text-sm font-bold text-[#0D7A6A] mt-2">{dayTotalMl} ml</Text>
                              {detailData.type === 'cairan' && dayStatus && (
                                <View className={`self-start px-3 py-1.5 rounded-full mt-3 ${dayStatus === 'PATUH' ? 'bg-[#E8F8F3]' : 'bg-[#FFF0F2]'}`}>
                                  <Text className={`text-xs font-black uppercase tracking-wider ${dayStatus === 'PATUH' ? 'text-[#0D7A6A]' : 'text-[#F43F5E]'}`}>
                                    {dayStatus === 'PATUH' ? 'PATUH' : 'TIDAK PATUH'}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          <View className="flex-row items-center">
                            <Text className="text-xs font-black uppercase tracking-widest text-[#0D7A6A] mr-3">{day.logs.length} data</Text>
                            <ChevronRight color="#CBD5E1" size={22} style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} />
                          </View>
                        </Pressable>

                        {isExpanded && (
                          <View className="px-5 pb-5">
                            {day.logs.length > 0 ? (
                              day.logs.map(renderCairanLogDetail)
                            ) : (
                              <View className="bg-[#F8FAFA] rounded-[22px] p-5 border-[1.5px] border-[#EEF0EF] items-center">
                                <Text className="text-sm font-bold text-[#9DB0AA]">Tidak ada log cairan di hari ini</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View className="items-center py-16">
                    <Info color="#CBD5E1" size={64} />
                    <Text className="text-[#9DB0AA] text-base font-bold mt-5">Data cairan tidak ditemukan</Text>
                  </View>
                )
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