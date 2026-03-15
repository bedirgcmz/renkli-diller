import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "@/screens/onboarding/AuthScreen";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}
