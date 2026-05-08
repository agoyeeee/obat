import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPublicApotekerContacts } from '../services/patientService';

const APOTEKER_CACHE_KEY = '@cached_apoteker_contacts';
const APOTEKER_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Format nomor HP ke format wa.me (convert 0xxx to 62xx)
const formatPhoneForWhatsApp = (rawPhone) => {
  let cleaned = String(rawPhone || '').replace(/\D/g, '');
  
  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  // Jika belum ada 62, tambahkan
  else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

const pickRandomApoteker = (apotekerList) => {
  const validList = (apotekerList || []).filter((item) => {
    const cleaned = String(item?.no_hp || '').replace(/\D/g, '');
    return cleaned.length >= 10;
  });
  
  if (validList.length === 0) return null;
  const idx = Math.floor(Math.random() * validList.length);
  return validList[idx];
};

const getCachedApotekerContacts = async () => {
  try {
    const cached = await AsyncStorage.getItem(APOTEKER_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age > APOTEKER_CACHE_DURATION) {
      await AsyncStorage.removeItem(APOTEKER_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('[Helper] getCachedApotekerContacts failed:', error?.message || error);
    return null;
  }
};

const setCachedApotekerContacts = async (data) => {
  try {
    await AsyncStorage.setItem(APOTEKER_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('[Helper] setCachedApotekerContacts failed:', error?.message || error);
  }
};

export const openRandomApotekerWhatsApp = async (profile) => {
  try {
    // Try cache first
    let apotekerList = await getCachedApotekerContacts();
    
    // If not cached, fetch from API
    if (!apotekerList) {
      apotekerList = await fetchPublicApotekerContacts();
      if (Array.isArray(apotekerList) && apotekerList.length > 0) {
        await setCachedApotekerContacts(apotekerList);
      }
    }
    
    const apoteker = pickRandomApoteker(apotekerList);

    if (!apoteker) {
      Alert.alert(
        'Kontak Apoteker',
        'Nomor WhatsApp apoteker belum tersedia. Silakan hubungi administrator untuk menambahkan nomor apoteker.'
      );
      return;
    }

    const patientName = profile?.nama || 'Pasien';
    const message = encodeURIComponent(
      `Halo Kak ${apoteker.nama}, saya ${patientName}. Saya ingin konsultasi terkait terapi obat saya.`
    );
    const phone = formatPhoneForWhatsApp(apoteker.no_hp);
    const url = `https://wa.me/${phone}?text=${message}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        'WhatsApp Tidak Tersedia',
        'Aplikasi WhatsApp tidak terinstall di perangkat Anda. Silakan instal WhatsApp terlebih dahulu.'
      );
      return;
    }

    await Linking.openURL(url);
  } catch (error) {
    console.error('[Helper] openRandomApotekerWhatsApp error:', error?.message || error);
    Alert.alert(
      'Terjadi Kesalahan',
      'Tidak dapat membuka WhatsApp. ' + (error?.message || 'Coba lagi nanti.')
    );
  }
};

export const openWhatsAppHelper = (medicineName) => {
  const name = medicineName || 'obat';
  const message = encodeURIComponent(`Halo, saya ingin bertanya terkait obat ${name}.`);
  Linking.openURL(`https://wa.me/6281234567890?text=${message}`).catch(() => {
    Alert.alert('Error', 'Tidak dapat membuka WhatsApp.');
  });
};
