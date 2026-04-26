import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserMinus,
  UserPlus,
  LogOut,
  Pill,
} from 'lucide-react-native';

const C = {
  bg: '#F0F4F3',
  card: '#FFFFFF',
  border: '#EEF0EF',
  teal900: '#1A2820',
  teal700: '#0D7A6A',
  teal600: '#0D9488',
  teal100: '#E8F8F3',
  teal200: '#52C7A0',
  muted: '#9DB0AA',
  rose: '#F43F5E',
  roseBg: '#FFF0F2',
  roseBorder: '#FFD6DB',
  blue: '#3B82F6',
  blueBg: '#EFF4FF',
};

function SectionHeader({ title, onPressAll }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.teal900, letterSpacing: -0.5 }}>
        {title}
      </Text>
      {onPressAll && (
        <Pressable onPress={onPressAll} style={{ paddingVertical: 8, paddingLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.teal600 }}>Lihat Semua →</Text>
        </Pressable>
      )}
    </View>
  );
}

function MetricCard({ icon, iconBg, value, label, badge }) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1.5, borderColor: '#EEF0EF', flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, padding: 22, alignItems: 'center' }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        {icon}
      </View>
      <Text style={{ fontSize: 42, fontWeight: '800', color: C.teal900, lineHeight: 46, textAlign: 'center' }}>{value ?? 0}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, textAlign: 'center' }}>
        {label}
      </Text>
      {badge && (
        <View style={{ alignSelf: 'flex-start', backgroundColor: C.rose, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>PENTING</Text>
        </View>
      )}
    </View>
  );
}

function PatientRow({ patient, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#FFF9F9' : C.card,
        borderRadius: 24,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1.5,
        borderColor: C.border,
        borderLeftWidth: 8,
        borderLeftColor: C.rose,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
      })}
    >
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.roseBg, borderWidth: 1.5, borderColor: C.roseBorder, alignItems: 'center', justifyContent: 'center', marginRight: 18 }}>
        <UserMinus color={C.rose} size={32} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.teal900 }}>{patient.nama}</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.rose, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6 }}>
          ● {patient.last_status}
        </Text>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#F4F6F5', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight color={C.muted} size={24} />
      </View>
    </Pressable>
  );
}

function ActivityItem({ activity, isLast }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F4F6F5' }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: activity.type === 'new_patient' ? C.teal100 : '#F4F6F5', alignItems: 'center', justifyContent: 'center', marginRight: 18 }}>
        {activity.type === 'new_patient' ? <UserPlus color={C.teal700} size={28} /> : <Clock color="#64748B" size={28} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.teal900 }}>{activity.title}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 }}>
          {activity.time}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardHomeScreen({ route, navigation }) {
  const { user, onLogout } = route.params || {};
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/monitoring/today-summary');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching today summary:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setIsRefreshing(true); fetchData(); };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.teal700} />
      </View>
    );
  }

  const today = data?.today || {};
  const alerts = data?.alerts || {};
  const activities = data?.recent_activity || [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={{ backgroundColor: C.card, paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, borderBottomWidth: 1.5, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={{ fontSize: 36, fontWeight: '800', color: C.teal900, letterSpacing: -0.8, marginTop: 4 }}>
              Halo, {user?.nama?.split(' ')[0] || 'Apoteker'} 👋
            </Text>
          </View>
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => ({
              width: 56, height: 56, borderRadius: 18,
              backgroundColor: pressed ? '#FFE4E8' : C.roseBg,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1.5, borderColor: C.roseBorder,
            })}
          >
            <LogOut color={C.rose} size={24} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 22, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MAIN CARD */}
        <View style={{ backgroundColor: C.teal700, borderRadius: 32, padding: 28, shadowColor: C.teal900, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 }}>
          <View style={{ position: 'absolute', top: -35, right: -35, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <View style={{ position: 'absolute', top: 28, right: 28, width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Pill color="#fff" size={32} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Aktivitas Hari Ini
          </Text>
          <Text style={{ fontSize: 64, fontWeight: '900', color: '#fff', lineHeight: 72, marginVertical: 6 }}>
            {today.total ?? 0}
          </Text>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginBottom: 28 }}>
            Total Jadwal Obat
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 24, paddingVertical: 20 }}>
            {[
              { num: today.taken ?? 0, label: 'Diminum', color: '#fff' },
              { num: today.missed ?? 0, label: 'Tidak Patuh', color: '#FFA0AA' },
              { num: today.pending ?? 0, label: 'Antri', color: '#fff' },
            ].map(({ num, label, color }, i, arr) => (
              <View key={label} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.15)' }}>
                <Text style={{ fontSize: 30, fontWeight: '900', color, textAlign: 'center' }}>{num}</Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* METRIC CARDS */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <MetricCard icon={<AlertTriangle color={C.rose} size={22} />} iconBg={C.roseBg} value={alerts.count} label="Perlu Perhatian" badge={alerts.count > 0} />
          <View style={{ width: 12 }} />
          <MetricCard icon={<Activity color={C.blue} size={22} />} iconBg={C.blueBg} value={activities.length} label="Update Terbaru" />
        </View>

        {/* PROBLEM PATIENTS */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Pasien Bermasalah" onPressAll={() => navigation.navigate('MonitoringTab')} />
          {alerts.patients?.length > 0 ? (
            alerts.patients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onPress={() => navigation.navigate('MonitoringTab', { screen: 'PatientDetail', params: { pasien_id: patient.id } })}
              />
            ))
          ) : (
            <View style={{ backgroundColor: C.teal100, borderWidth: 2, borderColor: C.teal200, borderRadius: 22, padding: 30, alignItems: 'center' }}>
              <CheckCircle2 color={C.teal700} size={40} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.teal700, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
                Luar biasa! Semua pasien patuh hari ini.
              </Text>
            </View>
          )}
        </View>

        {/* ACTIVITY */}
        {activities.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <SectionHeader title="Aktivitas Terbaru" />
            <View style={{ backgroundColor: C.card, borderRadius: 22, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
              {activities.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} isLast={idx === activities.length - 1} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}