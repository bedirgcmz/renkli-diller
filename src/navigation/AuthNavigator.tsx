import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Auth Screens
import SignInScreen from "@/screens/auth/SignInScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";
import LanguageSelectionScreen from "@/screens/onboarding/LanguageSelectionScreen";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
  LanguageSelection: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
    </Stack.Navigator>
  );
}
