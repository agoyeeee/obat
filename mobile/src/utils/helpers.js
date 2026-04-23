import { Linking, Alert } from 'react-native';

export const openWhatsAppHelper = (medicineName) => {
  const name = medicineName || 'obat';
  const message = encodeURIComponent(`Halo, saya ingin bertanya terkait obat ${name}.`);
  Linking.openURL(`https://wa.me/6281234567890?text=${message}`).catch(() => {
    Alert.alert('Error', 'Tidak dapat membuka WhatsApp.');
  });
};
