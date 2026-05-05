import { View, Text, Pressable, ScrollView, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LogOut,
  UserRound,
  Bell,
  Droplets,
  MessageCircle,
  ClipboardList,
  AlertTriangle,
  Activity,
  CalendarDays,
  ChevronRight,
  Pencil,
  HeartPulse,
  Pill,
} from 'lucide-react-native';

export default function PatientDashboardScreen({ profile, onEditProfile, onBack, onOpenMenu }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (isMounted.current) setIsRefreshing(false);
    }, 600);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const formatDisplayDate = (iso) => {
    if (!iso) return '-';
    const datePart = String(iso).split('T')[0];
    const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${m[3]} ${months[parseInt(m[2]) - 1]} ${m[1]}`;
  };

  const openMenu = (menuKey, menuName) => {
    if (onOpenMenu) return onOpenMenu(menuKey);
    Alert.alert('Menu', `${menuName} akan dibuka di update berikutnya.`);
  };

  const menuItems = [
    {
      key: 'obat',
      title: 'Reminder Obat',
      subtitle: 'Jadwal & tracking',
      icon: <Pill color="#fff" size={20} />,
      gradientColors: ['#6366F1', '#818CF8'],
    },
    {
      key: 'cairan',
      title: 'Cairan Harian',
      subtitle: 'Pantau target minum',
      icon: <Droplets color="#fff" size={20} />,
      gradientColors: ['#0EA5E9', '#38BDF8'],
    },
    {
      key: 'tanya',
      title: 'Tanya Apoteker',
      subtitle: 'Konsultasi cepat',
      icon: <MessageCircle color="#fff" size={20} />,
      gradientColors: ['#10B981', '#34D399'],
    },
    {
      key: 'kuisioner',
      title: 'Kuisioner',
      subtitle: 'Evaluasi kondisi',
      icon: <ClipboardList color="#fff" size={20} />,
      gradientColors: ['#F59E0B', '#FCD34D'],
    },
  ];

  const firstName = profile?.nama?.split(' ')[0] || 'Pasien';

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <StatusBar style="dark" />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#0D9488', '#14B8A6', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: 30,
          paddingHorizontal: 24,
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

        {/* Top row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{
              color: '#C7D2FE', fontSize: 11, letterSpacing: 1.5,
              textTransform: 'uppercase', fontWeight: '600',
            }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 3 }}>
              {getGreeting()}, {firstName} 👋
            </Text>
          </View>

          <Pressable
            onPress={onBack}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: '#ffffff25',
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
              borderWidth: 1, borderColor: '#ffffff40',
            })}
          >
            <LogOut color="#fff" size={18} />
          </Pressable>
        </View>

        {/* Health status pill */}
        <View style={{
          marginTop: 20, flexDirection: 'row', alignItems: 'center',
          gap: 8, alignSelf: 'flex-start',
          backgroundColor: '#ffffff25', paddingHorizontal: 14, paddingVertical: 8,
          borderRadius: 50, borderWidth: 1, borderColor: '#ffffff40',
        }}>
          <HeartPulse color="#fff" size={14} />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
            Status: Terpantau Aktif
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ── FLOATING PROFILE CARD ── */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 20,
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: 20,
          shadowColor: '#0D9488',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LinearGradient
                colors={['#0D9488', '#14b8a6']}
                style={{
                  width: 46, height: 46, borderRadius: 15,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <UserRound color="#fff" size={20} />
              </LinearGradient>
              <View>
                <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15 }}>
                  {profile?.nama || 'Pasien'}
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>Data Pribadi</Text>
              </View>
            </View>

            <Pressable
              onPress={onEditProfile}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: '#F1F5F9',
                paddingHorizontal: 12, paddingVertical: 7,
                borderRadius: 10,
              }}
            >
              <Pencil color="#0D9488" size={12} />
              <Text style={{ color: '#0D9488', fontSize: 12, fontWeight: '700' }}>Edit</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { label: 'Usia', value: profile?.usia || '—', unit: 'thn' },
              { label: 'Berat', value: profile?.berat_badan || '—', unit: 'kg' },
              { label: 'Gender', value: profile?.jenis_kelamin || '—', unit: '' },
            ].map((item, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                  <Text style={{ color: '#1E293B', fontSize: 22, fontWeight: '900' }}>{item.value}</Text>
                  {item.unit ? (
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 3 }}>{item.unit}</Text>
                  ) : null}
                </View>
                <Text style={{
                  color: '#94A3B8', fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
                }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── MENU UTAMA ── */}
        <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>Menu Utama</Text>
            <Text style={{ color: '#94A3B8', fontSize: 12 }}>4 fitur tersedia</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
            {menuItems.map((item) => (
              <View key={item.key} style={{ width: '50%', padding: 6 }}>
                <Pressable
                  onPress={() => openMenu(item.key, item.title)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 22, padding: 18, minHeight: 136,
                      justifyContent: 'space-between',
                      shadowColor: item.gradientColors[0],
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 8,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Decorative circle inside card */}
                    <View style={{
                      position: 'absolute', top: -20, right: -20,
                      width: 90, height: 90, borderRadius: 45,
                      backgroundColor: '#ffffff18',
                    }} />

                    <View style={{
                      width: 44, height: 44, borderRadius: 14,
                      backgroundColor: '#ffffff30',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.icon}
                    </View>

                    <View>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: '#ffffffBB', fontSize: 11, marginTop: 3 }}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* ── DIAGNOSA ── */}
        <View style={{ marginHorizontal: 20, marginTop: 16 }}>
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 18, padding: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              shadowColor: '#64748B',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 10,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: '#EEF2FF',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <CalendarDays size={18} color="#6366F1" />
                </View>
                <View>
                  <Text style={{
                    color: '#94A3B8', fontSize: 10,
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    Tanggal Diagnosa
                  </Text>
                  <Text style={{ color: '#1E293B', fontWeight: '800', fontSize: 15, marginTop: 2 }}>
                    {formatDisplayDate(profile?.tgl_diagnosa)}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── EDIT BIODATA BUTTON ── */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={onEditProfile}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <LinearGradient
              colors={['#0D9488', '#14B8A6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 16, borderRadius: 18,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 10,
                shadowColor: '#0D9488',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Pencil color="#fff" size={16} />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>
                Ubah Biodata
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}