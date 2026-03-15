import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Renkli Diller</Text>
      <Text className="mt-2 text-sm text-gray-600">Welcome to the colorful languages app.</Text>
      <StatusBar style="auto" />
    </View>
  );
}
