import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BellRing, Check, X, Maximize2, Pill } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FloatingAlarmModal({
  alarm,
  onDismiss,
  onOpenFullScreen,
  onTakeMedicine,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (alarm) {
      // Denyut animasi ikon lonceng
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      // Slide-up dialog
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }).start();

      pulse.start();

      return () => {
        pulse.stop();
      };
    } else {
      slideAnim.setValue(30);
    }
  }, [alarm, pulseAnim, slideAnim]);

  if (!alarm) return null;

  const isTest = Boolean(alarm.isTest || alarm.is_test);
  const title = alarm.title || 'Waktunya Minum Obat';
  const body = alarm.body || 'Silakan minum obat sesuai petunjuk dokter.';
  const medicineName = alarm.nama_obat || alarm.medicineName || title;
  const dose = alarm.dosis || alarm.dose || '';
  const time = alarm.alarmWaktu || alarm.time || '';

  return (
    <Modal
      visible={Boolean(alarm)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: isTest ? '#F59E0B' : '#0D9488',
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Bar: Drag handle + Close button '✕' */}
          <View style={styles.topBar}>
            <View style={styles.dragHandle} />
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.btnClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={15} color="#94A3B8" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Header pill badge & time */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isTest
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(13, 148, 136, 0.2)',
                  borderColor: isTest
                    ? 'rgba(245, 158, 11, 0.5)'
                    : 'rgba(13, 148, 136, 0.5)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isTest ? '#FCD34D' : '#5EEAD4' },
                ]}
              >
                {isTest ? '⚡ UJI COBA ALARM' : '🔔 JADWAL MINUM OBAT'}
              </Text>
            </View>

            <Text style={styles.timeText}>
              {time ? (time.includes(':') ? `${time.substring(0, 5)} WIB` : time) : 'Sekarang'}
            </Text>
          </View>

          {/* Icon & Medicine Info */}
          <View style={styles.contentRow}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isTest
                    ? 'rgba(245, 158, 11, 0.18)'
                    : 'rgba(13, 148, 136, 0.2)',
                  borderColor: isTest ? 'rgba(245, 158, 11, 0.6)' : '#0D9488',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Pill
                size={26}
                color={isTest ? '#F59E0B' : '#2DD4BF'}
                strokeWidth={2.2}
              />
            </Animated.View>

            <View style={styles.infoCol}>
              <Text style={styles.medicineTitle} numberOfLines={2}>
                {medicineName}
              </Text>
              {dose ? (
                <Text style={styles.doseText}>Dosis: {dose}</Text>
              ) : (
                <Text style={styles.bodyText} numberOfLines={2}>
                  {body}
                </Text>
              )}
            </View>
          </View>

          {/* Single Action Button: Sudah Minum Obat */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => onTakeMedicine?.(alarm)}
              style={styles.btnPrimary}
              activeOpacity={0.85}
            >
              <Check size={18} color="#fff" strokeWidth={2.8} />
              <Text style={styles.btnPrimaryText}>Sudah Minum Obat</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(width - 36, 400),
    backgroundColor: '#0F172A', // Slate-900 dark theme
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
  },
  topBar: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  btnClose: {
    position: 'absolute',
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  medicineTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  doseText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  bodyText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  actionsContainer: {
    marginTop: 2,
  },
  btnPrimary: {
    backgroundColor: '#0D9488', // Vibrant Teal-600
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
