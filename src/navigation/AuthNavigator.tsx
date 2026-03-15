import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Auth Screens
import AuthScreen from "@/screens/onboarding/AuthScreen";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";

export type AuthStackParamList = {
  Auth: undefined;
  ResetPassword: undefined;
  LanguageSelection: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
