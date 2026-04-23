import './global.css';
import { Text, TextInput } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold, 
  Inter_800ExtraBold, 
  Inter_900Black 
} from '@expo-google-fonts/inter';

// Set global default font family
const customTextProps = {
  style: {
    fontFamily: 'Inter_400Regular',
  }
};

const customTextInputProps = {
  style: {
    fontFamily: 'Inter_400Regular',
  }
};

// Apply to Text and TextInput (safe hack for React Native)
if (Text.defaultProps) {
  Text.defaultProps.style = { ...Text.defaultProps.style, ...customTextProps.style };
} else {
  Text.defaultProps = customTextProps;
}

if (TextInput.defaultProps) {
  TextInput.defaultProps.style = { ...TextInput.defaultProps.style, ...customTextInputProps.style };
} else {
  TextInput.defaultProps = customTextInputProps;
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return <AppNavigator />;
}
