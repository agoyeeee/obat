import { View, Text } from 'react-native';

export default function MonitoringListScreen() {
  return (
    <View className="flex-1 bg-slate-50 justify-center items-center">
      <Text className="text-xl font-bold text-slate-900">Pantau Pasien</Text>
      <Text className="text-slate-500 mt-2">Daftar kepatuhan akan muncul di sini</Text>
    </View>
  );
}
