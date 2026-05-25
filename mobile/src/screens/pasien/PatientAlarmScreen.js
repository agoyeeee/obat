import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StatusBar, Animated, PanResponder, useWindowDimensions } from 'react-native';
import { Audio } from 'expo-av';
import { BellRing, ArrowRight, Volume2 } from 'lucide-react-native';

const pad = (value) => String(value).padStart(2, '0');

const formatClock = (date = new Date()) => {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatDate = (date = new Date()) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function PatientAlarmScreen({ route, navigation, onTaken }) {
  const alarmSoundRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = useWindowDimensions().width;

  const data = route?.params || {};
  const title = data.title || 'Waktunya minum obat';
  const body = data.body || 'Alarm aktif. Silakan minum obat sesuai jadwal.';
  const [currentTime, setCurrentTime] = useState(formatClock(new Date()));
  const isNotificationAlarmLaunch =
    data.launchSource === 'notificationTap' && Boolean(data.reminderObatId || data.reminderLocalId);

  const stopAlarm = useCallback(async () => {
    if (alarmSoundRef.current) {
      await alarmSoundRef.current.stopAsync().catch(() => {});
      await alarmSoundRef.current.unloadAsync().catch(() => {});
      alarmSoundRef.current = null;
    }

    if (typeof onTaken === 'function') {
      const now = new Date();
      await onTaken({
        ...data,
        loggedAt: now.toISOString(),
        tanggal: formatDate(now),
        waktu: formatClock(now),
      });
    }

    // Try goBack first, otherwise reset to root
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: navigation.getState()?.routeNames?.find(r => r !== 'PatientAlarm') || 'Entry' }],
      });
    }
  }, [data, navigation, onTaken]);

  useEffect(() => {
    if (!isNotificationAlarmLaunch) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentTime(formatClock(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, [isNotificationAlarmLaunch]);

  useEffect(() => {
    if (!isNotificationAlarmLaunch) {
      if (navigation.canGoBack?.()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: navigation.getState()?.routeNames?.find(r => r !== 'PatientAlarm') || 'Entry' }],
        });
      }
      return;
    }

    let mounted = true;

    const startSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/alarm-sound.wav'),
          { shouldPlay: true, isLooping: true, volume: 1 }
        );
        if (!mounted) {
          await sound.unloadAsync();
          return;
        }
        alarmSoundRef.current = sound;
        await sound.playAsync();
      } catch (error) {
        console.log('Failed to start full-screen alarm sound:', error);
      }
    };

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.84,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    startSound();

    return () => {
      mounted = false;
      pulse.stop();
      if (alarmSoundRef.current) {
        alarmSoundRef.current.stopAsync().catch(() => {});
        alarmSoundRef.current.unloadAsync().catch(() => {});
        alarmSoundRef.current = null;
      }
    };
  }, [isNotificationAlarmLaunch, navigation, pulseAnim]);

  const resetSwipe = useCallback(() => {
    Animated.spring(swipeAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
      tension: 70,
    }).start();
  }, [swipeAnim]);

  const finishSwipe = useCallback(() => {
    Animated.timing(swipeAnim, {
      toValue: screenWidth - 40,
      duration: 180,
      useNativeDriver: true,
    }).start(stopAlarm);
  }, [screenWidth, stopAlarm, swipeAnim]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 8,
      onPanResponderMove: (_, gestureState) => {
        const next = Math.max(0, Math.min(gestureState.dx, screenWidth - 40));
        swipeAnim.setValue(next);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > screenWidth * 0.55) {
          finishSwipe();
        } else {
          resetSwipe();
        }
      },
      onPanResponderTerminate: () => resetSwipe(),
    }),
    [finishSwipe, resetSwipe, screenWidth, swipeAnim]
  );

  if (!isNotificationAlarmLaunch) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#120F16]">
      <StatusBar hidden />

      <View className="flex-1 justify-center items-center px-6">
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-36 h-36 rounded-full bg-[#2A1C24] items-center justify-center mb-8 border-4 border-[#FF4D6D]/20"
        >
          <BellRing color="#FF4D6D" size={72} />
        </Animated.View>

        <Text className="text-[#FFD6DD] text-xs font-black uppercase tracking-[6px] mb-3">Alarm Obat</Text>
        <Text className="text-white text-3xl font-black text-center leading-tight">{title}</Text>
        <Text className="text-[#D8C7CF] text-base text-center mt-4 leading-7 max-w-[320px]">
          {body}
        </Text>

        <View className="mt-8 px-5 py-3 rounded-full bg-white/10 border border-white/10 flex-row items-center">
          <Volume2 color="#fff" size={18} />
          <Text className="text-white text-4xl font-black tracking-[6px] ml-3">{currentTime}</Text>
        </View>
      </View>

      <View className="px-6 pb-10">
        <View className="mb-4 items-center">
          <Text className="text-[#9F8FA2] text-xs font-black uppercase tracking-[5px] mb-2">Geser ke kanan untuk mematikan</Text>
          <View className="w-full h-16 rounded-[22px] bg-white/8 border border-white/10 overflow-hidden justify-center">
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [{ translateX: swipeAnim }],
              }}
              className="w-16 h-16 rounded-[22px] bg-[#FF4D6D] items-center justify-center"
            >
              <ArrowRight color="#fff" size={24} />
            </Animated.View>
          </View>
        </View>

        <Text className="text-[#AA9BAE] text-center text-xs leading-5">
          Jangan tutup aplikasi. Jika alarm muncul, geser handle merah sampai penuh ke kanan.
        </Text>
      </View>
    </View>
  );
}
