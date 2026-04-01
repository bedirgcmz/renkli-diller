import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { View, ActivityIndicator } from "react-native";

// Screens
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, initialized, initialize } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      await loadSettings();
    };
    initApp().catch((e) => console.error("[AppNavigator] init failed:", e));
  }, [initialize, loadSettings]);

  // Show loading while initializing
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated - show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not authenticated - show auth flow
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AuthFlow" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
