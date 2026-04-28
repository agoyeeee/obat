import { Linking, Alert } from 'react-native';
import { fetchPublicApotekerContacts } from '../services/patientService';

const sanitizePhone = (rawPhone) => String(rawPhone || '').replace(/\D/g, '');

const pickRandomApoteker = (apotekerList) => {
  const validList = (apotekerList || []).filter((item) => sanitizePhone(item?.no_hp).length >= 10);
  if (validList.length === 0) return null;
  const idx = Math.floor(Math.random() * validList.length);
  return validList[idx];
};

export const openRandomApotekerWhatsApp = async (profile) => {
  try {
    const apotekerList = await fetchPublicApotekerContacts();
    const apoteker = pickRandomApoteker(apotekerList);

    if (!apoteker) {
      Alert.alert('Kontak Apoteker', 'Nomor WhatsApp apoteker belum tersedia.');
      return;
    }

    const patientName = profile?.nama || 'Pasien';
    const message = encodeURIComponent(
      `Halo Kak ${apoteker.nama}, saya ${patientName}. Saya ingin konsultasi terkait terapi obat saya.`
    );
    const phone = sanitizePhone(apoteker.no_hp);
    const url = `https://wa.me/${phone}?text=${message}`;

    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Error', 'Tidak dapat membuka WhatsApp atau memuat kontak apoteker.');
  }
};

export const openWhatsAppHelper = (medicineName) => {
  const name = medicineName || 'obat';
  const message = encodeURIComponent(`Halo, saya ingin bertanya terkait obat ${name}.`);
  Linking.openURL(`https://wa.me/6281234567890?text=${message}`).catch(() => {
    Alert.alert('Error', 'Tidak dapat membuka WhatsApp.');
  });
};
